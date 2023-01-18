import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Query } from "../entity/Query";
import { Page } from "../entity/Page";
import { PageData } from "../entity/PageData";

interface Filters {
  esv: { from: number; to: number };
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
      data: data.pages,
      length: data.count,
    });
  }

  let qr = AppDataSource.getRepository(Page).createQueryBuilder("page");
  qr.leftJoin("page.pages", "pages");
  qr.addSelect("SUM(pages.impressions)", "totalImpressions");
  qr.addSelect("SUM(pages.clicks)", "totalClicks");
  qr.addSelect("AVG(pages.position)", "avgPosition");
  qr.addSelect("AVG(pages.ctr)", "avgCtr");
  qr.groupBy("page.id");
  qr.where(
    `DATE(page.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
  );

  if (order && direction) {
    order === "name"
      ? qr.orderBy(`page.${order}`, direction.toUpperCase())
      : qr.orderBy(`"${order}"`, direction.toUpperCase());
  } else {
    qr.orderBy(`"totalClicks"`, "DESC");
  }
  skip !== undefined ? qr.offset(skip) : qr.offset(0);
  take !== undefined ? qr.limit(take) : qr.limit(10);

  data = await qr.getRawMany();

  const count = await AppDataSource.getRepository(Page)
    .createQueryBuilder("page")
    .where(
      `DATE(page.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    )
    .getCount();

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
    data: data,
    length: count,
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
    .innerJoin("page.pages", "pages");

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
  if (filters.query) {
    qr.andWhere(`page.name LIKE '%${filters.query}%'`);
  }

  qr.addSelect("SUM(pages.impressions)", "totalImpressions");
  qr.addSelect("SUM(pages.clicks)", "totalClicks");
  qr.addSelect("AVG(pages.position)", "avgPosition");
  qr.addSelect("AVG(pages.ctr)", "avgCtr");
  qr.groupBy("page.id");
  skip ? qr.offset(skip) : qr.offset(0);
  take ? qr.limit(take) : qr.limit(10);

  if (order && direction) {
    order === "name"
      ? qr.orderBy(`page.${order}`, direction.toUpperCase())
      : qr.orderBy(`"${order}"`, direction.toUpperCase());
  } else {
    qr.orderBy(`"totalClicks"`, "DESC");
  }

  const count = await qr.getCount();
  const pages = await qr.getRawMany();
  return { pages, count };
}

export async function getPage(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const filters = req.body.filters;
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

  const page = await AppDataSource.getRepository(Page)
    .createQueryBuilder("page")
    .where(`page.id = '${id}'`)
    .andWhere(
      `DATE(page.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    )
    .getOne();

  const qr = await AppDataSource.getRepository(Query)
    .createQueryBuilder("query")
    .leftJoin("query.pair_data", "data", `data.page_id = '${id}'`)
    .addSelect("SUM(data.impressions)", "totalImpressions")
    .addSelect("SUM(data.clicks)", "totalClicks")
    .addSelect("AVG(data.position)", "avgPosition")
    .addSelect("AVG(data.ctr)", "avgCtr")
    .where(
      `DATE(data.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    )
    .groupBy("query.id");

  if (order && direction) {
    order === "name"
      ? qr.orderBy(`page.${order}`, direction.toUpperCase())
      : qr.orderBy(`"${order}"`, direction.toUpperCase());
  } else {
    qr.orderBy(`"totalClicks"`, "DESC");
  }

  skip !== undefined ? qr.offset(skip) : qr.offset(0);
  take !== undefined ? qr.limit(take) : qr.limit(10);

  const queries = await qr.getRawMany();
  const count = await AppDataSource.getRepository(Query)
    .createQueryBuilder("query")
    .leftJoin("query.pair_data", "data", `data.page_id = '${id}'`)
    .where(
      `DATE(data.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    )
    .getCount();

  if (page && queries) {
    return res.status(200).send({
      page,
      queries: { data: queries, length: count },
    });
  }

  return res.status(204).send({ msg: `Error fething data for Page` });
}

export async function edit(req: Request, res: Response) {
  const name = req.params.name;
  return res.status(400).send({ msg: `Error updating url: ${name}` });
}

module.exports = {
  fetchAll,
  getPage,
  edit,
};
