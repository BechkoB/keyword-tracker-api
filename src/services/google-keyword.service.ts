require("dotenv/config");
import { AppDataSource } from "../data-source";
import HttpService from "./http.services";
import * as moment from "moment";
import { Keywords } from "../entity/Keywords";
import { Urls } from "../entity/Urls";

const MAIN_URL = process.env.MAIN_URL;

export class GoogleKeywordService {
  async fetchAllData() {
    const httpService = new HttpService();
    const endDate = moment().subtract(3, 'days').format('YYYY-MM-DD');
    const startDate = moment(endDate).subtract(7, 'days').format('YYYY-MM-DD');
    console.log('Fetching keywords from Google started...');
    const result = await httpService._post(MAIN_URL, startDate, endDate);
    await this.saveKeywordsToDb(result);
  }

  async saveKeywordsToDb(data) {
    console.log("Saving keywords to database...");

    data.forEach(async (item) => {
      await saveKeywordAndUrl(item);
    });
    console.log("Saved to database successfully...");
  }
}

async function saveKeywordAndUrl(item: any) {
  const keyword = new Keywords();
  keyword.name = item.keys[0];
  keyword.suchvolumen = item.suchvolumen;
  keyword.typ = item.typ;
  keyword.position = item.position;
  keyword.clicks = item.clicks;
  keyword.impressions = item.impressions;
  keyword.ctr = item.ctr;

  const keywordRepository = AppDataSource.getRepository(Keywords);
  await keywordRepository.save(keyword);

  const url = new Urls();
  url.name = item.keys[1];
  url.position = item.position;
  url.clicks = item.clicks;
  url.impressions = item.impressions;
  url.ctr = item.ctr;
  url.keyword = keyword;
  
  const urlRepository = AppDataSource.getRepository(Urls);
  await urlRepository.save(url);
}
