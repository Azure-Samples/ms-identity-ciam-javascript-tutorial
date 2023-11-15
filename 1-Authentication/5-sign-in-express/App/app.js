const msal = require('@azure/msal-node');
const express = require('express');
const session = require('express-session');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { msalConfig, TENANT_SUBDOMAIN, REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } = require('./authConfig');

// Initialize MSAL Node (confidential app)

const msalInstance = new msal.ConfidentialClientApplication(msalConfig);

/**
 * The MSAL.js library allows you to pass your custom state as state parameter in the Request object
 * By default, MSAL.js passes a randomly generated unique state parameter value in the authentication requests.
 * The state parameter can also be used to encode information of the app's state before redirect. 
 * You can pass the user's state in the app, such as the page or view they were on, as input to this parameter.
 * For more information, visit: https://docs.microsoft.com/azure/active-directory/develop/msal-js-pass-custom-state-authentication-request
 * In this scenario, the states also serve to show the action that was requested of B2C since only one redirect URL is possible. 
 */

const APP_STATES = {
    LOGIN: 'login'
}

/** 
 * Request Configuration
 * We manipulate these two request objects below 
 * to acquire a token with the appropriate claims.
 */
 const authCodeRequest = {
    redirectUri: REDIRECT_URI,
};

const tokenRequest = {
    redirectUri: REDIRECT_URI,
};

/**
 * Using express-session middleware. Be sure to familiarize yourself with available options
 * and set them as desired. Visit: https://www.npmjs.com/package/express-session
 */
 const sessionConfig = {
    secret: process.env.EXPRESS_SESSION_SECRET || 'Enter_the_Express_Session_Secret_Here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set value to true in production
    }
}

//Create an express instance
const app = express();

app.use(session(sessionConfig));
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))


/**
 * This method is used to generate an auth code request, the first leg of authorization code grant flow 
 * @param {array} scopes: scopes to request the auth code for 
 * @param {string} state: state of the application
 * @param {Object} res: express middleware response object
 */

const getAuthCode = (authority, scopes, state, res) => {

    // prepare the request
    console.log("Fetching Authorization code")
    authCodeRequest.authority = authority;
    authCodeRequest.scopes = scopes;
    authCodeRequest.state = state;

    // request an authorization code to exchange for a token
    return msalInstance.getAuthCodeUrl(authCodeRequest)
        .then((response) => {
            console.log("\nAuthCodeURL: \n" + response);
            //redirect to the auth code URL/send code to 
            res.redirect(response);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
}

app.get('/', (req, res) => {
    if (req.session.isAuthenticated && req.session.isAuthenticated === true) {
        res.send('<a href="/id-token-claims">View id token claims</a> </br> <a href="/signout">Sign out</a>');
    }else{
        res.send('<a href="/signin">Sign in</a> </br>')
    }
});

app.get('/signin', (req, res) => {
    //Initiate a Auth Code Flow >> for sign in
    //no scopes passed. openid, profile and offline_access will be used by default.
    getAuthCode(msalConfig.auth.authority, [], APP_STATES.LOGIN, res);
});

app.get('/signout',async (req, res)=>{    
    logoutUri = process.env.LOGOUT_ENDPOINT || `${msalConfig.auth.authority}${TENANT_SUBDOMAIN}.onmicrosoft.com/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;
    req.session.destroy(() => {
        //When session destruction succeeds, notify CIAM service using the logout uri.
        res.redirect(logoutUri);
    });
});

app.get('/id-token-claims', (req, res) => {
    if (req.session.isAuthenticated && req.session.isAuthenticated === true) {
        // list all id token claims
        for (let key in req.session.account.idTokenClaims){
            let claimAndValue = key + ":" + req.session.account.idTokenClaims[key];
            console.log(claimAndValue);
        }
      } else {
        res.redirect('/');
      }
});

app.get('/redirect', (req, res) => {
    //prepare the request to acquire id token by using acquireTokenByCode()         
    tokenRequest.code = req.query.code;
    msalInstance.acquireTokenByCode(tokenRequest).then((tokenResponse)=>{
    
    //add response info to express session
    req.session.account = tokenResponse.account;
    req.session.idToken = tokenResponse.idToken
    req.session.isAuthenticated = true;
    //log tokenResponse
    console.log("\nAuthToken: \n" + JSON.stringify(tokenResponse));
    //log a claim, such as name to show how to get a token claim from the id token
    console.log("\nGiven name: \n" + JSON.stringify(tokenResponse.account.idTokenClaims.name));
    res.redirect('/');
    }).catch((error)=>{
        console.log("\nErrorAtLogin: \n" + error);
    });
});


app.listen(process.env.SERVER_PORT || 3000, () => {
    console.log('Msal Node Auth Code Sample app listening on port ! ' + (process.env.SERVER_PORT || 3000));
});