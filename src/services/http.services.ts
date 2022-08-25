import { GscResponse } from "../interfaces/GscResponse.interface";

const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

class HttpService {
    private _accessToken: any;

    async _post(url: string, startDate: string, endDate: string) {
        await this._autoLogin();
        const webmasters = google.webmasters('v3');

        try {
            const configOne = {
                startDate: startDate,
                endDate: endDate,
                aggregationType: "byPage",
                dimension: ['query', 'page'],
                type: "web",
                rowLimit: 25000
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
            primaryData.data.rows.filter((item: GscResponse) => {
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
            secondaryData.data.rows.filter((item: GscResponse) => {
                item.impressions >= 4 ? secondArr.push(item) : null
            })
            const result = firstArr.concat(secondArr);
            return result
        } catch (err) {
            console.log(err);
            return;
        }

    }

    async _login() {
        console.log(`Attempting to log in...`);

        const auth = await authenticate({
            keyfilePath: path.join(__dirname, '../services/utils/google-keys.json'),
            scopes: [
                'https://www.googleapis.com/auth/webmasters.readonly',
            ],
        });
        google.options({ auth });

        if (!auth.credentials.access_token) {
            console.log(`Something went wrong when trying to login`);
            return false;
        }
        console.log(`Successfully logged in.`);
        this.accessToken = auth.credentials.access_token;
        return true;
    }

    async _autoLogin() {
        if (!this.accessToken) {
            console.log(`User not logged in.`);
            return this._login();
        }
        return true;
    }

    set accessToken(value) {
        this._accessToken = value;
    }

    get accessToken() {
        return this._accessToken;
    }
}

export default HttpService