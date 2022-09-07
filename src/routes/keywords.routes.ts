import { Router } from 'express';
import {
    fetchAll,
    save
} from '../controllers/keywords.controller';


const keywordRouter = Router();

keywordRouter.post('/all', fetchAll)
keywordRouter.post('/add', save)

export default keywordRouter