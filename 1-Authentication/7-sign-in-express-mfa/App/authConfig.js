/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

require('dotenv').config({ path: '.env.dev' });

const TENANT_SUBDOMAIN = process.env.TENANT_SUBDOMAIN || 'Enter_the_Tenant_Subdomain_Here';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/auth/redirect';
const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI || 'http://localhost:3000';

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID || 'Enter_the_Application_Id_Here', // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
        authority: process.env.AUTHORITY || `https://${TENANT_SUBDOMAIN}.ciamlogin.com/`, // Replace the placeholder with your tenant name
        clientSecret: process.env.CLIENT_SECRET || 'Enter_the_Client_Secret_Here', // Client secret generated from the app registration in Azure portal
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

const GRAPH_API_ENDPOINT = process.env.GRAPH_API_ENDPOINT || "graph_end_point";
// Refers to the user that is single user singed in.
// https://learn.microsoft.com/en-us/graph/api/user-update?view=graph-rest-1.0&tabs=http
const GRAPH_ME_ENDPOINT = GRAPH_API_ENDPOINT + "v1.0/me";

const mfaProtectedResourceScope = process.env.MFA_PROTECTED_SCOPE || 'Add_your_protected_scope_here';

module.exports = {
    msalConfig,
    mfaProtectedResourceScope,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI,
    TENANT_SUBDOMAIN,
    GRAPH_API_ENDPOINT,
    GRAPH_ME_ENDPOINT,
};
