import { AppDataSource } from "../data-source";
import * as  bcrypt  from "bcrypt";
import { User } from "../entity/User";
import { generateJwt } from "../helpers/token";

export async function login(req, res) {
  const { email, password } = req.body;

  let hasUser = await AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.email = :email", { email: email.trim() })
    .getOne();

  if (hasUser) {
    // const match = user.password === password ? true : false;
    const match = await bcrypt.compare(password, hasUser.password);
    if (match) {
      const token = generateJwt(hasUser);
      let { password, ...user } = hasUser;
      return res.status(200).json({
        user,
        token,
      });
    } else {
      return res.status(400).send({
        msg: "Email or password incorrect",
      });
    }
  }
  return res.status(400).send({
    success: false,
    msg: "User is not registered!",
  });
}

export async function verify(req, res) {
  const email = req.params.email.trim();

  const userRepo = AppDataSource.getRepository(User);
  const result = await userRepo.findOneBy({
    email
  });

  if (result) {
    const { password, ...user } = result;
    const token = generateJwt(user);
    return res.status(200).send({
      user,
      token
    });
  }
  return res.status(200).send({
    success: false,
    msg: "User is not registered!",
  });
}

export async function register(req, res) {
  const email = req.body.email.trim();
  let password;
  let hashedPassword;
  req.body.password ? password = req.body.password.trim() : null

  const user = await AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .where("user.email = :email", { email: email })
    .getOne();

  if (user) {
    return res.status(400).send({
      msg: "User already registered...",
    });
  }

  const newUser = new User();
  newUser.email = email;
  newUser.password = password
    ? (hashedPassword = await bcrypt.hash(password, 10))
    : null;
  AppDataSource.manager.save(newUser).then(result => {
    const { password, ...user } = result;
    const token = generateJwt(user);
    return res.status(200).json({
      user,
      token,
    });
  });

}

export default {
  login,
  verify,
  register
};
