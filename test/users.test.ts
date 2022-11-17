import * as request from "supertest";
import { AppDataSource } from "../src/data-source";
import { app } from "../src/app";
import { User } from "../src/entity/User";
import * as bcrypt from "bcrypt";
import { generateJwt } from "../src/helpers/token";
import { cleanUpDb } from "./utils/db.utils";


describe("User controller", () => {
  const email = "test@abv.bg";
  const password = "123456";
  let queryRunner;
  let jwtToken;
  let dataSource;

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();
    
    //Save test user
    const userRepo = await AppDataSource.getRepository(User);
    const user = new User();
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    await userRepo.save(user);

    jwtToken = generateJwt(user);
  });

  // beforeEach(async () => {
  //   await queryRunner.startTransaction();
  // })

  // afterEach(async () => {
  //   await queryRunner.rollbackTransaction();
  // });
  
  afterAll(async () =>{
    await cleanUpDb(dataSource);
    await AppDataSource.destroy();
  })

  it("User can login with correct credentials", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ email, password })
      .set("origin", "http://localhost:4200")
      .expect(200);
    expect(response.body.token.length).toBeGreaterThan(0);
  });

  it("User can't login with wrong password", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ email, password: "123" })
      .set("origin", "http://localhost:4200")
      .expect(400);
    expect(response.body.msg).toBe("Email or password incorrect");
  });

  it("User can't login if not registered", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ email: "test1@abv.bg", password: "123" })
      .set("origin", "http://localhost:4200")
      .expect(400);
    expect(response.body.msg).toBe("User is not registered!");
  });

});
