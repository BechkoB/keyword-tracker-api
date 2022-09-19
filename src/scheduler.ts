import * as http from 'https';
pingServer();

function pingServer() {
    let i = 0;
    const intervalId = setInterval(() => {
        console.log('scheduler entered');
        i++;
        console.log('i: ' + i);
        http.get('https://gkeyword-api.herokuapp.com/');
        i > 5 ? clearInterval(intervalId) : null;
    }, 300000)
}