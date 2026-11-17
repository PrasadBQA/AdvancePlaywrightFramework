import{test,expect} from '@playwright/test';
import {request} from 'node:http';
import { logger } from '@/utils/logger';

test('TC#01 @p0 - POST : Verify  that create bookinng is working fine', async({request}) => {

    // To Make a POST Request we have certain things to understand

    // What is the URL that we are using => https://restful-booker.herokuapp.com/booking
    // What is the HTTP Method that we are using: POST
    // Request PAYLOAD/ request body -> simple json file or js object
    // Headers need to set -> content-type json
    // Authentication? for POST we don't have authentication here

    const baseUrl = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';

    const payload ={
        firstname: 'Jimm',
        lastname: 'Brownn',
        totalprice: 111,
        depositepaid: true,
        bookingdates: {
            checkin: '2018-01-01',
            checkout: '2019-01-01',
        },
        additionalneeds: 'Breakfast',


    }
    logger.info(`Payload is set: ${JSON.stringify(payload)}`);

    const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',

            // Header basically means a contract btw Client - Server
            // we that are sending data is json(content-type: application/json)
            // and we are also accepting the json, not other formats
            // 90% of applications follow the same header
        }
       // logger.info(`Header is set: ${headers}`);
        // ${headers} converts the object to the generic string [object Object], 
        // which doesn’t show the header names or values.

        logger.info(`Header is set: ${JSON.stringify(headers)}`);
    //  writes an informational message to your test log. JSON.stringify(headers) converts the headers object into readable JSON text, 
    // such as {"Accept":"application/json","Content-

        const responseData = await request.post(`${baseUrl}/booking`,{
            // Old Way request.post('booking')
            headers,
            data: payload,
        });


        console.log(responseData);

        // expect((await responseData).status()).toBe(200);
        // const data = (await responseData).json();
        expect(responseData.status()).toBe(200);
        const data = await responseData.json();
        expect(data.bookingid).toBeTruthy();
        expect(data.booking.firstname).toBe(payload.firstname);
        expect(data.booking.lastname).toBe(payload.lastname);
        expect(data.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
        logger.info(`Created booking id: ${data.bookingid}`);

});