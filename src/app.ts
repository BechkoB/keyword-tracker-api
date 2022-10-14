import * as express from 'express';
import { json } from 'body-parser';
import { AppDataSource } from './data-source';
import { DataSource } from "typeorm";
import { start } from "./jobs/jobs.entry";
import verifyToken from './helpers/auth';
import * as cors from "cors";
const config = require("../config.json");
// const PORT = process.env.PORT || 3030;

import userRouter from './routes/users.routes';
import keywordRouter from './routes/keywords.routes'
import urlRouter from './routes/urls.routes';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(", ");
const app = express();
app.set('port', (process.env.PORT || 3030));
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

app.get('/', (req, res) => {
    res.json({
        msg: 'API IS RUNNING...'
    });
})

app.use('/users', userRouter);
app.use('/keywords', verifyToken,  keywordRouter);
app.use("/urls",verifyToken, urlRouter);


app.listen(app.get('port'), () => {
    console.log(`Server is listening on port ${app.get('port')}`);
})

AppDataSource.initialize()
    .then(async () => {
        console.log("Connection initialized with database...");
        start();
        //setInterval that pings the app every 5 minutes to keep it awake
    })
    .catch((error) => console.log(error));

export const getDataSource = (delay = 3000): Promise<DataSource> => {
    if (AppDataSource.isInitialized) return Promise.resolve(AppDataSource);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (AppDataSource.isInitialized) resolve(AppDataSource);
            else reject("Failed to create connection with database");
        }, delay);
    });
};

