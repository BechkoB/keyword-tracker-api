import * as request from "supertest";
import { AppDataSource } from "../src/data-source";
import { app } from "../src/app";
import { page } from "./utils/page.utils";
import { filters } from "./utils/filters.utils";
import { Query } from "../src/entity/Query";
import { Page } from "../src/entity/Page";
import { cleanUpDb } from "./utils/db.utils";
import { User } from "../src/entity/User";
import * as bcrypt from "bcrypt";
import { generateJwt } from "../src/helpers/token";

describe("Page controller", () => {
  const email = "test@abv.bg";
  const password = "123456";
  let jwtToken;
  let savedQuery: Query;
  let savedPage: Page;
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

    //Save random page
    const pageRepo = AppDataSource.getRepository(Page);
    const newPage = new Page();
    newPage.name = page.name;
    savedPage = await pageRepo.save(page);
  });

  // beforeEach(async () => {

  // });

  // afterEach(async () => {});

  afterAll(async () => {
    await cleanUpDb(dataSource);
  });
  it("Should fetch all pages", async () => {
    const response = await request(app)
      .post(`/pages/all/?order=&direction=&skip=0&take=10&type=pages`)
      .set("x-access-token", jwtToken)
      .set("origin", "http://localhost:4200")
      .send({ filters })
      .expect(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("Should not fetch pages when no toke provided", async () => {
    const response = await request(app)
      .post(`/pages/all/?order=&direction=&skip=0&take=10&type=pages`)
      .set("origin", "http://localhost:4200")
      .send({ filters })
      .expect(403);
    expect(response.body.msg).toBe("A token is required for authentication");
  });

  it("Should fetch correct page by given ID", async () => {
    const response = await request(app)
      .post(`/pages/${savedPage.id}`)
      .set("x-access-token", jwtToken)
      .set("origin", "http://localhost:4200")
      .send(filters)
      .expect(200);
    expect(response.body.page.name).toBe(savedPage.name);
  });
});
