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
    // const endDate = moment().subtract(3, "days").format("YYYY-MM-DD");
    // const startDate = moment(endDate).subtract(7, "days").format("YYYY-MM-DD");
    const endDate = "2023-01-08";
    const startDate = "2023-01-02";
    console.log(
      "Fetching keywords from Google started..." +
        moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
    );
    await this.saveData(startDate, endDate, "query");
    await this.saveData(startDate, endDate, "page");

    console.log(
      "Saved to database successfully..." +
        moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
    );
  }

  async saveData(startDate: string, endDate: string, from: string) {
    const httpService = new HttpService();
    const data = await httpService.fetchData(startDate, endDate, from);

    data.forEach((x) => {
      x["name"] =
        from === "query" ? x.keys[0] : x.keys[1].replace(MAIN_URL, "");
      x["date_start"] = startDate;
      x["date_end"] = endDate;
      x["created_at"] = new Date("2023-01-11");
    });

    if (from === "query") {
      await this.insertQueries(data);
      await this.insertQueryData(data);
    } else {
      await this.insertPages(data);
      await this.insertPageData(data);
    }
  }

  async insertQueries(data) {
    console.log(data[0].date_start, "date_start");
    console.log(data[0].date_end, "date_end");
    console.log(data[0].created_at, "created_at");

    console.log("Entered insert Queries");
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Query)
      .values(data)
      .orIgnore()
      .execute();
    console.log("Finished inserting queries");
  }

  async insertPages(data) {
    console.log("Entered insertPages");
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Page)
      .values(data)
      .orIgnore()
      .execute();
    console.log("Finished insertPages");
  }

  async insertQueryData(data) {
    console.log("Entered insert QueryData");
    for (let queryData of data) {
      const savedQuery = await Query.findOneBy({ name: queryData.name });
      queryData.query = savedQuery;
    }
    const queryDataRepo = AppDataSource.getRepository(QueryData);
    await queryDataRepo.save([...data], { chunk: 2000 });

    console.log("Finished insertQueryData");
  }

  async insertPageData(data) {
    console.log("Entered insertPageData ");
    for (let pageData of data) {
      const newQuery = new Query();
      const page = await Page.findOneBy({ name: pageData.name });
      const query = await Query.findOneBy({ name: pageData.keys[0] });
      if (page) {
        pageData.page = page;
      }
      if (query) {
        pageData.query = query;
      } else {
        newQuery.name = pageData.keys[0];
        newQuery.created_at = pageData.created_at;
        await newQuery.save();
        pageData.query = newQuery;
      }
    }

    const pageDataRepo = AppDataSource.getRepository(PageData);
    await pageDataRepo.save([...data], { chunk: 2000 });
    console.log("Finished insertPageData");
  }

}
