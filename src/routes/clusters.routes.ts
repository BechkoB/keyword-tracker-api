import { Router } from "express";
import {
  createCluster,
  getClusters,
  addQueriesToCluster,
  bulkAddQueriesToCluster,
  getClusterById,
} from "../controllers/clusters.controller";

const clustersRouter = Router();

clustersRouter.post("/all", getClusters);
clustersRouter.post("/create", createCluster);
clustersRouter.post("/queries", addQueriesToCluster);
clustersRouter.post("/add/queries", bulkAddQueriesToCluster);
clustersRouter.get("/:id", getClusterById);
// pageRouter.patch("/edit/:name", edit);

export default clustersRouter;
