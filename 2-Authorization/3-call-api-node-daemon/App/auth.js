import { ConfidentialClientApplication } from '@azure/msal-node';

import { msalConfig, protectedResources } from './authConfig.js';


/**
 * With client credentials flows permissions need to be granted in the portal by a tenant administrator.
 * The scope is always in the format '<resource-appId-uri>/.default'. For more, visit:
 * https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
export const tokenRequest = {
    scopes: [`${protectedResources.apiToDoList.scopes}/.default`],
};

export const apiConfig = {
    uri: protectedResources.apiToDoList.endpoint,
};



/**
 * Initialize a confidential client application. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md
 */

const cca = new ConfidentialClientApplication(msalConfig);

/**
 * Acquires token with client credentials.
 * @param {object} tokenRequest
 */
export async function getToken(tokenRequest) {
    return await cca.acquireTokenByClientCredential(tokenRequest);
}