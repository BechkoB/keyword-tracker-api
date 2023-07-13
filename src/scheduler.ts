import axios from 'axios';
import dotenv = require('dotenv');
import * as moment from 'moment';
dotenv.config();
restartDyno();

async function restartDyno() {
  console.log(
    `Dyno restarted... At: ${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')}`
  )
  await axios.delete(
    'https://api.heroku.com/apps/gkeyword-api/dynos',
    {
      headers: {
        Authorization: `Bearer ${process.env.HEROKU_TOKEN}`,
        Accept: `application/vnd.heroku+json; version=3`,
      },
    }
  )
}
