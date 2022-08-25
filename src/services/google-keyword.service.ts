require('dotenv/config');
import HttpService  from './http.services';
import * as moment from 'moment';
import { GscResponse } from '../interfaces/GscResponse.interface';
import { Keyword } from '../entity/Keyword';

const MAIN_URL = process.env.MAIN_URL
export class GoogleKeywordService {
    async fetchAllData() {
        const httpService = new HttpService(); 
        const endDate = moment().subtract(3, 'days').format('YYYY-MM-DD');
        const startDate = moment(endDate).subtract(6, 'days').format('YYYY-MM-DD');
        console.log('Fetching keys from Google started')
        const result = await httpService._post(MAIN_URL, startDate, endDate);
        this.saveKeywordsToDb(result);
    }

    async saveKeywordsToDb(data: GscResponse[]) {
        data.forEach(async (item: GscResponse) => {
            const keyword = new Keyword();
            keyword.keyword = item.keys[0];
            keyword.url = item.keys[1];
            keyword.clicks = item.clicks;
            keyword.impressions = item.impressions;
            keyword.ctr = item.ctr;
            keyword.position = item.position;
            await keyword.save();
        });

        const keywords = await Keyword.find()
        console.log(keywords);
    }

}
