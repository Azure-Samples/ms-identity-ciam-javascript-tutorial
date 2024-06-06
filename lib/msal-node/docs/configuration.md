# Configuration Options

Before you start here, make sure you understand how to [initialize an app object](./initialize-public-client-application.md).

The MSAL library has a set of configuration options that can be used to customize the behavior of your authentication flows. These options can be set either in the constructor of the [PublicClientApplication](https://azuread.github.io/microsoft-authentication-library-for-js/ref/classes/_azure_msal_node.publicclientapplication.html) object or as part of the [request APIs](request.md). Here we describe the configuration object that can be passed into the [PublicClientApplication](https://azuread.github.io/microsoft-authentication-library-for-js/ref/classes/_azure_msal_node.publicclientapplication.html) constructor.

In this document:

-   [Usage](#usage)
-   [Options](#options)

## Usage

The configuration object can be passed into the [PublicClientApplication](https://azuread.github.io/microsoft-authentication-library-for-js/ref/classes/_azure_msal_node.publicclientapplication.html) constructor. The only required config parameter is the `client_id` of the application. Everything else is optional, but may be required depending on your authentication flow, tenant and application model.

[Configuration](https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#configuration) object with all supported parameters is as below:

```javascript

// Call back APIs which automatically write and read into a .json file - example implementation
const beforeCacheAccess = async (cacheContext) => {
    cacheContext.tokenCache.deserialize(await fs.readFile(cachePath, "utf-8"));
};

const afterCacheAccess = async (cacheContext) => {
    if(cacheContext.cacheHasChanged){
        await fs.writeFile(cachePath, cacheContext.tokenCache.serialize());
    }
};

// Cache Plugin
const cachePlugin = {
    beforeCacheAccess,
    afterCacheAccess
};;

const msalConfig = {
    auth: {
        clientId: "enter_client_id_here",
        authority: "https://login.microsoftonline.com/common",
        knownAuthorities: [],
        cloudDiscoveryMetadata: "",
        azureCloudOptions: {
            azureCloudInstance: "enter_AzureCloudInstance_here" // AzureCloudInstance enum is exported as a "type",
            tenant: "enter_tenant_info" // defaults to "common"
        }
    },
    cache: {
        cachePlugin // your implementation of cache plugin
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Verbose,
        },
        proxyUrl: "",
        customAgentOptions: {},
    }
}

const msalInstance = new PublicClientApplication(msalConfig);
```

## Options

### Auth Config Options

| Option                       | Description                                                                                                                                                                                                                                                                              | Format                                                                                                                                       | Default Value                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `clientId`                   | App ID of your application. Can be found in your [portal registration](../README.md#prerequisites).                                                                                                                                                                                      | UUID/GUID                                                                                                                                    | None. This parameter is required in order for MSAL to perform any actions. |
| `authority`                  | URI of the tenant to authenticate and authorize with. Usually takes the form of `https://{uri}/{tenantid}` (see [Authority](../../msal-common/docs/authority.md))                                                                                                                        | String in URI format with tenant - `https://{uri}/{tenantid}`                                                                                | `https://login.microsoftonline.com/common`                                 |
| `knownAuthorities`           | An array of URIs that are known to be valid. Used in B2C scenarios.                                                                                                                                                                                                                      | Array of strings in URI format                                                                                                               | Empty array `[]`                                                           |
| `cloudDiscoveryMetadata`     | A string containing the cloud discovery response. Used in AAD scenarios. See [Performance](../../msal-common/docs/performance.md) for more info                                                                                                                                          | string                                                                                                                                       | Empty string `""`                                                          |
| `authorityMetadata`          | A string containing the .well-known/openid-configuration endpoint response. See [Performance](../../msal-common/docs/performance.md) for more info                                                                                                                                       | string                                                                                                                                       | Empty string `""`                                                          |
| `clientCapabilities`         | Array of capabilities to be added to all network requests as part of the `xms_cc` claims request (see: [Client capability in MSAL](../../msal-common/docs/client-capability.md))                                                                                                         | Array of strings                                                                                                                             | []                                                                         |
| `protocolMode`               | Enum representing the protocol mode to use. If `"AAD"`, will function on the AAD v2 endpoints; if `"OIDC"`, will function on OIDC-compliant endpoints.                                                                                                                                   | string                                                                                                                                       | `"AAD"`                                                                    |
| `azureCloudOptions`          | A defined set of azure cloud options for developers to default to their specific cloud authorities, for specific clouds supported please refer to the [AzureCloudInstance](aka.ms/msaljs/azure_cloud_instance)                                                                           | [AzureCloudOptions](https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_common.html#azurecloudoptions) | [AzureCloudInstance.None](msaljs/azure_cloud_instance)                     |
| `skipAuthorityMetadataCache` | A flag to choose whether to use the local metadata cache during authority initialization. Metadata cache would be used if no authority metadata is provided in configuration and before a network call for metadata has been made (see [Authority](../../msal-common/docs/authority.md)) | boolean                                                                                                                                      | `false`                                                                    |

### Cache Config Options

| Option        | Description                                                                                                      | Format                                                                                                                           | Default Value |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `cachePlugin` | Cache plugin with call backs to reading and writing into the cache persistence (see also: [caching](caching.md)) | [ICachePlugin](https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#icacheplugin) | null          |

### Broker Config Options

| Option               | Description                                                                                        | Format              | Default Value |
| -------------------- | -------------------------------------------------------------------------------------------------- | ------------------- | ------------- |
| `nativeBrokerPlugin` | Broker plugin for acquiring tokens via a native token broker (see also: [brokering](brokering.md)) | INativeBrokerPlugin | null          |

### System Config Options

| Option                   | Description                                                                                                                                                                      | Format                                                                                                                     | Default Value                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `loggerOptions`          | Config object for logger.                                                                                                                                                        | See [below](#logger-config-options).                                                                                       | See [below](#logger-config-options).                                                                                                 |
| `NetworkClient`          | Custom HTTP implementation                                                                                                                                                       | INetworkModule                                                                                                             | [HttpClient.ts](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/src/network/HttpClient.ts) |
| `proxyUrl`               | The URL of the proxy the app is running behind                                                                                                                                   | string                                                                                                                     | Empty string `""`                                                                                                                    |
| `customAgentOptions`     | Set of configurable options to set on a http(s) agent                                                                                                                            | Object - [NodeJS documentation on alloweable options](https://nodejs.org/docs/latest-v16.x/api/http.html#new-agentoptions) | Empty Object `{}`                                                                                                                    |
| `disableInternalRetries` | A flag that disables MSALJS's built-in retry policies, allowing the app developer to specify their own retry policy. Currently, only Managed Identity flows have a retry policy. | boolean                                                                                                                    | boolean `false`                                                                                                                      |

#### Logger Config Options

| Option              | Description                                                             | Format                                                                                      | Default Value        |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| `loggerCallback`    | Callback function which handles the logging of MSAL statements.         | Function - `loggerCallback: (level: LogLevel, message: string, containsPii: boolean): void` | See [above](#usage). |
| `piiLoggingEnabled` | If true, personally identifiable information (PII) is included in logs. | boolean                                                                                     | `false`              |

### Telemetry Config Options

| Option        | Description                                      | Format                              | Default Value                       |
| ------------- | ------------------------------------------------ | ----------------------------------- | ----------------------------------- |
| `application` | Telemetry options for applications using MSAL.js | See [below](#application-telemetry) | See [below](#application-telemetry) |

#### Application Telemetry

| Option       | Description                           | Format | Default Value   |
| ------------ | ------------------------------------- | ------ | --------------- |
| `appName`    | Unique string name of an application  | string | Empty string "" |
| `appVersion` | Version of the application using MSAL | string | Empty string "" |

## Next Steps

Proceed to understand the public APIs provided by `msal-node` for acquiring tokens [here](request.md)
