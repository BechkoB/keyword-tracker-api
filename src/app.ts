import * as express from 'express';
import { json } from 'body-parser';
import { AppDataSource } from './data-source';
import { DataSource } from "typeorm";
import { start } from "./jobs/jobs.entry";

import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;


// const supabase = createClient(supabaseUrl, supabaseKey, {
//   db: { schema: "public" },
// });


// fetch();

// async function fetch() {

//     const { error } = await supabase
//       .from("keywords")
//       .insert({
//         id: 10,
//         name: "Testing 3",
//         url: "https://www.hochzeitsportal24.de/test3",
//         tracken: false
//       });
// console.log(error);
//     const { data } = await supabase.from('keywords').select();
//     console.log(data);
// }

import verifyToken from './helpers/auth';

const app = express();
// const PORT = process.env.PORT || 3030;

import userRouter from './routes/users.routes';
import keywordRouter from './routes/keywords.routes'
import urlRouter from './routes/urls.router';

app.set('port', (process.env.PORT || 3030));
app.use(json());

// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");
    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});


app.get('/', (req, res) => {
    res.json({
        msg: 'API IS RUNNING...'
    });
})

app.use('/users', userRouter);
app.use('/keywords', keywordRouter);
app.use("/urls", urlRouter);


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

