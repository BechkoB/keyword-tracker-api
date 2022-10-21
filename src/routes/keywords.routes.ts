import { Router } from 'express';
import {
    fetchAll,
    save,
    getKeyword,
    editKeyword
} from '../controllers/keywords.controller';


const keywordRouter = Router();

keywordRouter.post('/all', fetchAll);
keywordRouter.post('/add', save);
keywordRouter.post('/:id/:name', getKeyword);
keywordRouter.patch('/edit/:name', editKeyword)

export default keywordRouter