import { OAuth2Client } from "googleapis-common";

const { google } = require('googleapis');
const { getJwtToken } = require('./google-login.service')

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_sercret = process.env.GOOGLE_SECRET;
class HttpService {

    async _post(url: string, startDate: string, endDate: string) {
        const oauth2Client =  await this._login();
        const result = await this.callApi(oauth2Client, url, startDate, endDate);
        return result;
    }

    async _login() {
        console.log('Attempting to login...')
        const auth = await getJwtToken();

        const oauth2Client: OAuth2Client = new google.auth.OAuth2(client_id, client_sercret);
        oauth2Client.setCredentials({
            access_token: auth.access_token
        });
        console.log('Login successful...')
        return oauth2Client;
    }

    async callApi(oauth2Client: OAuth2Client, url: string, startDate: string, endDate: string) {

        console.log('Attempting to call API...');
        google.options({ auth: oauth2Client });
        const webmasters = google.webmasters('v3');

        try {
            const configOne = {
                startDate: startDate,
                endDate: endDate,
                aggregationType: "byPage",
                dimension: ['query', 'page'],
                type: "web",
                rowLimit: 25000,
                startRow: 1
            }

            const configTwo = {
                startDate: startDate,
                endDate: endDate,
                aggregationType: "byPage",
                dimension: ['query', 'page'],
                type: "web",
                rowLimit: 25000,
                startRow: 25001
            }

            const primaryData = await webmasters.searchanalytics.query({
                siteUrl: url,
                requestBody: configOne,
            });
            if (primaryData.data.rows.length === 0) {
                return;
            }
            let firstArr = [];
            primaryData.data.rows.filter((item) => {
                item.impressions >= 4 ? firstArr.push(item) : null
            })

            const secondaryData = await webmasters.searchanalytics.query({
                siteUrl: url,
                requestBody: configTwo,
            });

            if (secondaryData.data.rows.length === 0) {
                return primaryData.data.rows;
            }

            let secondArr = [];
            secondaryData.data.rows.filter((item) => {
                item.impressions >= 4 ? secondArr.push(item) : null
            })
            const result = firstArr.concat(secondArr);
            console.log('Data fetched successfully...');
            return result
        } catch (err) {
            console.log(err);
            return;
        }
    }
}

export default HttpService