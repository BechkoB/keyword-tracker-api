const { google } = require("googleapis");
const { getJwtToken } = require("./google-login.service");

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_sercret = process.env.GOOGLE_SECRET;
const MAIN_URL = process.env.MAIN_URL;
class HttpService {
  async _post(url: string, startDate: string, endDate: string) {
    // const pairData = await this.fetchData(
    //   oauth2Client,
    //   url,
    //   startDate,
    //   endDate,
    //   "page"
    // );
    // const queryData = await this.fetchData(
    //   oauth2Client,
    //   url,
    //   startDate,
    //   endDate,
    //   "query"
    // );
    // console.log("Started saving...");
    // return {
    //   pairData,
    //   queryData,
    // };
  }

  async _login() {
    console.log("Attempting to login...");
    const auth = await getJwtToken();

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_sercret
    );
    oauth2Client.setCredentials({
      access_token: auth.access_token,
    });
    console.log("Login successful...");
    return oauth2Client;
  }

  async fetchData(
    startDate: string,
    endDate: string,
    from: string
  ) {
    const oauth2Client = await this._login();
    console.log("Attempting to call API...");
    google.options({ auth: oauth2Client });
    const webmasters = google.webmasters("v3");

    try {
      const pairConfigOne = {
        startDate: startDate,
        endDate: endDate,
        aggregationType: "byPage",
        dimension: ["query", "page"],
        type: "web",
        rowLimit: 25000,
        startRow: 1,
      };

      const pairConfigTwo = {
        startDate: startDate,
        endDate: endDate,
        aggregationType: "byPage",
        dimension: ["query", "page"],
        type: "web",
        rowLimit: 25000,
        startRow: 25001,
      };

      const queryConfigOne = {
        startDate: startDate,
        endDate: endDate,
        aggregationType: "byProperty",
        dimension: ["query"],
        type: "web",
        rowLimit: 25000,
        startRow: 1,
      };

      const queryConfigTwo = {
        startDate: startDate,
        endDate: endDate,
        aggregationType: "byProperty",
        dimension: ["query"],
        type: "web",
        rowLimit: 25000,
        startRow: 25001,
      };

      const primaryData = await webmasters.searchanalytics.query({
        siteUrl: MAIN_URL,
        requestBody: from === "query" ? queryConfigOne : pairConfigOne,
      });
      if (primaryData.data.rows.length === 0) {
        return;
      }
      let firstArr = [];
      primaryData.data.rows.forEach((item) => {
        item.impressions >= 4 ? firstArr.push(item) : null;
      });

      if(primaryData.data.rows.length === 25000) {
        const secondaryData = await webmasters.searchanalytics.query({
          siteUrl: MAIN_URL,
          requestBody: from === "query" ? queryConfigTwo : pairConfigTwo,
        });
        if (secondaryData.data.rows !== undefined) {
          let secondArr = [];
          secondaryData.data.rows.filter((item) => {
            item.impressions >= 4 ? secondArr.push(item) : null;
          });
          firstArr = firstArr.concat(secondArr);
          console.log("Data fetched successfully...");
        }
      } 
      return firstArr;
    } catch (err) {
      console.log(err);
      return;
    }
  }
}

export default HttpService;
