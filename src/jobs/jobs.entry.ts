import { getKeywords } from './cron/get-keywords.cron';
import { AppDataSource } from '../data-source';
require('dotenv/config');

function start() {

      getKeywords();
  
}

start();
