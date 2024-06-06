# MSAL Angular Configuration

MSAL for Angular can be configured in multiple ways:
1. [`MsalModule.forRoot`](#msalmoduleforroot)
1. [Factory providers](#factory-providers)
1. [`platformBrowserDynamic`](#platformbrowserdynamic)
1. [Dynamic configurations using Factory Providers and `APP_INITIALIZER`](#dynamic-configurations-using-factory-providers-and-app_initializer)
1. [Configurations for Angular 17 apps with standalone components](#configurations-for-angular-17-apps-with-standalone-components)

This guide will detail how to leverage each method for your application.

## Configuration Options

`@azure/msal-angular` accepts three configuration objects:

1. [Configuration](https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_browser.html#configuration): This is the same configuration object that is used for the core `@azure/msal-browser` library. All configuration options can be found [here](https://azuread.github.io/microsoft-authentication-library-for-js/ref/types/_azure_msal_browser.Configuration.html).
2. [`MsalGuardConfiguration`](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/src/msal.guard.config.ts): A set of options specifically for the Angular guard.
3. [`MsalInterceptorConfiguration`](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/src/msal.interceptor.config.ts): A set of options specifically for the Angular interceptor.

### Angular-specific configurations

* An `interactionType` must be specified on `MsalGuardConfiguration` and `MsalInterceptorConfiguration`, and can be set to `Popup` or `Redirect`.
* The `protectedResourceMap` object on `MsalInterceptorConfiguration` is used to protect routes.
* An optional `authRequest` object can be specified on `MsalGuardConfiguration` and `MsalInterceptorConfiguration` to set additional options. 
* An optional `loginFailedRoute` string can be set on `MsalGuardConfiguration`. Msal Guard will redirect to this route if login is required and fails.

Please see our [MsalInterceptor](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/msal-interceptor.md) and [MsalGuard](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/msal-guard.md) docs for more details on configurations, usage, and differences to MSAL Angular v1.

### Configuration for redirects

We recommend importing `MsalRedirectComponent` and bootstrapping with the `AppComponent` if you intend to use redirects. Please see the [redirect documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular/docs/redirects.md) for more details. 

**Note:** As of MSAL v3.x, initialization of the application object is now required. See the [v2-v3 upgrade guide](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular/docs/v2-v3-upgrade-guide.md) for more details.

## MsalModule.forRoot

The `MsalModule` class contains a static method that can be called in your `app.module.ts` file:

```typescript
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MsalModule, MsalService, MsalGuard, MsalInterceptor, MsalBroadcastService, MsalRedirectComponent } from "@azure/msal-angular";
import { PublicClientApplication, InteractionType, BrowserCacheLocation } from "@azure/msal-browser";

@NgModule({
    imports: [
        MsalModule.forRoot( new PublicClientApplication({ // MSAL Configuration
            auth: {
                clientId: "clientid",
                authority: "https://login.microsoftonline.com/common/",
                redirectUri: "http://localhost:4200/",
                postLogoutRedirectUri: "http://localhost:4200/",
                navigateToLoginRequestUrl: true
            },
            cache: {
                cacheLocation : BrowserCacheLocation.LocalStorage,
                storeAuthStateInCookie: true, // set to true for IE 11
            },
            system: {
                loggerOptions: {
                    loggerCallback: () => {},
                    piiLoggingEnabled: false
                }
            }
        }), {
            interactionType: InteractionType.Popup, // MSAL Guard Configuration
            authRequest: {
              scopes: ['user.read']
            },
            loginFailedRoute: "/login-failed" 
        }, {
            interactionType: InteractionType.Redirect, // MSAL Interceptor Configuration
            protectedResourceMap
        })
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MsalInterceptor,
            multi: true
        },
        MsalGuard
    ],
    bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule {}
```

## Factory Providers

You may also provide the configuration options via factory providers.

```typescript
import {
  MsalModule,
  MsalService,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalGuard,
  MsalGuardConfiguration,
  MsalBroadcastService, 
  MsalRedirectComponent
} from "@azure/msal-angular";
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation } from "@azure/msal-browser";

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: "b5c2e510-4a17-4feb-b219-e55aa5b74144",
      redirectUri: "http://localhost:4200",
      postLogoutRedirectUri: "http://localhost:4200"
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    },
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set("https://graph.microsoft.com/v1.0/me", ["user.read"]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return { 
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['user.read']
    },
    loginFailedRoute: "./login-failed"
  };
}

@NgModule({
  imports: [
    MsalModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalGuard,
    MsalBroadcastService,
    MsalService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
```

## platformBrowserDynamic

If you need to dynamically configure MSAL Angular (e.g. based on values returned from an API), you can use `platformBrowserDynamic`. `platformBrowserDyamic` is a platform factory, used to bootstrap the application, and is able to take in configuration options. `platformBrowserDynamic` should already be present when the Angular application is set up.

The following is an example of how to dynamically configure `@azure/msal-angular` with `platformBrowserDynamic` and a json file:

`app.module.ts`
```typescript
import {
  MsalModule,
  MsalInterceptor,
  MsalService,
} from '@azure/msal-angular';

@NgModule({
  imports: [
    MsalModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

`main.ts`
```typescript
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { PublicClientApplication, Configuration } from '@azure/msal-browser';

if (environment.production) {
  enableProdMode();
}

function loggerCallback(logLevel: LogLevel, message: string) {
  console.log("MSAL Angular: ", message);
}

fetch('/assets/configuration.json')
  .then(response => response.json())
  .then(json => {
    platformBrowserDynamic([
      { provide: MSAL_INSTANCE, useValue: new PublicClientApplication({
        auth: json.msal.auth,
        cache: json.msal.cache,
        system: {
          loggerOptions: {
            loggerCallback,
            logLevel: LogLevel.Info,
            piiLoggingEnabled: false
          }
        }
      }) },
      { provide: MSAL_GUARD_CONFIG, useValue: {
        interactionType: json.guard.interactionType,
        authRequest: json.guard.authRequest,
        loginFailedRoute: json.guard.loginFailedRoute
      } as MsalGuardConfiguration },
      { provide: MSAL_INTERCEPTOR_CONFIG, useValue: {
        interactionType: json.interceptor.interactionType,
        protectedResourceMap: new Map(json.interceptor.protectedResourceMap)
      } as MsalInterceptorConfiguration },
    ])
      .bootstrapModule(AppModule)
      .catch(err => console.error(err));
  });
```

`src/assets/configuration.json`
```json
{
  "msal": {
    "auth": {
      "clientId": "clientid",
      "authority": "https://login.microsoftonline.com/common/",
      "redirectUri": "http://localhost:4200/",
      "postLogoutRedirectUri": "http://localhost:4200/",
      "navigateToLoginRequestUrl": true
    },
    "cache": {
      "cacheLocation": "localStorage",
      "storeAuthStateInCookie": true
    }
  },
  "guard": {
    "interactionType": "redirect",
    "authRequest": {
      "scopes": ["user.read"]
    },
    "loginFailedRoute": "/login-failed" 
  },
  "interceptor": {
    "interactionType": "redirect",
    "protectedResourceMap": [
      ["https://graph.microsoft.com/v1.0/me", ["user.read"]]
    ]
  }
}
```

## Dynamic configurations using Factory Providers and APP_INITIALIZER

To dynamically configure MSAL Angular, you can use the Factory Providers with APP_INITIALIZER.

`src/app/config.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private settings: any;
  private http: HttpClient;

  constructor(private readonly httpHandler: HttpBackend) {
    this.http = new HttpClient(httpHandler);
  }

  init(endpoint: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.get(endpoint).pipe(map(result => result))
        .subscribe(value => {
          this.settings = value;
          resolve(true);
        },
        (error) => {
          reject(error);
        });
    });
  }

  getSettings(key?: string | Array<string>): any {
    if (!key || (Array.isArray(key) && !key[0])) {
      return this.settings;
    }

    if (!Array.isArray(key)) {
      key = key.split('.');
    }

    let result = key.reduce((account: any, current: string) => account && account[current], this.settings);

    return result;
  }
}
```

`src/app/msal-config-dynamic.module.ts`
```typescript
import { InjectionToken, NgModule, APP_INITIALIZER } from '@angular/core';
import { IPublicClientApplication, PublicClientApplication, 
    LogLevel } from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalBroadcastService,
     MsalInterceptorConfiguration, MsalModule, MsalService,
      MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, 
      MsalGuardConfiguration } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfigService } from './config.service';

const AUTH_CONFIG_URL_TOKEN = new InjectionToken<string>('AUTH_CONFIG_URL');

export function initializerFactory(env: ConfigService, configUrl: string): any {
    const promise = env.init(configUrl).then((value) => {
        console.log('finished getting configurations dynamically.');
    });
    return () => promise;
}

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(config: ConfigService): IPublicClientApplication {
  return new PublicClientApplication({
    auth: config.getSettings('msal').auth,
    cache: config.getSettings('msal').cache,
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(config: ConfigService): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string>>(config.getSettings('interceptor').protectedResourceMap)
  
    return {
      interactionType: config.getSettings('interceptor').interactionType,
      protectedResourceMap
    };
  }
  
export function MSALGuardConfigFactory(config: ConfigService): MsalGuardConfiguration {
    return { 
      interactionType: config.getSettings('guard').interactionType,
      authRequest: config.getSettings('guard').authRequest,
      loginFailedRoute: config.getSettings('guard').loginFailedRoute
    };
}

@NgModule({
    providers: [],
    imports: [MsalModule]
})
export class MsalConfigDynamicModule {

    static forRoot(configFile: string) {
        return {
            ngModule: MsalConfigDynamicModule,
            providers: [
                ConfigService,
                { provide: AUTH_CONFIG_URL_TOKEN, useValue: configFile },
                { provide: APP_INITIALIZER, useFactory: initializerFactory,
                     deps: [ConfigService, AUTH_CONFIG_URL_TOKEN], multi: true },
                {
                    provide: MSAL_INSTANCE,
                    useFactory: MSALInstanceFactory,
                    deps: [ConfigService]
                },
                {
                    provide: MSAL_GUARD_CONFIG,
                    useFactory: MSALGuardConfigFactory,
                    deps: [ConfigService]
                },
                {
                    provide: MSAL_INTERCEPTOR_CONFIG,
                    useFactory: MSALInterceptorConfigFactory,
                    deps: [ConfigService]
                },
                MsalService,
                MsalGuard,
                MsalBroadcastService,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: MsalInterceptor,
                    multi: true
                }
            ]
        };
    }
}
```
`src/app/app.module.ts`
```typescript
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';

import { HttpClientModule } from '@angular/common/http';
import { MsalRedirectComponent } from '@azure/msal-angular';
import { DetailComponent } from './detail/detail.component';
import { MsalConfigDynamicModule } from './msal-config-dynamic.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent,
    DetailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    HttpClientModule,
    MsalConfigDynamicModule.forRoot('assets/configuration.json')
  ],
  providers: [],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
```

`src/assets/configuration.json`
```json
{
  "msal": {
    "auth": {
      "clientId": "clientid",
      "authority": "https://login.microsoftonline.com/common/",
      "redirectUri": "http://localhost:4200/",
      "postLogoutRedirectUri": "http://localhost:4200/",
      "navigateToLoginRequestUrl": true
    },
    "cache": {
      "cacheLocation": "localStorage",
      "storeAuthStateInCookie": true
    }
  },
  "guard": {
    "interactionType": "redirect",
    "authRequest": {
      "scopes": ["user.read"]
    },
    "loginFailedRoute": "/login-failed" 
  },
  "interceptor": {
    "interactionType": "redirect",
    "protectedResourceMap": [
      ["https://graph.microsoft.com/v1.0/me", ["user.read"]]
    ]
  }
}
```

### MsalGuard - Dynamic auth request

The **MsalGuard** also allows you to dynamically change the **authRequest** at runtime. This allow you to pick a different authority for a route, or to dynamically add scopes based on the **RouterStateSnapshot**.

```js
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return { 
    interactionType: InteractionType.Redirect,
    authRequest: (authService, state) => {
      return {
        scopes: state.root.url.some(x => x.path === 'calendar')
          ? ['user.read', '	Calendars.Read']
          : ['user.read']
      }
    },
    loginFailedRoute: "./login-failed"
  };
}
```

## Configurations for Angular 17 apps with standalone components

Angular 17 and 18 applications using standalone components can be used with [factory providers](#factory-providers) as above in the `app.config.ts` file, which is then imported into `main.ts` for bootstrapping.

Please see our [Angular 17 Standalone Sample](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-angular-v3-samples/angular17-standalone-sample) for usage.

```ts
// app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, withFetch, withInterceptors } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalInterceptor, MSAL_INSTANCE, MsalInterceptorConfiguration, MsalGuardConfiguration, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalService, MsalGuard, MsalBroadcastService } from '@azure/msal-angular';

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: "clientid",
      authority: "https://login.microsoftonline.com/common/",
      redirectUri: '/',
      postLogoutRedirectUri: '/'
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    },
    system: {
      allowNativeBroker: false, // Disables WAM Broker
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set("https://graph.microsoft.com/v1.0/me", ["user.read"]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return { 
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['user.read']
    },
    loginFailedRoute: '/login-failed'
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    importProvidersFrom(BrowserModule),
    provideNoopAnimations(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
        provide: HTTP_INTERCEPTORS,
        useClass: MsalInterceptor,
        multi: true
    },
    {
        provide: MSAL_INSTANCE,
        useFactory: MSALInstanceFactory
    },
    {
        provide: MSAL_GUARD_CONFIG,
        useFactory: MSALGuardConfigFactory
    },
    {
        provide: MSAL_INTERCEPTOR_CONFIG,
        useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};
```

```ts
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```