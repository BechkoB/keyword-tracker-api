import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Query } from "../entity/Query";
import { Page } from "../entity/Page";
import { QueryData } from "../entity/QueryData";
import { PageData } from "../entity/PageData";
import moment = require("moment");
import { In } from "typeorm";

interface Filters {
  esv: { from: number; to: number };
  position: { from: number; to: number };
  impressions: { from: number; to: number };
  dates: { start: string; end: string };
  queryTyp: string;
  relevant: string | boolean;
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
      data: data.queries,
      length: data.count,
    });
  }

  let qr = AppDataSource.getRepository(Query).createQueryBuilder("query");
  qr.innerJoin("query.queries", "queries");
  qr.addSelect("SUM(queries.impressions)", "totalImpressions");
  qr.addSelect("SUM(queries.clicks)", "totalClicks");
  qr.addSelect("AVG(queries.position)", "avgPosition");
  qr.addSelect("AVG(queries.ctr)", "avgCtr");
  qr.groupBy("query.id");
  qr.andWhere(
    `DATE(query.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
  );
  if (filters.query !== "") {
    qr.andWhere(`query.name LIKE '%${filters.query}%'`);
  }
  if (order && direction) {
    order === "name"
      ? qr.orderBy(`query.${order}`, direction.toUpperCase())
      : qr.orderBy(`"${order}"`, direction.toUpperCase());
  } else {
    qr.orderBy(`"totalClicks"`, "DESC");
  }

  skip !== undefined ? qr.offset(skip) : qr.offset(0);
  take !== undefined ? qr.limit(take) : qr.limit(10);

  data = await qr.getRawMany();

  const queryRepo = AppDataSource.getRepository(QueryData);
  const results = await queryRepo
    .createQueryBuilder("query_data")
    .select("SUM(query_data.clicks)", "totalClicks")
    .where(
      `DATE(query_data.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    )
    .addSelect("SUM(query_data.impressions)", "totalImpressions")
    .addSelect("AVG(query_data.position)", "avgPosition")
    .addSelect("AVG(query_data.ctr)", "avgCtr")
    .getRawOne();

  if (!results) {
    return;
  }

  const count = await AppDataSource.getRepository(Query)
    .createQueryBuilder("query")
    .where(
      `DATE(query.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    )
    .getCount();

  return res.status(200).send({
    data: data,
    length: count,
    results,
  });
}

export async function save(req: Request, res: Response) {
  const { name, page, est_search_volume, typ, tracken } = req.body;

  const exist = await Query.findOneBy({
    name: name.toLowerCase(),
  });

  let newPage;

  if (exist) {
    return res.status(400).send({ msg: "Query already exists..." });
  }
  const newQuery = new Query();
  const newPairData = new PageData();

  newQuery.name = name.toLowerCase();
  newQuery.est_search_volume = est_search_volume ? est_search_volume : null;
  newQuery.esv_date = est_search_volume ? new Date() : null;
  newQuery.typ = typ ? typ : null;
  newQuery.relevant = tracken ? tracken : null;

  if (page) {
    const pageExists = await Page.findOneBy({
      name: page.toLowerCase(),
    });
    if (!pageExists) {
      newPage = new Page();
      newPage.name = page;
      await newPage.save();
      newPairData.page = newPage;
      newQuery.designated = newPage;
    }
    newPairData.page = pageExists;
    newQuery.designated = pageExists;
  }
  await newQuery.save();
  newPairData.query = newQuery;
  await newPairData.save();

  res.status(200).send({ query: newQuery, msg: "Successfully added query" });
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
    .innerJoin("query.queries", "queries")
    .addSelect("SUM(queries.impressions)", "totalImpressions")
    .addSelect("SUM(queries.clicks)", "totalClicks")
    .addSelect("AVG(queries.position)", "avgPosition")
    .addSelect("AVG(queries.ctr)", "avgCtr");
  if (filters.relevant === null) {
    qr.where("query.relevant IS NULL");
  } else {
    qr.where("query.relevant = :relevant", { relevant: filters.relevant });
  }

  skip ? qr.offset(skip) : qr.offset(0);
  take ? qr.limit(take) : qr.limit(10);

  if (order && direction) {
    order === "name"
      ? qr.orderBy(`query.${order}`, direction.toUpperCase())
      : qr.orderBy(`"${order}"`, direction.toUpperCase());
  } else {
    qr.orderBy(`"totalClicks"`, "DESC");
  }

  qr.andWhere(
    `DATE(query.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
  );

  if (filters.esv.from) {
    if (filters.esv.to) {
      qr.andWhere(
        `queries.est_search_volume >= ${filters.esv.from} AND queries.est_search_volume <= ${filters.esv.to}`
      );
    } else {
      qr.andWhere(`queries.est_search_volume >= ${filters.esv.from}`);
    }
  } else if (filters.esv.to) {
    qr.andWhere(`queries.est_search_volume <= ${filters.esv.to}`);
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

  qr.groupBy("query.id");

  const count = await qr.getCount();
  const queries = await qr.getRawMany();

  return { queries, count };
}

export async function newQueries(req: Request, res: Response) {
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

  try {
    let qr = AppDataSource.getRepository(Query).createQueryBuilder("query");
    qr.where("query.relevant IS NULL");
    qr.innerJoin("query.queries", "queries", "queries.query_id = query.id");
    qr.addSelect("SUM(queries.impressions)", "totalImpressions");
    qr.addSelect("SUM(queries.clicks)", "totalClicks");
    qr.addSelect("AVG(queries.position)", "avgPosition");
    qr.addSelect("AVG(queries.ctr)", "avgCtr");
    qr.groupBy("query.id");
    qr.andWhere(
      `DATE(query.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    );
    if (filters.query !== "") {
      qr.andWhere(`query.name LIKE '%${filters.query}%'`);
    }

    if (filters.esv.from) {
      if (filters.esv.to) {
        qr.andWhere(
          `queries.est_search_volume >= ${filters.esv.from} AND queries.est_search_volume <= ${filters.esv.to}`
        );
      } else {
        qr.andWhere(`queries.est_search_volume >= ${filters.esv.from}`);
      }
    } else if (filters.esv.to) {
      qr.andWhere(`queries.est_search_volume <= ${filters.esv.to}`);
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

    if (order && direction) {
      order === "name"
        ? qr.orderBy(`query.${order}`, direction.toUpperCase())
        : qr.orderBy(`"${order}"`, direction.toUpperCase());
    } else {
      qr.orderBy(`"totalClicks"`, "DESC");
    }

    skip !== undefined ? qr.offset(skip) : qr.offset(0);
    take !== undefined ? qr.limit(take) : qr.limit(10);

    const data = await qr.getRawMany();
    const count = await qr.getCount();

    if (data) {
      return res.status(200).send({
        data: data,
        length: count,
      });
    }
  } catch (e) {
    res
      .status(400)
      .send({ msg: "Something went wrong, please try again later." });
  }
}

export async function getDesignatedPageSuggestions(
  req: Request,
  res: Response
) {
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

  try {
    let qr = AppDataSource.getRepository(Query)
      .createQueryBuilder("query")
      .where("query.designated IS NULL")
      .leftJoinAndSelect(
        "query.pair_data",
        "pair_data",
        "pair_data.query.id = query.id"
      )
      .leftJoinAndSelect("pair_data.page", "page")
      .andWhere(
        `DATE(query.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
      );
    if (filters.query !== "") {
      qr.andWhere(`query.name LIKE '%${filters.query}%'`);
    }
    if (filters.esv.from) {
      if (filters.esv.to) {
        qr.andWhere(
          `pair_data.est_search_volume >= ${filters.esv.from} AND pair_data.est_search_volume <= ${filters.esv.to}`
        );
      } else {
        qr.andWhere(`pair_data.est_search_volume >= ${filters.esv.from}`);
      }
    } else if (filters.esv.to) {
      qr.andWhere(`pair_data.est_search_volume <= ${filters.esv.to}`);
    }

    if (filters.impressions.from) {
      if (filters.impressions.to) {
        qr.andWhere(
          `pair_data.impressions >= ${filters.impressions.from} AND pair_data.impressions <= ${filters.impressions.to}`
        );
      } else {
        qr.andWhere(`pair_data.impressions >= ${filters.impressions.from}`);
      }
    } else if (filters.impressions.to) {
      qr.andWhere(`pair_data.impressions <= ${filters.impressions.to}`);
    }
    if (filters.position.from) {
      if (filters.position.to) {
        qr.andWhere(
          `pair_data.position >= ${filters.position.from} AND pair_data.position <= ${filters.position.to}`
        );
      } else {
        qr.andWhere(`pair_data.position >= ${filters.position.from}`);
      }
    } else if (filters.position.to) {
      qr.andWhere(`pair_data.position <= ${filters.position.to}`);
    }

    if (filters.query !== "") {
      qr.andWhere(`query.name LIKE '%${filters.query}%'`);
    }
    skip !== undefined ? qr.skip(skip) : qr.skip(0);
    take !== undefined ? qr.take(take) : qr.take(10);
    //  if (order && direction) {
    //    order === "name"
    //      ? qr.orderBy(`query.${order}`, direction.toUpperCase())
    //      : qr.orderBy(`"${order}"`, direction.toUpperCase());
    //  } else {
    //    qr.orderBy("pair_data.clicks", "DESC");
    //  }
    const data = await qr.getManyAndCount();

    //sorting pages by impressions desc order
    data[0].forEach((query) => {
      query.pair_data.sort((a, b) => b.clicks - a.clicks);
    });

    res.status(200).send({
      data: data[0],
      length: data[1],
    });
  } catch (e) {
    res
      .status(400)
      .send({ msg: "Something went wrong, please try again later." });
  }
}

export async function getQuery(req: Request, res: Response) {
  const id = parseInt(req.params.id);
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

  const query = await AppDataSource.getRepository(Query)
    .createQueryBuilder("query")
    .leftJoinAndSelect("query.designated", "designated")
    .leftJoinAndSelect("query.cluster", "cluster")
    .where(`query.id = ${id}`)
    .getOne();

  const qr = await AppDataSource.getRepository(Page)
    .createQueryBuilder("page")
    .leftJoin("page.pages", "pages", `pages.query_id = ${id}`)
    .addSelect("SUM(pages.impressions)", "totalImpressions")
    .addSelect("SUM(pages.clicks)", "totalClicks")
    .addSelect("AVG(pages.position)", "avgPosition")
    .addSelect("AVG(pages.ctr)", "avgCtr")
    .where(
      `DATE(pages.created_at) BETWEEN '${req.body.dates.start}' AND '${req.body.dates.end}'`
    )
    .groupBy("page.id");

  if (order && direction) {
    order === "name"
      ? qr.orderBy(`page.${order}`, direction.toUpperCase())
      : qr.orderBy(`"${order}"`, direction.toUpperCase());
  } else {
    qr.orderBy(`"totalClicks"`, "DESC");
  }

  skip !== undefined ? qr.offset(skip) : qr.offset(0);
  take !== undefined ? qr.limit(take) : qr.limit(10);

  // const count = await qr.getCount();
  const pages = await qr.getRawMany();

  const count = await AppDataSource.getRepository(Page)
    .createQueryBuilder("page")
    .leftJoin("page.pages", "pages", `pages.query_id = ${id}`)
    .where(
      `DATE(pages.created_at) BETWEEN '${req.body.dates.start}' AND '${req.body.dates.end}'`
    )
    .getCount();

  if (query && pages) {
    return res.status(200).send({
      query,
      pages: { data: pages, length: count },
    });
  }

  return res.status(204).send({ msg: `Query not found with id: ${id}` });
}

export async function edit(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { typ, est_search_volume, relevant, designated } = req.body;

  try {
    const query = await Query.findOneBy({ id });

    query.typ = typ ? typ : null;
    query.est_search_volume = est_search_volume ? est_search_volume : null;
    query.esv_date = est_search_volume ? new Date() : null;
    query.relevant = relevant;
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
    return res.status(400).send(err);
  }
}

export async function bulkEditRelevant(req: Request, res: Response) {
  const queries = req.body.data;
  const type = req.body.type;
  let ids = [];

  queries.forEach((query) => {
    ids.push(query.query_id);
  });
  try {
    await AppDataSource.createQueryBuilder()
      .update(Query)
      .set({ relevant: type })
      .where({ id: In(ids) })
      .execute();

    return res.status(200).send({ msg: `Successfully updated queries` });
  } catch (err) {
    return res
      .status(400)
      .send({ msg: "Error updating queries, Please try again later." });
  }
}

export async function updateDesignatedPage(req: Request, res: Response) {
  const queryId = parseInt(req.params.id);
  const { pageId, checked } = req.body;
  try {
    const query = await Query.findOneBy({ id: queryId });
    const page = await Page.findOneBy({ id: pageId });
    if (!query) {
      throw new Error("Can't find query with id: " + queryId);
    }
    checked ? (query.designated = page) : (query.designated = null);
    await query.save();
    res.status(200).send({ query, msg: "Success" });
  } catch (e) {
    return res
      .status(400)
      .send("Something went wrong! Please try again later...");
  }
}

export async function bulkEditDesignatedPage(req: Request, res: Response) {
  const arr = req.body;

  try {
    for (let item of arr) {
      assignDesignatedPage(item.queryId, item.pageId);
    }

    return res
      .status(200)
      .send({ msg: "Successfully assigned designated pages" });
  } catch (e) {
    return res.status(400).send({
      msg: "Error while assigning designated page, Please try again later.",
    });
  }
}

async function assignDesignatedPage(queryId, pageId) {
  const query = await Query.findOneBy({ id: queryId });
  const page = await Page.findOneBy({ id: pageId });
  if (!query && !page) {
    return;
  }
  query.designated = page;
  await query.save();
}

module.exports = {
  fetchAll,
  save,
  getQuery,
  newQueries,
  edit,
  bulkEditRelevant,
  getDesignatedPageSuggestions,
  bulkEditDesignatedPage,
  updateDesignatedPage,
};
