import { getKeywords } from './cron/get-keywords.cron';
require('dotenv/config');

export async function start() {
  getKeywords();
}

module.exports = { start }
