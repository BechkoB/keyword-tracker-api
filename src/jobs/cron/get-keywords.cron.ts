import * as cron from "node-cron";
import { GoogleKeywordService } from "../../services/google-keyword.service";

const JOB_NAME = "JOB:GET_GOOGLE_KEYWORDS";

export function getKeywords() {
  console.log(`[${JOB_NAME}] Will start at 10:00AM on Wednesday...`);

  setTimeout(() => {
    const gKeywordService = new GoogleKeywordService();
    return gKeywordService.fetchAllData();
  }, 120000);

  // return cron.schedule(
  //   "00 25 12 * * 4",
  //   () => {
  //     console.log(`[${JOB_NAME}] Started...`);

  //   },
  //   {
  //     scheduled: true,
  //     timezone: "Europe/Sofia",
  //   }
  // );
}
