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

    
   const urlsRepo = AppDataSource.getRepository(Urls);
   const result = await urlsRepo
     .createQueryBuilder("urls")
     .select("SUM(urls.clicks)", "totalClicks")
     .where(
       `DATE(urls.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
     )
     .addSelect("SUM(urls.impressions)", "totalImpressions")
     .addSelect("AVG(urls.position)", "avgPosition")
     .addSelect("AVG(urls.ctr)", "avgCtr")
     .getRawOne();

   if (!result) {
     return;
   }
   
    return res.status(200).send({
      data: data[0],
      length: data[1],
    });
  }

  let query = AppDataSource.getRepository(Urls)
    .createQueryBuilder("urls")
    .leftJoinAndSelect("urls.keyword", "keyword")

  if (order && direction) {
    console.log("entered order && direction");
    query.orderBy(`keyword.${order}`, direction.toUpperCase());
  } else {
    query.orderBy("keyword.clicks", "DESC");
  }
  query.where(
    `DATE(urls.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
  );
  skip !== undefined ? query.skip(skip) : query.skip(0);
  take !== undefined ? query.take(take) : query.take(10);

  data = await query.getManyAndCount();

   const urlsRepo = AppDataSource.getRepository(Urls);
   const result = await urlsRepo
     .createQueryBuilder("urls")
     .select("SUM(urls.clicks)", "totalClicks")
     .where(
       `DATE(urls.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
     )
     .addSelect("SUM(urls.impressions)", "totalImpressions")
     .addSelect("AVG(urls.position)", "avgPosition")
     .addSelect("AVG(urls.ctr)", "avgCtr")
     .getRawOne();

   if (!result) {
     return;
   }

  return res.status(200).send({
    data: data[0],
    length: data[1],
    result
  });
}

async function getFilteredData(
  filters: Filters,
  skip: number | undefined,
  take: number | undefined,
  order: string,
  direction: any
) {
  console.log(filters);
  let hasAnyFilter = false;
  let query = AppDataSource.getRepository(Urls)
    .createQueryBuilder("urls")
    .leftJoinAndSelect("urls.keyword", "keyword");


  skip ? query.skip(skip) : query.skip(0);
  take ? query.take(take) : query.take(10);
  order && direction
    ? query.orderBy(`urls.${order}`, direction.toUpperCase())
    : query.orderBy("urls.clicks", "DESC");

//   if (filters.suchvolumen.from) {
//     hasAnyFilter = true;
//     if (filters.suchvolumen.to) {
//       query.where(
//         `urls.suchvolumen >= ${filters.suchvolumen.from} AND urls.suchvolumen <= ${filters.suchvolumen.to}`
//       );
//     } else {
//       query.where(`urls.suchvolumen >= ${filters.suchvolumen.from}`);
//     }
//   } else if (filters.suchvolumen.to) {
//     hasAnyFilter = true;
//     query.where(`urls.suchvolumen <= ${filters.suchvolumen.to}`);
//   }

  if (filters.impressions.from) {
    if (hasAnyFilter) {
      if (filters.impressions.to) {
        query.andWhere(
          `urls.impressions >= ${filters.impressions.from} AND urls.impressions <= ${filters.impressions.to}`
        );
      } else {
        query.andWhere(`urls.impressions >= ${filters.impressions.from}`);
      }
    } else {
      hasAnyFilter = true;
      if (filters.impressions.to) {
        query.where(
          `urls.impressions >= ${filters.impressions.from} AND urls.impressions <= ${filters.impressions.to}`
        );
      } else {
        query.where(`urls.impressions >= ${filters.impressions.from}`);
      }
    }
  } else if (filters.impressions.to) {
    hasAnyFilter = true;
    query.where(`urls.impressions <= ${filters.impressions.to}`);
  }
  if (filters.position.from) {
    if (hasAnyFilter) {
      if (filters.position.to) {
        query.andWhere(
          `urls.position >= ${filters.position.from} AND urls.position <= ${filters.position.to}`
        );
      } else {
        query.andWhere(`urls.position >= ${filters.position.from}`);
      }
    } else {
      hasAnyFilter = true;
      if (filters.position.to) {
        query.where(
          `urls.position >= ${filters.position.from} AND urls.position <= ${filters.position.to}`
        );
      } else {
        query.where(`urls.position >= ${filters.position.from}`);
      }
    }
  } else if (filters.position.to) {
    hasAnyFilter = true;
    query.where(`urls.position <= ${filters.position.to}`);
  }

  if (filters.dates.start !== null && filters.dates.end !== null) {
    query.andWhere(
      `DATE(urls.created_at) BETWEEN '${filters.dates.start}' AND '${filters.dates.end}'`
    );
  }
  const urls = await query.getManyAndCount();
  return urls;
}

export async function getUrl(req: Request, res: Response) {
  const {id} = req.params;
  const keyword = await AppDataSource.getRepository(Urls)
    .createQueryBuilder("urls")
    .leftJoinAndSelect("urls.keyword", "keyword")
    .where(`urls.id = '${id}'`)
    .getMany();

  if (keyword.length > 0) {
    return res.status(200).send(keyword);
  }
  return res
    .status(204)
    .send({ msg: `Error fething data for Url` });
}

export async function editKeyword(req: Request, res: Response) {
  const name = req.params.name;
  const { typ, suchvolumen, tracken } = req.body;

  const keyword = await AppDataSource.createQueryBuilder()
    .update(Keywords)
    .set({ typ: typ, suchvolumen: suchvolumen, tracken: tracken })
    .where("keyword = :name", { name: name })
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
  getUrl
};
