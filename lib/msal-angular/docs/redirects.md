# Using redirects in MSAL Angular

When using redirects with MSAL, it is **mandatory** to handle redirects with either the `MsalRedirectComponent` or `handleRedirectObservable`. While we recommend `MsalRedirectComponent` as the best approach, both approaches are detailed below.

Note that specific guidance has been added for using MSAL Angular v3 with Angular standalone components below.

1. [`MsalRedirectComponent`](#msalredirectcomponent-a-dedicated-handleredirectobservable-component)
1. [Subscribing to `handleRedirectObservable` manually](#subscribing-to-handleredirectobservable-manually)
1. [Redirects with standalone components](#redirects-with-standalone-components)

## `MsalRedirectComponent`: A dedicated `handleRedirectObservable` component

This is our recommended approach for handling redirects:

- `@azure/msal-angular` provides a dedicated redirect component that can be imported  into your application. We recommend importing the `MsalRedirectComponent` and bootstrapping this alongside `AppComponent` in your application on the `app.module.ts`, as this will handle all redirects without your components needing to subscribe to `handleRedirectObservable()` manually.
- Pages that wish to perform functions following redirects (e.g. user account functions, UI changes, etc) should subscribe to the `inProgress$` observable, filtering for `InteractionStatus.None`. This will ensure that there are no interactions in progress when performing the functions. Note that the last / most recent `InteractionStatus` will also be available when subscribing to the `inProgress$` observable. Please see our documentation on [events](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/events.md#the-inprogress-observable) for more information on checking for interactions.
- If you do not wish to use the `MsalRedirectComponent`, you **must** handle redirects with `handleRedirectObservable()` yourself, as laid out in the approach below.
- See our [Angular 15 sample](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/samples/msal-angular-v3-samples/angular15-sample-app/src/app/app.module.ts#L110) for an example of this approach.

Note that although this is our recommendation for most Angular applications, this approach may not work with Angular standalone components. See the section on [redirects with standalone components below](#redirects-with-standalone-components) for further guidance.

msal.redirect.component.ts
```js
// This component is part of @azure/msal-angular and can be imported and bootstrapped
import { Component, OnInit } from "@angular/core";
import { MsalService } from "./msal.service.ts";

@Component({
  selector: 'app-redirect', // Selector to be added to index.html
  template: ''
})
export class MsalRedirectComponent implements OnInit {
  
  constructor(private authService: MsalService) { }
  
  ngOnInit(): void {    
      this.authService.handleRedirectObservable().subscribe();
  }
  
}

```

index.html
```js 
<body>
  <app-root></app-root>
  <app-redirect></app-redirect> <!-- Selector for additional bootstrapped component -->
</body>
```

app.module.ts

```js
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

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalBroadcastService, MsalInterceptorConfiguration, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalRedirectComponent } from '@azure/msal-angular'; // Redirect component imported from msal-angular

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: 'b5c2e510-4a17-4feb-b219-e55aa5b74144',
      redirectUri: 'http://localhost:4200',
      postLogoutRedirectUri: 'http://localhost:4200'
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    },
    system: {
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
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return { interactionType: InteractionType.Redirect };
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    HttpClientModule,
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
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent] // Redirect component bootstrapped here
})
export class AppModule { }

```

app.component.ts
```js
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MsalBroadcastService, InteractionStatus } from '@azure/msal-angular';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private msalBroadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        // Do user account/UI functions here
      })
  }
```

## Subscribing to `handleRedirectObservable` manually

This is not our recommended approach, but if you are unable to bootstrap the `MsalRedirectComponent`, you **must** handle redirects using the `handleRedirectObservable` as follows:

- `handleRedirectObservable()` should be subscribed to on **every** page to which a redirect may occur. Pages protected by the MSAL Guard do not need to subscribe to `handleRedirectObservable()`, as redirects are processed in the Guard.
- Accessing or performing any action related to user accounts should not be done until `handleRedirectObservable()` is complete, as it may not be fully populated until then. Additionally, if interactive APIs are called while `handleRedirectObservables()` is in progress, it will result in an `interaction_in_progress` error. See our document on [events](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/events.md#the-inprogress-observable) for more information on checking for interactions, and our document on [errors](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/errors.md) for details about the `interaction_in_progress` error. 
- See our [older MSAL Angular v2 Angular 9 sample](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/msal-lts/samples/msal-angular-v2-samples/angular9-v2-sample-app) for examples of this approach.

Example of home.component.ts file:
```js
import { Component, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private authService: MsalService) { }

  ngOnInit(): void {
    this.authService.handleRedirectObservable().subscribe({
      next: (result: AuthenticationResult) => {
        // Perform actions related to user accounts here
      },
      error: (error) => console.log(error)
    });
  }

}
```

## Redirects with standalone components

As many Angular applications using standalone components are unable to bootstrap the `MsalRedirectComponent`, `handleRedirectObservable` must be subscribed to directly. Our recommendation is to subscribe to it in the `app.component.ts` file.

- Depending on your application architecture, you may have to subscribe to `handleRedirectObservable()` in other areas as well.
- Checking for interactions in progress still applies, please see our document on [events](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/events.md#the-inprogress-observable) for more information on checking for interactions. 
- See our [Angular standalone sample](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/samples/msal-angular-v3-samples/angular-standalone-sample) for examples of this approach.

Example of `app.component.ts` file

```js
import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule} from '@angular/router';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class AppComponent implements OnInit {

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    this.authService.handleRedirectObservable().subscribe(); // Subscribing to handleRedirectObservable before any other functions both initializes the application and ensures redirects are handled
  }
}

```