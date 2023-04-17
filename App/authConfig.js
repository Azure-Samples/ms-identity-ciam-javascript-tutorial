/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

require('dotenv').config();

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID || "Enter_the_Application_Id_Here", // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
        authority: process.env.AUTHORITY || "https://Enter_the_Tenant_Name_Here.ciamlogin.com/Enter_the_Tenant_Name_Here.onmicrosoft.com", // replace "Enter_the_Tenant_Name_Here" with your tenant name
        knownAuthorities: ["Enter_the_Tenant_Name_Here.ciamlogin.com"], // replace "Enter_the_Tenant_Name_Here" with your tenant name
        clientSecret: process.env.CLIENT_SECRET || "Enter_the_Client_Secret_Here" // Client secret generated from the app registration in Azure portal
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: "Info",
        }
    }
}

const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3000/auth/redirect";
const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI || "http://localhost:3000";

module.exports = {
    msalConfig,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI,
};
