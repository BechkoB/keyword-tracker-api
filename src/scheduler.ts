import * as https from 'https';

setInterval(pingServer, 600000);

function pingServer() {
    https.get('https://gkeyword-api.herokuapp.com/');
    console.log('server pinged...');
}