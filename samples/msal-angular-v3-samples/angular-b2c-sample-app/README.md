# Angular 16 B2C Sample using MSAL Angular v3

This developer sample is used to demonstrate how to use `@azure/msal-angular` on Azure AD B2C.

## How to run the sample

### Pre-requisites

- Ensure [all pre-requisites](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/README.md) have been completed to run msal-angular.

### B2C App Registration

This sample comes with a pre-registered application for demo purposes. If you would like to use your own **Azure AD B2C** tenant and application, follow the steps below:

1. [Create an Azure Active Directory B2C tenant](https://docs.microsoft.com/azure/active-directory-b2c/tutorial-create-tenant)
2. [Register a single-page application in Azure Active Directory B2C](https://docs.microsoft.com/azure/active-directory-b2c/tutorial-register-spa)
3. [Create user-flows in Azure Active Directory B2C](https://docs.microsoft.com/azure/active-directory-b2c/tutorial-create-user-flows)

### Configure the application

Open `.src/environments/environment.dev.ts` in an editor:
- Replace `clientId` with the Application (client) ID from the portal registration, or use the currently configured lab registration.
  - Optionally, you may replace any of the other parameters, or you can remove them and use the default values.
- Replace `names`, `authorities` and `authorityDomain` fields in `b2cPolicies` object with the parameters you've obtained after creating your own user-flows.
  - Optionally, replace the `uri` and `scopes` fields in `apiConfig` object if you would like to call your own web API registered on Azure AD B2C (see: [Register a web API on Azure AD B2C](https://docs.microsoft.com/azure/active-directory-b2c/add-web-api-application?tabs=app-reg-ga))

These parameters are taken in during runtime to initialize MSAL in `./src/app/app.module.ts`.

### Running the sample

- Install the dependencies by running `npm install` in a terminal.
- Once this is done, run `npm start`.
- Navigate to [http://localhost:4200](http://localhost:4200)
- In the web page, click on the "Login" button. The app will automatically reload if you change any of the source files.

### How to handle B2C user-flows

Implementing B2C user-flows is a matter of initiating authorization requests against the corresponding authorities. This sample demonstrates [sign-up/sign-in](https://docs.microsoft.com/azure/active-directory-b2c/add-sign-up-and-sign-in-policy?pivots=b2c-user-flow), legacy [password-reset](https://docs.microsoft.com/azure/active-directory-b2c/add-password-reset-policy?pivots=b2c-user-flow#password-reset-policy-legacy) and [edit-profile](https://docs.microsoft.com/azure/active-directory-b2c/add-profile-editing-policy?pivots=b2c-user-flow) user-flows.

> Please consider migrating to the new (aka **recommended**) [self-service password reset](https://docs.microsoft.com/azure/active-directory-b2c/add-password-reset-policy?pivots=b2c-user-flow#self-service-password-reset-recommended) user flow. See the [msal-react B2C sample with self-service password reset](../../msal-react-samples/b2c-sample/) for an example.

## Additional notes

- The default interaction type for the sample is redirect. The sample can be configured to use popups by changing the `interactionType` in `app.module.ts` to `InteractionType.Popup`.

- If you would like to protect all the routes in your application so that upon hitting any page, users are automatically prompted for login, follow the [steps outlined in FAQ](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/FAQ.md#how-do-i-log-users-in-when-they-hit-the-application)

## Common errors

- If your app is running into redirect loops when trying to acquire a token for a resource such as your web API, make sure you have granted **admin consent** to the permissions/scopes required for that resource on App registration portal. See [Using redirects in MSAL Angular](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/redirects.md) for more on redirect experience. See [MSAL Angular Errors](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/errors.md) for other common errors.