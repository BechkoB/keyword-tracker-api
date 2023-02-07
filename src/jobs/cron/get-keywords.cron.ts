import * as cron from "node-cron";
import { GoogleKeywordService } from "../../services/google-keyword.service";

const JOB_NAME = "JOB:GET_GOOGLE_KEYWORDS";

export function getKeywords() {
  console.log(`[${JOB_NAME}] Will start at 10:00AM on Wednesday...`);
  // cron.schedule(
  //   "00 10 10 * * 2",
  //   async () => {
  //     console.log(`[${JOB_NAME}] Started...`);
  //     const gKeywordService = new GoogleKeywordService();
  //     await gKeywordService.fetchAllData();
  //   },
  //   {
  //     scheduled: true,
  //     timezone: "Europe/Sofia",
  //   }
  // );
  // setTimeout(() => {
  //   startJob();
  // }, 120000);
}

function startJob() {
  return;
}
