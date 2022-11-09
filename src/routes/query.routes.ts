import { Router } from 'express';
import {
    fetchAll,
    save,
    getQuery,
    edit,
    updateDesignatedPage
} from '../controllers/query.controller';


const queryRouter = Router();

queryRouter.post("/all", fetchAll);
queryRouter.post("/add", save);
queryRouter.post("/:id", getQuery);
queryRouter.patch("/edit/:id", edit);
queryRouter.patch("/update/designated/:id", updateDesignatedPage);

export default queryRouter;