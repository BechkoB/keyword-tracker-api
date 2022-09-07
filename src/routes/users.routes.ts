import { Router } from 'express';
import { userLogin, verifyUser } from '../controllers/users';
import verifyToken from '../helpers/auth';

const userRouter = Router();

userRouter.post('/login', userLogin);
userRouter.get('/email/:email', verifyUser);

export default userRouter;