import { faker } from "@faker-js/faker";
import moment = require("moment");

export const query = {
  name: faker.name.firstName().toLowerCase(),
  est_search_volume: faker.random.numeric(3),
  typ: faker.random.alpha({ count: 1, casing: "upper" }),
  relevant: faker.datatype.boolean(),
  esv_date: new Date(),
  created_at: moment().format("YYYY-MM-DD"),
};
