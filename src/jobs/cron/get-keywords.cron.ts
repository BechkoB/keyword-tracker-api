import * as cron from "node-cron";
import { GoogleKeywordService } from "../../services/google-keyword.service";

const JOB_NAME = "JOB:GET_GOOGLE_KEYWORDS";

export function getKeywords() {
  console.log(`[${JOB_NAME}] Will start at 10:00AM on Wednesday...`)
  const formatMemoryUsage = (data) =>
    `${Math.round((data / 1024 / 1024) * 100) / 100} MB`

  // setTimeout(() => {
  //   const gKeywordService = new GoogleKeywordService();
  //   return gKeywordService.fetchAllData();
  // }, 120000);

  return cron.schedule(
    '00 26 20 * * 5',
    () => {
      const memoryData = process.memoryUsage()

      const memoryUsage = {
        rss: `${formatMemoryUsage(
          memoryData.rss
        )} -> Resident Set Size - total memory allocated for the process execution`,
        heapTotal: `${formatMemoryUsage(
          memoryData.heapTotal
        )} -> total size of the allocated heap`,
        heapUsed: `${formatMemoryUsage(
          memoryData.heapUsed
        )} -> actual memory used during the execution`,
        external: `${formatMemoryUsage(
          memoryData.external
        )} -> V8 external memory`,
      }
      console.log(memoryUsage, 'before job')
      console.log(`[${JOB_NAME}] Started...`)
      const gKeywordService = new GoogleKeywordService()
      return gKeywordService.fetchAllData()
    },
    {
      scheduled: true,
      timezone: 'Europe/Sofia',
    }
  )
}
