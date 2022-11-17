import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Query } from "../entity/Query";
import { Page } from "../entity/Page";
import { PageData } from "../entity/PageData";

interface Filters {
  suchvolumen: { from: number; to: number };
  position: { from: number; to: number };
  impressions: { from: number; to: number };
  dates: { start: string; end: string };
  queryTyp: string;
  query: string;
}

export async function fetchAll(req: Request, res: Response) {
  let data: any;
  let order: any;
  let direction: any;

  req.query.order !== undefined
    ? (order = req.query.order.toString())
    : undefined;
  req.query.direction !== undefined
    ? (direction = req.query.direction.toString())
    : undefined;

  const skip = Number(req.query.skip);
  const take =
    req.query.take === undefined ? undefined : Number(req.query.take);
  const hasFilters = req.body.hasFilter;
  const filters = req.body.filters;

  if (hasFilters) {
    data = await getFilteredData(filters, skip, take, order, direction);

    return res.status(200).send({
      data: data[0],
      length: data[1],
    });
  }

  let query = AppDataSource.getRepository(Page)
    .createQueryBuilder("page")
    .leftJoinAndSelect("page.pages", "pages")

  if (order && direction) {
    order === "name" 
      ? query.orderBy(`page.${order}`, direction.toUpperCase())
      : query.orderBy(`pages.${order}`, direction.toUpperCase());
  } else {
    query.orderBy("page.created_at", "DESC");
  }
  query.where(
    `DATE(page.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
  );
  skip !== undefined ? query.skip(skip) : query.skip(0);
  take !== undefined ? query.take(take) : query.take(10);

  data = await query.getManyAndCount();

  const pageDataRepo = AppDataSource.getRepository(PageData);
  const result = await pageDataRepo
    .createQueryBuilder("page_data")
    .select("SUM(page_data.clicks)", "totalClicks")
    .where(
      `DATE(page_data.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    )
    .addSelect("SUM(page_data.impressions)", "totalImpressions")
    .addSelect("AVG(page_data.position)", "avgPosition")
    .addSelect("AVG(page_data.ctr)", "avgCtr")
    .getRawOne();

  if (!result) {
    return;
  }

  return res.status(200).send({
    data: data[0],
    length: data[1],
    result,
  });
}

async function getFilteredData(
  filters: Filters,
  skip: number | undefined,
  take: number | undefined,
  order: string,
  direction: any
) {
  let qr = AppDataSource.getRepository(Page)
    .createQueryBuilder("page")
    .leftJoinAndSelect("page.pages", "pages");

  skip ? qr.skip(skip) : qr.skip(0);
  take ? qr.take(take) : qr.take(10);
  if (order && direction) {
    console.log(order, direction);
    order === "name"
      ? qr.orderBy(`page.${order}`, direction.toUpperCase())
      : qr.orderBy(`pages.${order}`, direction.toUpperCase());
  } else {
    qr.orderBy("page.created_at", "DESC");
  }

  if (filters.dates.start !== null && filters.dates.end !== null) {
    qr.andWhere(
      `DATE(page.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    );
  }
  if (filters.impressions.from) {
    if (filters.impressions.to) {
      qr.andWhere(
        `pages.impressions >= ${filters.impressions.from} AND pages.impressions <= ${filters.impressions.to}`
      );
    } else {
      qr.andWhere(`pages.impressions >= ${filters.impressions.from}`);
    }
  } else if (filters.impressions.to) {
    qr.andWhere(`pages.impressions <= ${filters.impressions.to}`);
  }
  if (filters.position.from) {
    if (filters.position.to) {
      qr.andWhere(
        `pages.position >= ${filters.position.from} AND pages.position <= ${filters.position.to}`
      );
    } else {
      qr.andWhere(`pages.position >= ${filters.position.from}`);
    }
  } else if (filters.position.to) {
    qr.andWhere(`pages.position <= ${filters.position.to}`);
  }
  if (filters.query !== "") {
    qr.andWhere(`page.name LIKE '%${filters.query}%'`);
  }

  const pages = await qr.getManyAndCount();
  console.log(pages);
  return pages;
}

export async function getPage(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  const page = await AppDataSource.getRepository(Page)
    .createQueryBuilder("page")
    .where(`page.id = '${id}'`)
    .andWhere(
      `DATE(page.created_at) BETWEEN '${req.body.dates.start}' AND '${req.body.dates.end}'`
    )
    .getOne();

  const queries = await AppDataSource.getRepository(Query)
    .createQueryBuilder("query")
    .leftJoinAndSelect("query.pair_data", "data")
    .where(`data.page_id = '${id}'`)
    .andWhere(
      `DATE(query.created_at) BETWEEN '${req.body.dates.start}' AND '${req.body.dates.end}'`
    )
    .getMany();

  if (page && queries) {
    return res.status(200).send({
      page,
      queries,
    });
  }

  return res.status(204).send({ msg: `Error fething data for Page` });
}

export async function edit(req: Request, res: Response) {
  const name = req.params.name;
  console.log(req.body);
  return res.status(400).send({ msg: `Error updating url: ${name}` });
}

module.exports = {
  fetchAll,
  getPage,
  edit,
};
