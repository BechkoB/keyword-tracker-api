import * as cron from "node-cron";
import { GoogleKeywordService } from "../../services/google-keyword.service";

const JOB_NAME = "JOB:GET_GOOGLE_KEYWORDS";

export function getKeywords() {
  console.log(`[${JOB_NAME}] Will start at 10:00AM on Wednesday...`);

  // setTimeout(() => {
  // }, 120000);
  
  cron.schedule(
    "00 15 15 * * 1",
    () => {
      const gKeywordService = new GoogleKeywordService();
      gKeywordService.fetchAllData();
      console.log(`[${JOB_NAME}] Started...`);

    },
    {
      scheduled: true,
      timezone: "Europe/Sofia",
    }
  );
}
