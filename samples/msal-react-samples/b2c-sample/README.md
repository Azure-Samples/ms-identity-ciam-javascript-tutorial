# MSAL.js for React B2C Sample - Authorization Code Flow in Single-Page Applications

## About this sample

This developer sample is used to run basic B2C use cases (user-flows) for the MSAL library. You can also alter the configuration in `./src/authConfig.js` to execute other behaviors.
This sample was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### How to handle B2C user-flows

Implementing B2C user-flows is a matter of initiating authorization requests against the corresponding authorities. This sample demonstrates the [sign-up/sign-in](https://docs.microsoft.com/azure/active-directory-b2c/add-sign-up-and-sign-in-policy?pivots=b2c-user-flow) user-flow with [self-service password reset](https://docs.microsoft.com/azure/active-directory-b2c/add-password-reset-policy?pivots=b2c-user-flow#self-service-password-reset-recommended).

## Notable files and what they demonstrate

1. `./src/App.js` - Shows implementation of `MsalProvider`, all children will have access to `@azure/msal-react` context, hooks and components. Also shows how to handle edit profile user-flow.
1. `./src/index.js` - Shows intialization of the `PublicClientApplication` that is passed to `App.js`
1. `./src/pages/Home.jsx` - Homepage, shows how to conditionally render content using `AuthenticatedTemplate` and `UnauthenticatedTemplate` depending on whether or not a user is signed in.
1. `./src/pages/Profile.jsx` - Example of a protected route using `MsalAuthenticationTemplate`. If a user is not yet signed in, signin will be invoked automatically. If a user is signed in it will acquire an access token and make a call to MS Graph to fetch user profile data.
1. `./src/authConfig.js` - Configuration options for `PublicClientApplication` and B2C policies.
1. `./src/ui-components/SignInSignOutButton.jsx` - Example of how to conditionally render a Sign In or Sign Out button using the `useIsAuthenticated` hook.
1. `./src/ui-components/SignInButton.jsx` - Example of how to get the `PublicClientApplication` instance using the `useMsal` hook and invoking a login function.
1. `./src/ui-components/SignOutButton.jsx` - Example of how to get the `PublicClientApplication` instance using the `useMsal` hook and invoking a logout function.
1. `./src/utils/MsGraphApiCall.js` - Example of how to call the MS Graph API with an access token.

## How to run the sample

### Pre-requisites

- Ensure [all pre-requisites](../../../lib/msal-react/README.md#prerequisites) have been completed to run `@azure/msal-react`.
- Install node.js if needed (<https://nodejs.org/en/>).

### B2C App Registration

This sample comes with a pre-registered application for demo purposes. If you would like to use your own **Azure AD B2C** tenant and application, follow the steps below:

1. [Create an Azure Active Directory B2C tenant](https://docs.microsoft.com/azure/active-directory-b2c/tutorial-create-tenant)
2. [Register a single-page application in Azure Active Directory B2C](https://docs.microsoft.com/azure/active-directory-b2c/tutorial-register-spa)
3. [Create user-flows in Azure Active Directory B2C](https://docs.microsoft.com/azure/active-directory-b2c/tutorial-create-user-flows)

### Configure the application

- Open `./src/authConfig.js` in an editor.
- Replace `clientId` with the Application (client) ID from the portal registration, or use the currently configured lab registration.
  - Optionally, you may replace any of the other parameters, or you can remove them and use the default values.
- Replace `names`, `authorities` and `authorityDomain` fields in `b2cPolicies` object with the parameters you've obtained after creating your own user-flows.
  - Optionally, replace the `uri` and `scopes` fields in `apiConfig` object if you would like to call your own web API registered on Azure AD B2C (see: [Register a web API on Azure AD B2C](https://docs.microsoft.com/azure/active-directory-b2c/add-web-api-application?tabs=app-reg-ga))

These parameters are taken in during runtime to initialize MSAL in `./src/index.js`.

#### Install npm dependencies for sample

```bash
// Install dev dependencies for msal-react and msal-browser from root of repo
npm install
// Change directory to sample directory
cd samples/msal-react-samples/b2c-sample
// Build packages locally
npm run build:package
```

#### Running the sample development server

1. In a command prompt, run `npm start`.
1. Open [http://localhost:4200](http://localhost:4200) to view it in the browser.
1. Open [http://localhost:4200/profile](http://localhost:4200/profile) to see an example of a protected route. If you are not yet signed in, signin will be invoked automatically.

The page will reload if you make edits.
You will also see any lint errors in the console.

- In the web page, click on the "Login" button and select either `Sign in using Popup` or `Sign in using Redirect` to begin the auth flow.

#### Running the sample production server

1. In a command prompt, run `npm run build`.
1. Next run `serve -s build`
1. Open [http://localhost:4200](http://localhost:4200) to view it in the browser.
1. Open [http://localhost:4200/profile](http://localhost:4200/profile) to see an example of a protected route. If you are not yet signed in, signin will be invoked automatically.

#### Learn more about the 3rd-party libraries used to create this sample

- [React documentation](https://reactjs.org/).
- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Router documentation](https://reactrouter.com/web/guides/quick-start)
- [Material-UI documentation](https://material-ui.com/getting-started/installation/)
