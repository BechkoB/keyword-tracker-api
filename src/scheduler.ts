import axios from 'axios'
import dotenv = require('dotenv')
dotenv.config()
restartDyno()

async function restartDyno() {
  console.log('Dyno restarted')
  const token = process.env.HEROKU_TOKEN
  console.log(token)
  await axios.delete('https://api.heroku.com/apps/gkeyword-api/dynos', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: `application/vnd.heroku+json; version=3`,
    },
  })
}
