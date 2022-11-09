import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Query } from "../entity/Query";
import { Page } from "../entity/Page";
import { QueryData } from "../entity/QueryData";
import { PageData } from "../entity/PageData";
import moment = require("moment");

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

  let qr = AppDataSource.getRepository(Query).createQueryBuilder("query");

  qr.leftJoinAndSelect("query.queries", "queries");
  qr.leftJoinAndSelect("query.designated", "designated");

  if (order && direction) {
    order === "name"
      ? qr.orderBy(`query.${order}`, direction.toUpperCase())
      : qr.orderBy(`queries.${order}`, direction.toUpperCase());
  } else {
    qr.orderBy("query.created_at", "DESC"); 
  }
  qr.where(
    `DATE(query.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
  );
  skip !== undefined ? qr.skip(skip) : qr.skip(0);
  take !== undefined ? qr.take(take) : qr.take(10);

  data = await qr.getManyAndCount();

  const queryRepo = AppDataSource.getRepository(QueryData);
  const result = await queryRepo
    .createQueryBuilder("query_data")
    .select("SUM(query_data.clicks)", "totalClicks")
    .where(
      `DATE(query_data.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    )
    .addSelect("SUM(query_data.impressions)", "totalImpressions")
    .addSelect("AVG(query_data.position)", "avgPosition")
    .addSelect("AVG(query_data.ctr)", "avgCtr")
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

export async function save(req: Request, res: Response) {
  const { query, page, esv, typ } = req.body;

  const exist = await Query.findOneBy({
    name: query.toLowerCase(),
  });

  if (exist) {
    return res.status(400).send("Query already exists");
  }
  const newQuery = new Query();
  newQuery.name = query.toLowerCase();
  newQuery.est_search_volume = esv ? esv : null;
  newQuery.esv_date = esv ? new Date() : null;
  newQuery.typ = typ ? typ : null;

  if (page) {
    const newPage = new Page();
    newPage.name = page;
    await newPage.save();
  }

  await newQuery.save();
  res.status(200).send({ msg: "Successfully added query" });

}

async function getFilteredData(
  filters: Filters,
  skip: number | undefined,
  take: number | undefined,
  order: string,
  direction: any
) {
  let qr = AppDataSource.getRepository(Query)
    .createQueryBuilder("query")
    .leftJoinAndSelect("query.queries", "queries");

  skip ? qr.skip(skip) : qr.skip(0);
  take ? qr.take(take) : qr.take(10);
  if (order && direction) {
    order === "name"
      ? qr.orderBy(`query.${order}`, direction.toUpperCase())
      : qr.orderBy(`queries.${order}`, direction.toUpperCase());
  } else {
    qr.orderBy("query.created_at", "DESC");
  }

  if (filters.dates.start !== null && filters.dates.end !== null) {
    qr.where(
      `DATE(query.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    );
  }

  if (filters.suchvolumen.from) {
    if (filters.suchvolumen.to) {
      qr.andWhere(
        `queries.suchvolumen >= ${filters.suchvolumen.from} AND queries.suchvolumen <= ${filters.suchvolumen.to}`
      );
    } else {
      qr.andWhere(`queries.suchvolumen >= ${filters.suchvolumen.from}`);
    }
  } else if (filters.suchvolumen.to) {
    qr.andWhere(`queries.suchvolumen <= ${filters.suchvolumen.to}`);
  }

  if (filters.impressions.from) {
    if (filters.impressions.to) {
      qr.andWhere(
        `queries.impressions >= ${filters.impressions.from} AND queries.impressions <= ${filters.impressions.to}`
      );
    } else {
      qr.andWhere(`queries.impressions >= ${filters.impressions.from}`);
    }
  } else if (filters.impressions.to) {
    qr.andWhere(`queries.impressions <= ${filters.impressions.to}`);
  }
  if (filters.position.from) {
    if (filters.position.to) {
      qr.andWhere(
        `queries.position >= ${filters.position.from} AND queries.position <= ${filters.position.to}`
      );
    } else {
      qr.andWhere(`queries.position >= ${filters.position.from}`);
    }
  } else if (filters.position.to) {
    qr.andWhere(`queries.position <= ${filters.position.to}`);
  }

  if (filters.queryTyp !== "") {
    qr.andWhere(`queries.typ LIKE '%${filters.queryTyp}%'`);
  }

  if (filters.query !== "") {
    qr.andWhere(`query.name LIKE '%${filters.query}%'`);
  }

  const queries = await qr.getManyAndCount();
  return queries;
}

export async function getQuery(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  const query = await AppDataSource.getRepository(Query)
    .createQueryBuilder("query")
    .leftJoinAndSelect("query.designated", "designated")
    .leftJoinAndSelect("query.queries", "query_data")
    .where(
      `DATE(query_data.created_at) BETWEEN '${req.body.dates.start}' AND '${req.body.dates.end}'`
    )
    .where(`query.id = ${id}`)
    .andWhere(
      `DATE(query.created_at) BETWEEN '${req.body.dates.start}' AND '${req.body.dates.end}'`
    )
    .getOne();

  const pages = await AppDataSource.getRepository(Page)
    .createQueryBuilder("page")
    .leftJoinAndSelect("page.pages", "pages")
    .where(
      `DATE(pages.created_at) BETWEEN '${req.body.dates.start}' AND '${req.body.dates.end}'`
    )
    .where(`pages.query_id = ${id}`)
    .andWhere(
      `DATE(page.created_at) BETWEEN '${req.body.dates.start}' AND '${req.body.dates.end}'`
    )
    .getMany();

  if (query && pages) {
    return res.status(200).send({
      query,
      pages,
    });
  }

  return res.status(204).send({ msg: `Query not found with id: ${id}` });
}

export async function edit(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { typ, suchvolumen, tracken, designated } = req.body;

  try {
    const query = await Query.findOneBy({ id });

    query.typ = typ;
    query.est_search_volume = suchvolumen;
    query.tracken = tracken;
    if (designated) {
      const page = await Page.findOneBy({ name: designated });
      if (!page) {
        const newPage = new Page();
        newPage.name = designated;
        const savedPage = await newPage.save();
        query.designated = savedPage;
      } else {
        query.designated = page;
      }
    }

    await query.save();

    return res
      .status(200)
      .send({ msg: `Successfully updated query with id: ${id}` });
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
}

export async function updateDesignatedPage(req: Request, res: Response) {
  const queryId = parseInt(req.params.id);
  const { pageId, checked } = req.body;
  console.log(checked);
  try {
    const query = await Query.findOneBy({ id: queryId });
    if (!checked) {
      query.designated = null;
    } else {
      const page = await Page.findOneBy({ id: pageId });
      query.designated = page;
    }
    await query.save();
    res.status(200).send({ msg: "Success" });
  } catch (err) {
    res.status(400).send(err);
  }
}

module.exports = {
  fetchAll,
  save,
  getQuery,
  edit,
  updateDesignatedPage,
};
