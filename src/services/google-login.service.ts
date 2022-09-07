import axios from "axios";
const crypto = require("crypto");
const client_email = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_KEY.replace(/\\n/gm, '\n');
const privateKeyId = process.env.GOOGLE_KEY_ID;

const header = {
    alg: "RS256",
    typ: "JWT",
    kid: privateKeyId
}

const now = new Date().getTime() / 1000;
const oneHour = 60 * 60;
const expireTime = now + oneHour;

const claimSet = {
    iss: client_email,
    sub: client_email,
    iat: now,
    exp: expireTime,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: "https://oauth2.googleapis.com/token"
}

function toBase64URL(json) {
    const jsonString = JSON.stringify(json);
    const btyeArray = Buffer.from(jsonString);
    return btyeArray.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

const encodedHeader = toBase64URL(header);
const encodedClaimSet = toBase64URL(claimSet);

const signer = crypto.createSign("RSA-SHA256");

signer.write(encodedHeader + "." + encodedClaimSet);
signer.end();

const signature = signer.sign(privateKey, "base64");
const encodedSignature = signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

const jwt = `${encodedHeader}.${encodedClaimSet}.${encodedSignature}`;

export async function getJwtToken() {
    let response: any;
    
    const params = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
    };

    try {
        const res = await axios.post('https://oauth2.googleapis.com/token', params)
        response = res.data;
    } catch (err) {
        console.error(err);
    }

    return response;
}

module.exports = { getJwtToken }