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
        console.log('entered saveKeywordsToDb');
        data.map((item) => {
            item.keyword = item.keys[0];
            item.url = item.keys[1];
            item.clicks = item.clicks;
            item.impressions = item.impressions;
            item.ctr = item.ctr;
            item.position = item.position;
        })
        await AppDataSource.manager.save(Keywords, data);
        console.log('Saved to database successfully...');
    }

}
