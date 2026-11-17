import {test, expect} from '@playwright/test';
import { request } from 'node:http';

// Ping Request.
// Ping request help you to test if the server is up.
// Basically communication btw Client - Server to check if all well.

// HTTP Get -> https://restful-booker.herokuapp.com/ping

// Notes: https://app.thetestingacademy.com/playwright/learn/playwright-api/

test('Ping request - GET', async({ request }) => {

    const responseData = request.get('/ping');
    // in this repo baseURL will be fetched from "playwright.config.json" file
    // under function resolveBaseUrl() -> switch(env) -> case 'API': return process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com'

    // Before running any kindof api test case, run the below command
    // export TTA_ENV=api npx playwright test e2e.spec.ts

    // you can to export the api, you have to tell him that you are running a API Test Case,
    // The command will change

    // In this way the Advantage is: You do not have to type the baseURL.
    // Base URL Will automatically come from the playwright.config.json configuration
    // So you just have to add end point 

    console.log(responseData);
    expect((await responseData).status()).toBe(201);
});

