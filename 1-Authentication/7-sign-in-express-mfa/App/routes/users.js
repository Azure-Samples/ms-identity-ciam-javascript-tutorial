/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const express = require('express');
const router = express.Router();
const authProvider = require('../auth/AuthProvider');
var { fetch } = require("../fetch");
const { GRAPH_ME_ENDPOINT, 
        mfaProtectedResourceScope } = require('../authConfig');

// custom middleware to check auth state
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }

    next();
};

router.get('/id',
    isAuthenticated, // check if user is authenticated
    async function (req, res, next) {
        res.render('id', { idTokenClaims: req.session.account.idTokenClaims });
    }
);

router.get(
    '/updateProfile',
    isAuthenticated, // check if user is authenticated
    authProvider.getToken(["User.ReadWrite"]), // check for mfa
    async function (req, res, next) {
        const graphResponse = await fetch(
            GRAPH_ME_ENDPOINT,
            req.session.accessToken
          );
        res.render("updateProfile", {
            profile: graphResponse,
          });
    }
);

router.post(
    '/update',
    isAuthenticated, // check if user is authenticated
    authProvider.getToken(["User.ReadWrite", mfaProtectedResourceScope]), // check for mfa
    async function (req, res, next) {
        try {
            if (!!req.body) {
              let body = req.body;
              const graphEndpoint = GRAPH_ME_ENDPOINT;
              // API that calls for a single singed in user.
              // more infromation for this endpoint found here
              // https://learn.microsoft.com/en-us/graph/api/user-update?view=graph-rest-1.0&tabs=http
              fetch(graphEndpoint, req.session.accessToken, "PATCH", {
                displayName: body.displayName,
                givenName: body.givenName,
                surname: body.surname,
                mail: body.mail,
              })
                .then((response) => {
                  if (response.status === 204) {
                    return res.redirect("/");
                  } else {
                    next("Not updated");
                  }
                })
                .catch((error) => {
                  next(error);
                });
            } else {
              throw { error: "empty request" };
            }
          } catch (error) {
            next(error);
          }
    }
);
module.exports = router;
