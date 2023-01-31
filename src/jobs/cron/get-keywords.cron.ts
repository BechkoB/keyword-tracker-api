import * as cron from "node-cron";
import { GoogleKeywordService } from "../../services/google-keyword.service";

const JOB_NAME = "JOB:GET_GOOGLE_KEYWORDS";

export function getKeywords() {
  console.log(`[${JOB_NAME}] Will start at 10:00AM on Wednesday...`);

  setTimeout(() => {
    startJob();
  }, 120000);
}

function startJob() {
  return cron.schedule(
    "00 20 10 * * 2",
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
