import * as cron  from 'node-cron';
import { GoogleKeywordService } from '../../services/google-keyword.service';

const JOB_NAME = 'JOB:GET_GOOGLE_KEYWORDS';

export function getKeywords() {
  console.log(`[${JOB_NAME}] Will start in 10minutes...`);
  
  return cron.schedule(
    '*/10 * * * *',
    () => {
      console.log(`[${JOB_NAME}] Started...`);
      const gKeywordService = new GoogleKeywordService();
      return gKeywordService.fetchAllData();
    },
    {
      scheduled: true,
      timezone: 'Europe/Sofia'
    }
  );
}

