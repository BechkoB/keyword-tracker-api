import moment = require("moment");
import * as request from "supertest";
import { AppDataSource } from "../src/data-source";
import { app } from "../src/app";
import { query } from "./utils/query.utils";
import { page } from "./utils/page.utils";

import { filters } from "./utils/filters.utils";
import { Query } from "../src/entity/Query";
import { Page } from "../src/entity/Page";
import { cleanUpDb } from "./utils/db.utils";
import { User } from "../src/entity/User";
import * as bcrypt from "bcrypt";
import { generateJwt } from "../src/helpers/token";
import { faker } from "@faker-js/faker";

describe("Query controller", () => {
  const email = "test@abv.bg";
  const password = "123456";
  let jwtToken;
  let queryRunner;
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

    //Save query
    const queryRepo = AppDataSource.getRepository(Query);
    const newQuery = new Query();
    newQuery.name = query.name;
    newQuery.est_search_volume = Number(query.est_search_volume);
    newQuery.typ = query.typ;
    newQuery.tracken = query.tracken;
    newQuery.esv_date = query.esv_date;
    savedQuery = await queryRepo.save(newQuery);

    //Save page
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

  describe("Saving queries", () => {
    it("Should save a new query", async () => {
      const query = {
        name: faker.name.firstName().toLowerCase(),
        est_search_volume: faker.random.numeric(3),
        typ: faker.random.alpha({ count: 1, casing: "upper" }),
        tracken: faker.datatype.boolean(),
        esv_date: new Date(),
        created_at: moment().format("YYYY-MM-DD"),
      };

      const response = await request(app)
        .post(`/queries/add`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send(query)
        .expect(200);
      expect(response.body.query.name).toBe(query.name);
    });

    it("Should not save query if exists", async () => {
      const query = {
        name: savedQuery.name,
        est_search_volume: faker.random.numeric(3),
        typ: faker.random.alpha({ count: 1, casing: "upper" }),
        tracken: faker.datatype.boolean(),
        esv_date: new Date(),
        created_at: moment().format("YYYY-MM-DD"),
      };

      const response = await request(app)
        .post(`/queries/add`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send(query)
        .expect(400);
      expect(response.body.query.name).toBe(query.name);
      expect(response.body.msg).toBe("Query already exists...");
    });

    it("Should save query and crate new page data in DB", async () => {
      const query = {
        name: faker.name.firstName().toLowerCase(),
        est_search_volume: faker.random.numeric(3),
        page:
          "https://www.hochzeitsportal24.de/" +
          faker.word.adverb({ length: { min: 5, max: 13 } }),
        typ: faker.random.alpha({ count: 1, casing: "upper" }),
        tracken: faker.datatype.boolean(),
        esv_date: new Date(),
        created_at: moment().format("YYYY-MM-DD"),
      };

      const response = await request(app)
        .post(`/queries/add`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send(query)
        .expect(200);
      expect(response.body.query.name).toBe(query.name);

      const page = await Page.findOneBy({ name: query.page });
      expect(page.name).toBe(query.page);
    });
  });

  describe("Fetching queries", () => {
    it("Should fetch all queries", async () => {
      const response = await request(app)
        .post(`/queries/all/?order=&direction=&skip=0&take=10&type=queries`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send({ filters })
        .expect(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("Should fetch correct query by given ID", async () => {
      const response = await request(app)
        .post(`/queries/${savedQuery.id}`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send(filters)
        .expect(200);
      expect(response.body.query.name).toBe(savedQuery.name);
    });

    it("Should return status 204 for wrong query id", async () => {
      await request(app)
        .post(`/queries/235431`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send(filters)
        .expect(204);
    });

    it("Should not fetch queries when no token provided", async () => {
      const response = await request(app)
        .post(`/queries/all/?order=&direction=&skip=0&take=10&type=queries`)
        .set("origin", "http://localhost:4200")
        .send({ filters })
        .expect(403);
        expect(response.body.msg).toBe(
          "A token is required for authentication"
        );
    });
  });

  describe("Updating ad editing queries", () => {
    it("Should edit query with valid payload", async () => {
      savedQuery.est_search_volume = 111;
      await request(app)
        .patch(`/queries/edit/${savedQuery.id}`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send(savedQuery)
        .expect(200);
    });

    it("Should add designated page for query entered manually when page exists", async () => {
      savedQuery.designated = savedPage;
      await request(app)
        .patch(`/queries/edit/${savedQuery.id}`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send(savedQuery)
        .expect(200);
    });

    it("Should add designated page(and create) for query entered manually when page dosn't exist", async () => {
      savedQuery.designated =
        "https://www.hochzeitsportal24.de/" +
        faker.word.adverb({ length: { min: 5, max: 13 } });
      await request(app)
        .patch(`/queries/edit/${savedQuery.id}`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send(savedQuery)
        .expect(200);

      const pages = await Page.find();
      expect(pages.length).toBeGreaterThan(1);
    });

    it("Should successfully select designated page for query, when page exists", async () => {
      const response = await request(app)
        .patch(`/queries/update/designated/${savedQuery.id}`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send({ pageId: savedPage.id, checked: true })
        .expect(200);
      expect(response.body.query.designated.id).toBe(savedPage.id);
    });

    it("Should remove designated page for query", async () => {
      const response = await request(app)
        .patch(`/queries/update/designated/${savedQuery.id}`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send({ pageId: savedPage.id, checked: false })
        .expect(200);
      expect(response.body.query.designated).toBe(null);
    });

    it("Should return 400 if query dosn't exist", async () => {
      await request(app)
        .patch(`/queries/update/designated/${343}`)
        .set("x-access-token", jwtToken)
        .set("origin", "http://localhost:4200")
        .send({ pageId: savedPage.id, checked: true })
        .expect(400);
    });
  });
});
