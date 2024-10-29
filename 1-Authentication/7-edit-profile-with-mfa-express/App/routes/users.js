/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const express = require("express");
const router = express.Router();
const authProvider = require("../auth/AuthProvider");

var { fetch } = require("../fetch");
const { GRAPH_ME_ENDPOINT, editProfileScope } = require("../authConfig");

// custom middleware to check auth state
function isAuthenticated(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.redirect("/auth/signin"); // redirect to sign-in route
  }

  next();
}

router.get(
  "/id",
  isAuthenticated, // check if user is authenticated
  async function (req, res, next) {
    res.render("id", { idTokenClaims: req.session.account.idTokenClaims });
  },
);

router.get(
  "/gatedUpdateProfile",
  isAuthenticated,
  authProvider.getToken(["User.Read"]), // check if user is authenticated
  async function (req, res, next) {
    const graphResponse = await fetch(
      GRAPH_ME_ENDPOINT,
      req.session.accessToken,
    );
    if (!graphResponse.id) {
      return res 
        .status(501) 
        .send("Failed to fetch profile data"); 
    }
    res.render("gatedUpdateProfile", {
      profile: graphResponse,
    });
  },
);

router.get(
  "/updateProfile",
  isAuthenticated, // check if user is authenticated
  authProvider.getToken(
    ["User.Read", editProfileScope],
    "http://localhost:3000/users/updateProfile",
  ),
  async function (req, res, next) {
    const graphResponse = await fetch(
      GRAPH_ME_ENDPOINT,
      req.session.accessToken,
    );
    if (!graphResponse.id) {
      return res 
        .status(501) 
        .send("Failed to fetch profile data"); 
    }
    res.render("updateProfile", {
      profile: graphResponse,
    });
  },
);

router.post(
  "/update",
  isAuthenticated,
  authProvider.getToken([editProfileScope]),
  async function (req, res, next) {
    try {
      if (!!req.body) {
        let body = req.body;
        fetch(
          "http://localhost:3001/updateUserInfo",
          req.session.accessToken,
          "POST",
          {
            displayName: body.displayName,
            givenName: body.givenName,
            surname: body.surname,
          },
        )
          .then((response) => {
            if (response.status === 204) {
              return res.redirect("/");
            } else {
              next("Not updated");
            }
          })
          .catch((error) => {
            console.log("error,", error);
          });
      } else {
        throw { error: "empty request" };
      }
    } catch (error) {
      next(error);
    }
  },
);
module.exports = router;
