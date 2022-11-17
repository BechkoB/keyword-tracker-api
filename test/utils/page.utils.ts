import { faker } from "@faker-js/faker";
import moment = require("moment");

export const page = {
  name: "https://www.hochzeitsportal24.de/" + faker.word.adverb({ length: { min: 5, max:13 }}),
  created_at: moment().format("YYYY-MM-DD"),
};
