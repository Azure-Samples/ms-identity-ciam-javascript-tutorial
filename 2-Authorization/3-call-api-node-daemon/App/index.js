#!/usr/bin/env node

import 'dotenv/config';
import { callApi } from './fetch.js';
import { apiConfig, getToken, tokenRequest } from './auth.js';

async function main() {
    try {
        const authResponse = await getToken(tokenRequest);
        const todos = await callApi(apiConfig.uri, authResponse.accessToken);
        
        console.log(todos);
    } catch (error) {
        console.log(error);
    } 
};

main();