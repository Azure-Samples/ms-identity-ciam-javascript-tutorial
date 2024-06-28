/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import 'dotenv/config';
import 'fs';

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */

export const msalConfig = {
    auth: {
        // clientId: process.env.CLIENT_ID || 'Enter_the_Application_Id_Here', // 'Application (client) ID' of app registration in Microsoft Entra admin center - this value is a GUID
        // authority: process.env.AUTHORITY || 'https://Enter_the_Tenant_Subdomain_Here.ciamlogin.com/', // Replace the placeholder with your tenant subdomain
        // clientSecret: process.env.CLIENT_SECRET || 'Enter_the_Client_Secret_Here', // Client secret generated from the app registration in Microsoft Entra admin center
        clientId: process.env.CLIENT_ID || '1bf1df88-5c9a-4bae-80cc-c4d9083b58ef', // 'Application (client) ID' of app registration in Microsoft Entra admin center - this value is a GUID
        authority: process.env.AUTHORITY || 'https://TrialTenantkwFwHYij.ciamlogin.com/', // Replace the placeholder with your tenant subdomain
        clientSecret: process.env.CLIENT_SECRET || 'pxg8Q~1zJ3CYanSGTD4X3URJ3jMhg.5jaZElfcg~', // Client secret generated from the app registration in Microsoft Entra admin center
        // clientCertificate: {
        //     thumbprint:  process.env.CERT_THUMBPRINT || 'YOUR_CERT_THUMBPRINT', // replace with thumbprint obtained during step 2 above
        //     privateKey: fs.readFileSync(process.env.CERT_PRIVATE_KEY_FILE || 'PATH_TO_YOUR_PRIVATE_KEY_FILE'), // e.g. c:/Users/diego/Desktop/example.key
        // },
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: 'Info',
        },
    },
};

export const protectedResources = {
    apiToDoList: {
        endpoint: process.env.API_ENDPOINT || 'https://localhost:44351/api/todolist',
        scopes: [process.env.SCOPES || 'api://9c41be2b-d52d-4209-b987-1459a3d62d99'],
    },
};