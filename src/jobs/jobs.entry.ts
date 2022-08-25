import { getKeywords } from './cron/get-keywords.cron';
import { AppDataSource } from '../data-source';
require('dotenv/config');

function start() {
  AppDataSource.initialize()
    .then(async () => {
      console.log("Connection initialized with database...");
      console.log('Starting jobs...');
      getKeywords();
    })
    .catch((error) => console.log(error));
}

start();
