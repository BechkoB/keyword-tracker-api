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
  bulkEditDesignatedPage
} from "../controllers/query.controller";


const queryRouter = Router();

queryRouter.post("/all", fetchAll);
queryRouter.post("/add", save);
queryRouter.post("/new/queries", newQueries);
queryRouter.patch("/edit/bulk", bulkEditRelevant);
queryRouter.patch("/edit/:id", edit);
queryRouter.post("/:id", getQuery);
queryRouter.post("/designated/suggestions", getDesignatedPageSuggestions);
queryRouter.patch("/update/bulk/designated/", bulkEditDesignatedPage);
queryRouter.patch("/update/designated/:id", updateDesignatedPage);

export default queryRouter;