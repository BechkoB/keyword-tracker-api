import { Router } from 'express';
import {
  fetchAll,
  save,
  newQueries,
  getQuery,
  edit,
  bulkEditRelevant,
  getDesignatedPageSuggestions,
  updateDesignatedPage,
  bulkEditDesignatedPage,
  bulkAddQueries
} from "../controllers/query.controller";


const queryRouter = Router();

queryRouter.post("/all", fetchAll);
queryRouter.post("/create", save);
queryRouter.post("/new/queries", newQueries);
queryRouter.post("/bulk/add", bulkAddQueries);
queryRouter.post("/:id", getQuery);
queryRouter.post("/designated/suggestions", getDesignatedPageSuggestions);
queryRouter.patch("/edit/:id", edit);
queryRouter.patch("/edit/bulk", bulkEditRelevant);
queryRouter.patch("/update/bulk/designated/", bulkEditDesignatedPage);
queryRouter.patch("/update/designated/:id", updateDesignatedPage);

export default queryRouter;