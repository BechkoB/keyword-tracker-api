import { Router } from "express";
import {
  fetchAll,
  getUrl,
} from "../controllers/urls.controller";

const urlRouter = Router();

urlRouter.post("/all", fetchAll);
urlRouter.get("/:id", getUrl);
// urlRouter.patch("/edit/:name", editUrl);

export default urlRouter;
