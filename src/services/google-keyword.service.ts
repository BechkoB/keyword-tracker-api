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
  formatMemoryUsage = (data) =>
    `${Math.round((data / 1024 / 1024) * 100) / 100} MB`

  async fetchAllData() {
    // const endDate = moment().subtract(3, "days").format("YYYY-MM-DD");
    // const startDate = moment(endDate).subtract(7, "days").format("YYYY-MM-DD");
    const endDate = '2023-02-05'
    const startDate = '2023-01-30'
    console.log(
      'Fetching keywords from Google started...' +
        moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
    )
    await this.saveData(startDate, endDate, 'query')
    await this.saveData(startDate, endDate, 'page')

    console.log(
      'Saved to database successfully...' +
        moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
    )
  }

  async saveData(startDate: string, endDate: string, from: string) {
    const httpService = new HttpService()
    const data = await httpService.fetchData(startDate, endDate, from)

    data.forEach((x) => {
      x['name'] = from === 'query' ? x.keys[0] : x.keys[1].replace(MAIN_URL, '')
      x['date_start'] = startDate
      x['date_end'] = endDate
      x['created_at'] = new Date('2023-02-01')
    })

    if (from === 'query') {
      await this.insertQueries(data)
      await this.insertQueryData(data)
    } else {
      await this.insertPages(data)
      await this.insertPageData(data)
    }
    const memoryData = process.memoryUsage()

    const memoryUsage = {
      rss: `${this.formatMemoryUsage(
        memoryData.rss
      )} -> Resident Set Size - total memory allocated for the process execution`,
      heapTotal: `${this.formatMemoryUsage(
        memoryData.heapTotal
      )} -> total size of the allocated heap`,
      heapUsed: `${this.formatMemoryUsage(
        memoryData.heapUsed
      )} -> actual memory used during the execution`,
      external: `${this.formatMemoryUsage(
        memoryData.external
      )} -> V8 external memory`,
    }

    console.log(memoryUsage, 'after job is Done')
  }

  async insertQueries(data) {
    console.log('Started inserting Queries')
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Query)
      .values(data)
      .orIgnore()
      .execute()
    console.log('Finished inserting Queries')
  }

  async insertPages(data) {
    console.log('Started inserting Pages')
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Page)
      .values(data)
      .orIgnore()
      .execute()
    console.log('Finished inserting Pages')
  }

  async insertQueryData(data) {
    console.log('Started inserting QueryData')
    for (let queryData of data) {
      const savedQuery = await Query.findOneBy({ name: queryData.name })
      queryData.query = savedQuery
    }
    const queryDataRepo = AppDataSource.getRepository(QueryData)
    await queryDataRepo.save([...data], { chunk: 2000 })

    console.log('Finished inserting QueryData')
  }

  async insertPageData(data) {
    console.log('Started inserting PageData ')
    for (let pageData of data) {
      const newQuery = new Query()
      const page = await Page.findOneBy({ name: pageData.name })
      const query = await Query.findOneBy({ name: pageData.keys[0] })
      if (page) {
        pageData.page = page
      }
      if (query) {
        pageData.query = query
      } else {
        newQuery.name = pageData.keys[0]
        newQuery.created_at = pageData.created_at
        await newQuery.save()
        pageData.query = newQuery
      }
    }

    const pageDataRepo = AppDataSource.getRepository(PageData)
    await pageDataRepo.save([...data], { chunk: 2000 })
    console.log('Finished inserting PageData')
  }
}
