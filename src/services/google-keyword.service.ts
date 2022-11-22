require("dotenv/config");
import { AppDataSource } from "../data-source";
import HttpService from "./http.services";
import * as moment from "moment";
import { Query } from "../entity/Query";
import { Page } from "../entity/Page";
import { QueryData } from "../entity/QueryData";
import { PageData } from "../entity/PageData";

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
    await insertQueryData(data);
  } else {
    await insertPages(data);
    await insertPageData(data);
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

async function insertQueryData(data) {
  console.log("Entered insert QueryData");
  let x = 0;
  for (let queryData of data) {
    console.log(x++, "from insertQueryData");
    const savedQuery = await Query.findOneBy({ name: queryData.name });
    queryData.query = savedQuery;
  }
  const queryDataRepo = AppDataSource.getRepository(QueryData);
  await queryDataRepo.save([...data], { chunk: 2000 });

  console.log("Finished insertQueryData");
}

async function insertPageData(data) {
  console.log("Entered insertPageData ");
  let x = 0;
  const newQuery = new Query();
  for (let pageData of data) {
    console.log(x++, "from insertPageData");
    const page = await Page.findOneBy({ name: pageData.name });
    const query = await Query.findOneBy({ name: pageData.keys[0] });
    if (page) {
      pageData.page = page;
    }
    if (query) {
      pageData.query = query;
    } else {
      newQuery.name = pageData.keys[0];
      await newQuery.save();
      pageData.query = newQuery;
    }
  }

  const pageDataRepo = AppDataSource.getRepository(PageData);
  await pageDataRepo.save([...data], { chunk: 2000 });
  console.log("Finished insertQueryData");
}
