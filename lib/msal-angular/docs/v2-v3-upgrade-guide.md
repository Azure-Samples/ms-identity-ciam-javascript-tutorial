# Upgrading from MSAL Angular v2 to v3

MSAL Angular v3 brings our Angular wrapper up-to-date with the latest version of MSAL Browser, and with out-of-the-box support for Angular 15, 16, 17, 18 and rxjs 7.

This guide will demonstrate changes needed to migrate an existing application from `@azure/msal-angular` v2 to v3.

If you are migrating from `@azure/msal-angular` v1, please refer to the [v1-v2 migration guide](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular/docs/v1-v2-upgrade-guide.md) first to migrate to MSAL v2.

Please also see the [MSAL Browser Migration Doc](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser/docs/v2-migration.md) for browser support and other key changes.

## Breaking changes in `@azure/msal-angular@3`

### Initialization

#### Applications using redirects

MSAL v3.x now requires initializing the application object. Initialization has been built into the `MsalRedirectComponent` and `handleRedirectObservable` API, and applications that have implemented redirect strategies do not have to make changes. Additional changes may need to be made if your application is using standalone components.

See the [guide to redirects](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular/docs/redirects.md) for details on handling redirects in your application.

#### Applications using popups

Due to initialization being built into `MsalRedirectComponent` and `handleRedirectObservable`, applications that only use popups will also have to either bootstrap the `MsalRedirectComponent` or call `handleRedirectObservable` manually once to initialize the application object.

See the [guide to redirects](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular/docs/redirects.md) for set up details.

## Angular 15, 16, 17, 18 and rxjs@7

MSAL Angular now expects that your application is built with: 

- `@angular/core@15` or `@angular/core@16` or `@angular/core@17` or `@angular/core@18`
- `@angular/common@15` or `@angular/common@16` or `@angular/common@17` or `@angular/common@18`
- `rxjs@7`

Due to this change, MSAL Angular v3 is not backwards compatible with earlier versions of Angular and RxJS and you may need to update your application. Please follow the [Angular Update Guide](https://update.angular.io/) to update your application to Angular 15, 16, 17 or 18.

As with MSAL Angular v2, `rxjs-compat` is not required.

## Samples

The following developer samples are now available:

- [Angular 15 sample](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-angular-v3-samples/angular15-sample-app)
- [Angular 16 sample](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-angular-v3-samples/angular16-sample-app)
- [Angular 16 sample using B2C](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-angular-v3-samples/angular-b2c-sample-app)
- [Angular 16 sample using Angular standalone components](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-angular-v3-samples/angular-standalone-sample)
- [Angular 17 Standalone Sample](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-angular-v3-samples/angular17-standalone-sample)
- [Angular 18 Standalone Sample](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-angular-v3-samples/angular18-standalone-sample)

The samples demonstrates basic configuration and usage, and may be improved and added to incrementally.

See [here](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/samples/msal-angular-v3-samples/README.md) for a list of the MSAL Angular v3 samples and the features demonstrated.
