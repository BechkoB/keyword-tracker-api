import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Query } from "../entity/Query";
import { Clusters } from "../entity/Clusters";
import { In, IsNull, Like } from "typeorm";

export async function createCluster(req: Request, res: Response) {
  const { name, parent, subCluster } = req.body;

  const exist = await Clusters.findOneBy({
    name: name.toLowerCase(),
  });

  if (exist) {
    return res.status(400).send({ msg: "Cluster already exists..." });
  }

  const newCluster = new Clusters();
  newCluster.name = name.toLowerCase();

  if (subCluster) {
    newCluster.parent = subCluster;
  } else if (parent) {
    newCluster.parent = parent;
  } else {
    newCluster.parent = null;
  }
  await newCluster.save();

  return res
    .status(200)
    .send({ cluster: newCluster, msg: "Saved successfully" });
}

export async function getClusters(req: Request, res: Response) {
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

  // const temp = await Clusters.find({
  //   relations: {
  //     parent: true,
  //     children: {
  //       children: true,
  //     },
  //     queries: {
  //       queries: true,
  //     },
  //   },
  //   where: { parent: IsNull() },
  // });

  const qr = AppDataSource.getRepository(Clusters)
    .createQueryBuilder("clusters")
    .leftJoinAndSelect("clusters.parent", "parent")
    .leftJoinAndSelect("clusters.queries", "mainQueries")
    .leftJoinAndSelect("mainQueries.queries", "query_data")
    .leftJoinAndSelect("clusters.children", "children")
    .leftJoinAndSelect("children.queries", "subQueries")
    .leftJoinAndSelect("subQueries.queries", "subQuery_data")
    .leftJoinAndSelect("children.children", "subchildren")
    .leftJoinAndSelect("subchildren.queries", "subChildQueries")
    .leftJoinAndSelect("subChildQueries.queries", "subChildQuery_data");

  if (filters.cluster !== "") {
    qr.andWhere(`clusters.name LIKE '%${filters.cluster}%'`);
  }
  if (order && direction) {
    qr.orderBy("clusters.name", direction.toUpperCase());
    // order === "name"
    //   : qr.orderBy(`"${order}"`, direction.toUpperCase());
  } else {
    qr.orderBy("clusters.created_at", "DESC");
  }

  skip !== undefined ? qr.skip(skip) : qr.skip(0);
  take !== undefined ? qr.take(take) : qr.take(10);

  const clusters = await qr.getMany();

  res.status(200).send(clusters);
}

export async function addQueriesToCluster(req: Request, res: Response) {
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

  const qr = await AppDataSource.getRepository(Query).createQueryBuilder(
    "query"
  );
  qr.innerJoin("query.queries", "queries");
  qr.addSelect("SUM(queries.impressions)", "totalImpressions");
  qr.addSelect("SUM(queries.clicks)", "totalClicks");
  qr.addSelect("AVG(queries.position)", "avgPosition");
  qr.addSelect("AVG(queries.ctr)", "avgCtr");
  qr.where("query.clusterId IS NULL");
  qr.groupBy("query.id");
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

  const queries = await qr.getRawMany();

  const count = await AppDataSource.getRepository(Query)
    .createQueryBuilder("queries")
    .where("queries.clusterId IS NULL")
    .getCount();

  res.status(200).send({
    data: queries,
    length: count,
  });
}

export async function bulkAddQueriesToCluster(req: Request, res: Response) {
  const queries = req.body.data;
  // const cluster = req.body.cluster;
  let ids = [];

  queries.forEach((query) => {
    ids.push(query.query_id);
  });
  try {
    const cluster = await Clusters.findOneBy({ id: req.body.cluster.id });

    await AppDataSource.createQueryBuilder()
      .update(Query)
      .set({ cluster: cluster })
      .where({ id: In(ids) })
      .execute();

    return res.status(200).send({ msg: `Successfully updated queries` });
  } catch (err) {
    return res
      .status(400)
      .send({ msg: "Error updating queries, Please try again later." });
  }
}

export async function getClusterById(req: Request, res: Response) {
  const id = Number(req.params.id);

  const cluster = await Clusters.findOneBy({ id });

  if (cluster) {
    return res.status(200).send({ cluster });
  } else {
    res.status(404).send({msg: `Cluster with id: '${id}' not found...`})
  }
}

module.exports = {
  createCluster,
  getClusters,
  addQueriesToCluster,
  bulkAddQueriesToCluster,
  getClusterById,
};
