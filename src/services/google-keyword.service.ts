require("dotenv/config");
import { AppDataSource } from "../data-source";
import HttpService from "./http.services";
import * as moment from "moment";
import { Query } from "../entity/Query";
import { Page } from "../entity/Page";
import { QueryData } from "../entity/QueryData";
import { PageData } from "../entity/PageData";
import * as _ from "lodash";

const MAIN_URL = process.env.MAIN_URL;

export class GoogleKeywordService {
  async fetchAllData() {
    const httpService = new HttpService();
    const endDate = moment().subtract(3, "days").format("YYYY-MM-DD");
    const startDate = moment(endDate).subtract(7, "days").format("YYYY-MM-DD");
    console.log(
      "Fetching keywords from Google started..." +
        moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
    );
    const result = await httpService._post(MAIN_URL, startDate, endDate);
    await this.saveDataToDb(result.queryData, startDate, endDate, "query");
    await this.saveDataToDb(result.pairData, startDate, endDate, "page");
    console.log(
      "Saved to database successfully..." +
        moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
    );
  }

  async saveDataToDb(data, startDate, endDate, from) {
    if (from === "query") {
      console.log("Started saving queries....");
      await saveData(data, startDate, endDate, from);
      console.log(
        "Finished saving queries...." +
          moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
      );
    } else {
      console.log("Started saving pages....");
      await saveData(data, startDate, endDate, from);
      console.log(
        "Finished saving pages...." +
          moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
      );
    }
  }
}

async function saveData(
  data: any,
  startDate: string,
  endDate: string,
  from: string
) {
  data.forEach((x) => {
    x.name = from === "query" ? x.keys[0] : x.keys[1].replace(MAIN_URL, "");
    x.date_start = startDate;
    x.date_end = endDate;
  });

  if (from === "query") {
    await insertQueries(data);
    const queries = await Query.find();
    await insertQueryData(data, queries);
  } else {
    await insertPages(data);
    const pages = await Page.find();
    const queries = await Query.find();
    await insertPageData(data, pages, queries);
  }
}

async function insertQueries(data) {
  console.log("Entered insert queries");
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Query)
    .values(data)
    .orIgnore()
    .execute();

  console.log("Finished inserting queries");
}

async function insertPages(data) {
  console.log("Entered insertPages");
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Page)
    .values(data)
    .orIgnore()
    .execute();

  console.log("Finished insertPages");
}

async function insertQueryData(data, queries) {
  console.log("Entered insert QueryData");
  let x = 0;
  // Find given query_id relation
  data.map((item) => {
    const query = queries.filter(({ name }) => name === item.name);
    item.query = query[0];
  });

  const queryDataRepo = AppDataSource.getRepository(QueryData);
  await queryDataRepo.save([...data], { chunk: 5000 });

  console.log("Finished insertQueryData");
}

async function insertPageData(data, pages, queries) {
  console.log("Entered insertPageData " + data.length);
  let x = 0;
  const newQuery = new Query();
  data.map(async (i) => {
    const page = pages.filter(({ name }) => name === i.name);
    const query = queries.filter(({ name }) => name === i.keys[0]);
    if (page) {
      i.page = page[0];
    }
    if (query) {
      i.query = query[0];
    } else {
      newQuery.name = i.keys[0];
      await newQuery.save();
      i.query = newQuery;
    }
  });

  const pageDataRepo = AppDataSource.getRepository(PageData);
  await pageDataRepo.save([...data], { chunk: 5000 });

  console.log("Finished insertQueryData");
}
