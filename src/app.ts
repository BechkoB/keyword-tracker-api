import * as express from "express";
import { json } from "body-parser";
import { AppDataSource } from "./data-source";
import { DataSource } from "typeorm";
import { start } from "./jobs/jobs.entry";
import verifyToken from "./helpers/auth";
import * as cors from "cors";
const config = require("../config.json");

import userRouter from "./routes/users.routes";
import queryRouter from "./routes/query.routes";
import pageRouter from "./routes/page.routes";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(", ");
const app = express();

app.set("port", process.env.PORT || 3030);
app.use(json());

const corsOptions = {
  origin: (origin, callback) => {
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
      return;
    }
    callback(`${origin} not allowed`, false);
  },
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.json({
    msg: "API IS RUNNING...",
  });
});

app.use("/users", userRouter);
app.use("/queries", verifyToken, queryRouter);
app.use("/pages", verifyToken, pageRouter);

app.listen(app.get("port"), () => {
  console.log(`Server is listening on port ${app.get("port")}`);
});

const getDataSource = (delay = 3000): Promise<DataSource> => {
  AppDataSource.initialize()
    .then(async () => {
      console.log("Connection initialized with database...");
      start();
    })
    .catch((error) => console.log(error));
  if (AppDataSource.isInitialized) return Promise.resolve(AppDataSource);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (AppDataSource.isInitialized) resolve(AppDataSource);
      else reject("Failed to create connection with database");
    }, delay);
  });
};

getDataSource();

