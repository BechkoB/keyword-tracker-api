import * as express from "express";
import { json } from "body-parser";
import verifyToken from "./helpers/auth";
import* as  cors from "cors";
import userRouter from "./routes/users.routes";
import queryRouter from "./routes/query.routes";
import pageRouter from "./routes/page.routes";
import clustersRouter from "./routes/clusters.routes";


const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(", ");

export const app = express();
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
  res.status(200).json({
    msg: "API IS RUNNING...",
  });
});

app.use("/users", userRouter);
app.use("/queries", verifyToken, queryRouter);
app.use("/pages", verifyToken, pageRouter);
app.use("/clusters", verifyToken, clustersRouter);

