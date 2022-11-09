import { Router } from "express";
import {
  fetchAll,
  getPage,
  edit
} from "../controllers/page.controller";

const pageRouter = Router();

pageRouter.post("/all", fetchAll);
pageRouter.get("/:id", getPage);
pageRouter.patch("/edit/:name", edit);

export default pageRouter;
