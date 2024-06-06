# Performance

This document will outline techniques your application can use to improve the performance of token acquisition using MSAL.

## Bypass cloud instance discovery resolution

> :information_source: This section does not apply if you are using **B2C**, **ADFS** or **dSTS** authorities. You will need to provide your authority domains to the `auth.knownAuthorities` property in the `PublicClientApplication`/`ConfidentialClientApplication` configuration object instead.
>
> * [msal-browser configration](../../msal-browser/docs/configuration.md#auth-config-options)
> * [msal-node configuration](../../msal-browser/docs/configuration.md#auth-config-options)

By default, during the process of retrieving a token, MSAL will make a network request to retrieve metadata associated with the various Azure clouds. If you would like to skip this network request, you can provide the required metadata in the configuration of `PublicClientApplication` or `ConfidentialClientApplication`.

> :warning: It is your application's responsibility to ensure it is using correct, up-to-date cloud instance metadata. Failure to do so may result in your application not working correctly.

### Instructions

Instance Discovery Endpoint: `https://login.microsoftonline.com/common/discovery/instance?api-version=1.1&authorization_endpoint=https://login.microsoftonline.com/common/oauth2/v2.0/authorize`

1. Make a request to the instance discovery endpoint above
2. Provide the **entire** JSON response to the `auth.cloudDiscoveryMetadata` property.

**Note** If none of the aliases listed in the response match your authority you should pass your authority domain in `auth.knownAuthorities` instead.

Example:

```js
const msalInstance = new PublicClientApplication({
    auth: {
        cloudDiscoveryMetadata: '{"tenant_discovery_endpoint":"https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration","api-version":"1.1","metadata":[{"preferred_network":"login.microsoftonline.com","preferred_cache":"login.windows.net","aliases":["login.microsoftonline.com","login.windows.net","login.microsoft.com","sts.windows.net"]},{"preferred_network":"login.partner.microsoftonline.cn","preferred_cache":"login.partner.microsoftonline.cn","aliases":["login.partner.microsoftonline.cn","login.chinacloudapi.cn"]},{"preferred_network":"login.microsoftonline.de","preferred_cache":"login.microsoftonline.de","aliases":["login.microsoftonline.de"]},{"preferred_network":"login.microsoftonline.us","preferred_cache":"login.microsoftonline.us","aliases":["login.microsoftonline.us","login.usgovcloudapi.net"]},{"preferred_network":"login-us.microsoftonline.com","preferred_cache":"login-us.microsoftonline.com","aliases":["login-us.microsoftonline.com"]}]}'
    }
});

// OR

const msalInstance = new ConfidentialClientApplication({
    auth: {
        cloudDiscoveryMetadata: '{"tenant_discovery_endpoint":"https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration","api-version":"1.1","metadata":[{"preferred_network":"login.microsoftonline.com","preferred_cache":"login.windows.net","aliases":["login.microsoftonline.com","login.windows.net","login.microsoft.com","sts.windows.net"]},{"preferred_network":"login.partner.microsoftonline.cn","preferred_cache":"login.partner.microsoftonline.cn","aliases":["login.partner.microsoftonline.cn","login.chinacloudapi.cn"]},{"preferred_network":"login.microsoftonline.de","preferred_cache":"login.microsoftonline.de","aliases":["login.microsoftonline.de"]},{"preferred_network":"login.microsoftonline.us","preferred_cache":"login.microsoftonline.us","aliases":["login.microsoftonline.us","login.usgovcloudapi.net"]},{"preferred_network":"login-us.microsoftonline.com","preferred_cache":"login-us.microsoftonline.com","aliases":["login-us.microsoftonline.com"]}]}'
    }
});
```

## Bypass authority metadata resolution

By default, during the process of retrieving a token MSAL will make a network request to retrieve metadata from the authority configured for the request. If you would like to skip this network request, you can provide the required metadata in the configuration of `PublicClientApplication` or `ConfidentialClientApplication`.

> :warning: It is your application's responsibility to ensure it is using correct, up-to-date authority metadata. Failure to do so may result in your application not working correctly.

### Instructions

1. Determine the openid-configuration endpoint for your authority. For example, if you are using `https://login.microsoftonline.com/common/`, the openid-configuration endpoint is `https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration`.
2. Make a request to the url in step 1.
3. Take the **entire** response and provide the raw JSON string as the `auth.authorityMetadata` property for `PublicClientApplication`/`ConfidentialClientApplication`.

Example:

```js
const msalInstance = new PublicClientApplication({
    auth: {
        authorityMetadata: '{"token_endpoint":"https://login.microsoftonline.com/common/oauth2/v2.0/token","token_endpoint_auth_methods_supported":["client_secret_post","private_key_jwt","client_secret_basic"],"jwks_uri":"https://login.microsoftonline.com/common/discovery/v2.0/keys","response_modes_supported":["query","fragment","form_post"],"subject_types_supported":["pairwise"],"id_token_signing_alg_values_supported":["RS256"],"response_types_supported":["code","id_token","code id_token","id_token token"],"scopes_supported":["openid","profile","email","offline_access"],"issuer":"https://login.microsoftonline.com/{tenantid}/v2.0","request_uri_parameter_supported":false,"userinfo_endpoint":"https://graph.microsoft.com/oidc/userinfo","authorization_endpoint":"https://login.microsoftonline.com/common/oauth2/v2.0/authorize","http_logout_supported":true,"frontchannel_logout_supported":true,"end_session_endpoint":"https://login.microsoftonline.com/common/oauth2/v2.0/logout","claims_supported":["sub","iss","cloud_instance_name","cloud_instance_host_name","cloud_graph_host_name","msgraph_host","aud","exp","iat","auth_time","acr","nonce","preferred_username","name","tid","ver","at_hash","c_hash","email"],"tenant_region_scope":null,"cloud_instance_name":"microsoftonline.com","cloud_graph_host_name":"graph.windows.net","msgraph_host":"graph.microsoft.com","rbac_url":"https://pas.windows.net"}'
    }
});

// OR

const msalInstance = new ConfidentialClientApplication({
    auth: {
        authorityMetadata: '{"token_endpoint":"https://login.microsoftonline.com/common/oauth2/v2.0/token","token_endpoint_auth_methods_supported":["client_secret_post","private_key_jwt","client_secret_basic"],"jwks_uri":"https://login.microsoftonline.com/common/discovery/v2.0/keys","response_modes_supported":["query","fragment","form_post"],"subject_types_supported":["pairwise"],"id_token_signing_alg_values_supported":["RS256"],"response_types_supported":["code","id_token","code id_token","id_token token"],"scopes_supported":["openid","profile","email","offline_access"],"issuer":"https://login.microsoftonline.com/{tenantid}/v2.0","request_uri_parameter_supported":false,"userinfo_endpoint":"https://graph.microsoft.com/oidc/userinfo","authorization_endpoint":"https://login.microsoftonline.com/common/oauth2/v2.0/authorize","http_logout_supported":true,"frontchannel_logout_supported":true,"end_session_endpoint":"https://login.microsoftonline.com/common/oauth2/v2.0/logout","claims_supported":["sub","iss","cloud_instance_name","cloud_instance_host_name","cloud_graph_host_name","msgraph_host","aud","exp","iat","auth_time","acr","nonce","preferred_username","name","tid","ver","at_hash","c_hash","email"],"tenant_region_scope":null,"cloud_instance_name":"microsoftonline.com","cloud_graph_host_name":"graph.windows.net","msgraph_host":"graph.microsoft.com","rbac_url":"https://pas.windows.net"}'
    }
});
```
