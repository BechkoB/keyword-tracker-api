import moment = require("moment");

const endDate = moment().format("YYYY-MM-DD");
const startDate = moment(endDate).subtract(6, "days").format("YYYY-MM-DD");

export const filters = {
  suchvolumen: { from: 0, to: 0 },
  position: { from: 0, to: 0 },
  impressions: { from: 0, to: 0 },
  dates: { start: startDate, end: endDate },
  queryTyp: "",
  query: "",
};
