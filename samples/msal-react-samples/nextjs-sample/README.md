# MSAL.js for Next.js Sample - Authorization Code Flow in Single-Page Applications

## About this sample

This developer sample is used to run basic use cases for the MSAL library. You can also alter the configuration in `./src/authConfig.js` to execute other behaviors.
This sample was bootstrapped with [Learn Next.js](https://nextjs.org/learn).

## Notable files and what they demonstrate

1. `./pages/_app.js` - Shows implementation of `MsalProvider`, all children will have access to `@azure/msal-react` context, hooks and components
1. `./pages/index.js` - Homepage, shows how to conditionally render content using `AuthenticatedTemplate` and `UnauthenticatedTemplate` depending on whether or not a user is signed in.
1. `./pages/profile.js` - Example of a protected route using `MsalAuthenticationTemplate`. If a user is not yet signed in, signin will be invoked automatically. If a user is signed in it will acquire an access token and make a call to MS Graph to fetch user profile data.
1. `./src/authConfig.js` - Configuration options for `PublicClientApplication` and token requests
1. `./src/ui-components/SignInSignOutButton.jsx` - Example of how to conditionally render a Sign In or Sign Out button using the `useIsAuthenticated` hook.
1. `./src/ui-components/SignInButton.jsx` - Example of how to get the `PublicClientApplication` instance using the `useMsal` hook and invoking a login function.
1. `./src/ui-components/SignOutButton.jsx` - Example of how to get the `PublicClientApplication` instance using the `useMsal` hook and invoking a logout function.
1. `./src/utils/MsGraphApiCall.js` - Example of how to call the MS Graph API with an access token.
1. `./src/utils/NavigationClient.js` - Example implementation of `INavigationClient` which can be used to override the default navigation functions MSAL.js uses

## How to run the sample

### Pre-requisites

- Ensure [all pre-requisites](../../../lib/msal-react/README.md#prerequisites) have been completed to run `@azure/msal-react`.
- Install node.js if needed (<https://nodejs.org/en/>).

### Configure the application

- Open `./src/authConfig.js` in an editor.
- Replace client id with the Application (client) ID from the portal registration, or use the currently configured lab registration.
  - Optionally, you may replace any of the other parameters, or you can remove them and use the default values.

#### Install npm dependencies for sample

```bash
# Install dev dependencies for msal-react and msal-browser from root of repo
npm install

# Change directory to sample directory
cd samples/msal-react-samples/nextjs-sample

# Build packages locally
npm run build:package
```

#### Running the sample development server

1. In a command prompt, run `npm run dev`.
1. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
1. Open [http://localhost:3000/profile](http://localhost:3000/profile) to see an example of a protected route. If you are not yet signed in, signin will be invoked automatically.

The page will reload if you make edits.
You will also see any lint errors in the console.

- In the web page, click on the "Login" button and select either `Sign in using Popup` or `Sign in using Redirect` to begin the auth flow.

#### Running the sample production server

1. In a command prompt, run `npm run build`.
1. Next run `npm start`
1. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
1. Open [http://localhost:3000/profile](http://localhost:3000/profile) to see an example of a protected route. If you are not yet signed in, signin will be invoked automatically.

#### Learn More about Next.js

You can learn more in the [Next.js documentation](https://nextjs.org/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
