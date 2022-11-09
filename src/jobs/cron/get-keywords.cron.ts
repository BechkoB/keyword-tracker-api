import * as cron  from 'node-cron';
import { GoogleKeywordService } from '../../services/google-keyword.service';

const JOB_NAME = 'JOB:GET_GOOGLE_KEYWORDS';

export function getKeywords() {
  console.log(`[${JOB_NAME}] Will start at 10:00AM on Wednesday...`);
  
  return cron.schedule(
    '00 40 10 * * 3',
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