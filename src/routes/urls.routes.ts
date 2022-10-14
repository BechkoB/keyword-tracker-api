import { Router } from "express";
import {
  fetchAll,
  getUrl,
  edit
} from "../controllers/urls.controller";

const urlRouter = Router();

urlRouter.post("/all", fetchAll);
urlRouter.get("/:id", getUrl);
urlRouter.patch("/edit/:name", edit);

export default urlRouter;
