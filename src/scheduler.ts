import * as http from 'http';
pingServer();

function pingServer() {
    let i = 0;
    const intervalId = setInterval(() => {
        console.log('setInterval entered');
        i++;
        console.log('i: ' + i);
        http.get('http://localhost:3030/');
        i > 5 ? clearInterval(intervalId) : null;
    }, 3000)
}