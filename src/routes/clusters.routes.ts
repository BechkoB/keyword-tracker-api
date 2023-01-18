import { Router } from "express";
import {
  createCluster,
  getClusters,
  addQueriesToCluster,
  bulkAddQueriesToCluster,
} from "../controllers/clusters.controller";

const clustersRouter = Router();

clustersRouter.post("/all", getClusters);
clustersRouter.post("/create", createCluster);
clustersRouter.post("/queries", addQueriesToCluster);
clustersRouter.post("/add/queries", bulkAddQueriesToCluster);

// pageRouter.post("/:id", getPage);
// pageRouter.patch("/edit/:name", edit);

export default clustersRouter;
