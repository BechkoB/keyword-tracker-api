import { AppDataSource } from "../data-source"
import { sign } from 'jsonwebtoken';

import { User } from '../entity/User'

export async function userLogin(req, res) {
    const { email, password } = req.body;

    const user = await AppDataSource
        .getRepository(User)
        .createQueryBuilder("user")
        .addSelect("user.password")
        .where("user.email = :email", { email: email })
        .getOne()

    if (user) {
        const match = user.password === password ? true : false;
        if (match) {
            const token = sign({ email: user.email }, process.env.SECRET);
            return res.status(200).json({
                succes: true,
                email: user.email,
                id: user.id,
                token
            });
        } else {
            return res.status(400).send({
                msg: "Email or password incorrect"
            })
        }
    }
    return res.status(400).send({
        success: false,
        msg: 'User is not registered!'
    });
}

export async function verifyUser(req, res) {
    const email = req.params.email;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({
        email
    })

    if (user) {
        const token = sign({ email: user.email }, process.env.SECRET);
        return res.status(200).send({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                token
            }
        });
    }
    return res.status(200).send({
        success: false,
        msg: 'User is not registered!'
    });
}

export default {
    userLogin,
    verifyUser
}