require('dotenv/config');
import { AppDataSource } from '../data-source';
import HttpService from './http.services';
import * as moment from 'moment';
import { Keywords } from '../entity/Keywords';

const MAIN_URL = process.env.MAIN_URL
export class GoogleKeywordService {
    async fetchAllData() {
        const httpService = new HttpService();
        const endDate = moment().subtract(3, 'days').format('YYYY-MM-DD');
        const startDate = moment(endDate).subtract(6, 'days').format('YYYY-MM-DD');
        console.log('Fetching keys from Google started...');
        const result = await httpService._post(MAIN_URL, startDate, endDate);
        this.saveKeywordsToDb(result);
    }

    async saveKeywordsToDb(data) {
        AppDataSource.initialize()
            .then(async () => {
                console.log("Connection initialized with database...");
                console.log('Starting jobs...');
                data.forEach(async (item) => {
                    const keyword = new Keywords();
                    keyword.keyword = item.keys[0];
                    keyword.url = item.keys[1];
                    keyword.clicks = item.clicks;
                    keyword.impressions = item.impressions;
                    keyword.ctr = item.ctr;
                    keyword.position = item.position;
                    await AppDataSource.manager.save(keyword);
                });
                AppDataSource.destroy();
            })
            .catch((error) => console.log(error));
        console.log('Saved to database successfully...');
    }

}
