import dotenv = require('dotenv')
import * as moment from 'moment'
import { GoogleKeywordService } from './services/google-keyword.service'
dotenv.config()
startFetching()

async function startFetching() {
  //Check if day is Wednesday
  if (moment().day() === 3) {
    const gKeywordService = new GoogleKeywordService()
    return gKeywordService.fetchAllData()
  }
}
