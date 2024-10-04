// Import necessary modules
const express = require("express");
const msal = require("@azure/msal-node");
const app = express();
const port = 3001;
const { v4: uuidv4 } = require("uuid");
const {
  msalConfig,
  GRAPH_ME_ENDPOINT,
  TENANT_SUBDOMAIN,
  TENANT_ID,
} = require("./authConfig");

var { fetch } = require("./fetch");

// Middleware to parse incoming JSON requests
app.use(express.json());

const cca = new msal.ConfidentialClientApplication(msalConfig);

// Function to acquire token using client credentials
async function getAccessToken(tokenRequest) {
  try {
    const response = await cca.acquireTokenOnBehalfOf(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.error("Error acquiring token:", error);
    throw error;
  }
}

// Define the updateUserInfo endpoint
app.post("/updateUserInfo", async (req, res) => {
  try {
    const tokenRequest = {
      oboAssertion: req.headers.authorization.replace("Bearer ", ""),
      authority: `https://${TENANT_SUBDOMAIN}.ciamlogin.com/${TENANT_ID}`,
      scopes: ["User.ReadWrite"],
      correlationId: `${uuidv4()}`,
    };

    let accessToken = await getAccessToken(tokenRequest);
    fetch(GRAPH_ME_ENDPOINT, accessToken, "PATCH", req.body)
      .then((response) => {
        if (response.status === 204) {
          res.status(response.status);
          res.json({ message: "Success" });
        } else {
          res.status(502);
          res.json({ message: "Failed, " + response.body });
        }
      })
      .catch((error) => {
        res.status(502);
        res.json({ message: "Failed, " + error });
      });
  } catch (err) {
    res.json({ message: "Failed, " + err });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
