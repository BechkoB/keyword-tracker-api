import axios from 'axios'
restartDyno()

async function restartDyno() {
  console.log('Dyno restarted')
  const token = process.env.HEROKU_TOKEN
  await axios.delete('https://api.heroku.com/apps/gkeyword-api/dynos', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
