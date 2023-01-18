import * as http from 'https';
pingServer();

function pingServer() {
    let i = 0;
    const intervalId = setInterval(() => {
        console.log('scheduler entered');
        i++;
        console.log('i: ' + i, + new Date().toLocaleDateString());
        http.get('https://gkeyword-api.herokuapp.com/');
        i > 12 ? clearInterval(intervalId) : null;
    }, 300000)
}