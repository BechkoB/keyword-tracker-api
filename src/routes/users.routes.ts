import { Router } from 'express';
import { login, verify, register } from "../controllers/users.controller";

const userRouter = Router();

userRouter.post('/login', login);
userRouter.post("/register", register);
userRouter.get('/verify/:email', verify);

export default userRouter;