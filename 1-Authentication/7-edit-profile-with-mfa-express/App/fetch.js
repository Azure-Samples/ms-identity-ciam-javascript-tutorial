var axios = require('axios');
var authProvider = require("./auth/AuthProvider");

/**
 * Makes an Authorization "Bearer" request with the given accessToken to the given endpoint.
 * @param endpoint
 * @param accessToken
 * @param method
 */
const fetch = async (endpoint, accessToken, method = "GET", data = null) => {
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    console.log(`request made to ${endpoint} at: ` + new Date().toString());

    switch (method) {
        case 'GET':
            const response = await axios.get(endpoint, options);
            return await response.data;
        case 'POST':
            return await axios.post(endpoint, data, options);
        case 'DELETE':
            return await axios.delete(endpoint + `/${data}`, options);
        case 'PATCH': 
            return await axios.patch(endpoint, ReqBody = data, options);
        default:
            return null;
    }
};

module.exports = { fetch };
