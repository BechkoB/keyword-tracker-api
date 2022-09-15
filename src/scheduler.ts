import * as https from 'https';
setInterval(pingServer, 300000);

function pingServer() {
    for (let index = 0; index < 5; index++) {
        https.get('https://gkeyword-api.herokuapp.com/');
        console.log('server pinged...');
    }
    return;
}