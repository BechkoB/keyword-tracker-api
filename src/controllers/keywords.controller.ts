import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Keywords } from "../entity/Keywords";
import { Urls } from "../entity/Urls";

interface Filters {
  suchvolumen: { from: number | null; to: number | null };
  position: { from: number | null; to: number | null };
  impressions: { from: number | null; to: number | null };
  dates: { start: string | null; end: string | null };
  keywordTyp: string;
  keyword: string;
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

    const keyRepo = AppDataSource.getRepository(Keywords);
    const result = await keyRepo
      .createQueryBuilder("keywords")
      .select("SUM(keywords.clicks)", "totalClicks")
      .where(
        `DATE(keywords.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
      )
      .addSelect("SUM(keywords.impressions)", "totalImpressions")
      .addSelect("AVG(keywords.position)", "avgPosition")
      .addSelect("AVG(keywords.ctr)", "avgCtr")
      .getRawOne();

    if (!result) {
      return;
    }

    return res.status(200).send({
      data: data[0],
      length: data[1],
    });
  }

  let query = AppDataSource.getRepository(Keywords)
    .createQueryBuilder("keywords")
    .leftJoinAndSelect("keywords.urls", "urls");

  if (order && direction) {
    console.log("entered order && direction");
    query.orderBy(`keywords.${order}`, direction.toUpperCase());
  } else {
    query.orderBy("keywords.clicks", "DESC");
  }
  query.where(
    `DATE(keywords.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
  );
  skip !== undefined ? query.skip(skip) : query.skip(0);
  take !== undefined ? query.take(take) : query.take(10);

  data = await query.getManyAndCount();

  const keyRepo = AppDataSource.getRepository(Keywords);
  const result = await keyRepo
    .createQueryBuilder("keywords")
    .select("SUM(keywords.clicks)", "totalClicks")
    .where(
      `DATE(keywords.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    )
    .addSelect("SUM(keywords.impressions)", "totalImpressions")
    .addSelect("AVG(keywords.position)", "avgPosition")
    .addSelect("AVG(keywords.ctr)", "avgCtr")
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
  const { keyword, url, suchvolumen, typ } = req.body;

  const urls = new Urls();
  urls.name = url;
  await AppDataSource.manager.save(urls);

  const key = new Keywords();
  key.name = keyword;
  key.urls = [urls];
  key.suchvolumen = suchvolumen;
  key.typ = typ;
  await AppDataSource.manager.save(key);

  // const keywordRepo = AppDataSource.getRepository(Keywords);
  res.status(200).json("Successfully added keywords");
}

// export async function save(req: Request, res: Response) {
//   const {data} = req.body;

//   let tempArr = []

//   console.log(tempArr);
//   res.status(200).send(tempArr);
//   // const key = new Keywords();
//   // key.keyword = keyword;
//   // key.url = url;
//   // key.suchvolumen = suchvolumen;
//   // key.typ = typ;
//   // const keywordRepo = AppDataSource.getRepository(Keywords);
//   // await keywordRepo.save(key);
// }

async function getFilteredData(
  filters: Filters,
  skip: number | undefined,
  take: number | undefined,
  order: string,
  direction: any
) {
  console.log(filters);
  let hasAnyFilter = false;
  let query = AppDataSource.getRepository(Keywords)
    .createQueryBuilder("keywords")
    .leftJoinAndSelect("keywords.urls", "urls");

  skip ? query.skip(skip) : query.skip(0);
  take ? query.take(take) : query.take(10);
  order && direction
    ? query.orderBy(`keywords.${order}`, direction.toUpperCase())
    : query.orderBy("keywords.clicks", "DESC");

  if (filters.suchvolumen.from) {
    hasAnyFilter = true;
    if (filters.suchvolumen.to) {
      query.where(
        `keywords.suchvolumen >= ${filters.suchvolumen.from} AND keywords.suchvolumen <= ${filters.suchvolumen.to}`
      );
    } else {
      query.where(`keywords.suchvolumen >= ${filters.suchvolumen.from}`);
    }
  } else if (filters.suchvolumen.to) {
    hasAnyFilter = true;
    query.where(`keywords.suchvolumen <= ${filters.suchvolumen.to}`);
  }

  if (filters.impressions.from) {
    if (hasAnyFilter) {
      if (filters.impressions.to) {
        query.andWhere(
          `keywords.impressions >= ${filters.impressions.from} AND keywords.impressions <= ${filters.impressions.to}`
        );
      } else {
        query.andWhere(`keywords.impressions >= ${filters.impressions.from}`);
      }
    } else {
      hasAnyFilter = true;
      if (filters.impressions.to) {
        query.where(
          `keywords.impressions >= ${filters.impressions.from} AND keywords.impressions <= ${filters.impressions.to}`
        );
      } else {
        query.where(`keywords.impressions >= ${filters.impressions.from}`);
      }
    }
  } else if (filters.impressions.to) {
    hasAnyFilter = true;
    query.where(`keywords.impressions <= ${filters.impressions.to}`);
  }
  if (filters.position.from) {
    if (hasAnyFilter) {
      if (filters.position.to) {
        query.andWhere(
          `keywords.position >= ${filters.position.from} AND keywords.position <= ${filters.position.to}`
        );
      } else {
        query.andWhere(`keywords.position >= ${filters.position.from}`);
      }
    } else {
      hasAnyFilter = true;
      if (filters.position.to) {
        query.where(
          `keywords.position >= ${filters.position.from} AND keywords.position <= ${filters.position.to}`
        );
      } else {
        query.where(`keywords.position >= ${filters.position.from}`);
      }
    }
  } else if (filters.position.to) {
    hasAnyFilter = true;
    query.where(`keywords.position <= ${filters.position.to}`);
  }

  if (filters.keywordTyp !== "") {
    if (hasAnyFilter) {
      query.andWhere(`keywords.typ LIKE '%${filters.keywordTyp}%'`);
    } else {
      query.where(`keywords.typ LIKE '%${filters.keywordTyp}%'`);
    }
  }

  if (filters.keyword !== "" && filters.keyword !== undefined) {
    if (hasAnyFilter) {
      query.andWhere(`keywords.name LIKE '%${filters.keyword}%'`);
    } else {
      query.where(`keywords.name LIKE '%${filters.keyword}%'`);
    }
  }

  if (filters.dates.start !== null && filters.dates.end !== null) {
    query.andWhere(
      `DATE(keywords.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    );
  }

  const keywords = await query.getManyAndCount();
  return keywords;
}

export async function getKeyword(req: Request, res: Response) {
  const name = req.params.name;

  const keyword = await AppDataSource.getRepository(Keywords)
    .createQueryBuilder("keywords")
    .leftJoinAndSelect("keywords.urls", "urls")
    .where(`keywords.name = ${name}`)
    .getMany();

  if (keyword.length > 0) {
    return res.status(200).send(keyword);
  }

  return res
    .status(204)
    .send({ msg: `Error fething data for keyword: ${name}` });
}

export async function editKeyword(req: Request, res: Response) {
  const name = req.params.name;
  const { typ, suchvolumen, tracken } = req.body;

  const keyword = await AppDataSource.createQueryBuilder()
    .update(Keywords)
    .set({ typ: typ, suchvolumen: suchvolumen, tracken: tracken })
    .where("name = :name", { name: name })
    .execute();

  if (keyword.affected > 0) {
    return res
      .status(200)
      .send({ msg: `Successfully updated keyword: ${name}` });
  }
  return res.status(400).send({ msg: `Error updating keyword: ${name}` });
}

module.exports = {
  fetchAll,
  save,
  getKeyword,
  editKeyword,
};
