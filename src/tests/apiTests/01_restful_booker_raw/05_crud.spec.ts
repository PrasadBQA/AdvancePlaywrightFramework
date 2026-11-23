// Crud Operations:

// **What it is:** An interface is a blueprint for the shape of an object. 
// It lists which fields the object must have and what type each field is, like `firstname: string`  or `totalprice: number` .

// Why we use it here:
// response.json()  gives back data typed as any , so TypeScript can’t catch a typo like "bookingId"  vs "bookingid". 
// With interfaces on the payloads, responses and shared state, the editor flags mistakes and gives you autocomplete before the test ever runs.

import {test, expect} from '@playwright/test';
import { logger } from '@/utils/logger';

interface BookingPayload {
    firstname: string;
    lastname: string;
    totalprice: number;
    depositpaid: boolean;
    bookingdates: BookingDates;
    additionalneeds: string;
}

interface BookingDates {
    checkin: string;
    checkout: string;
}

interface AuthTokenResponse {
    token: string;
}

interface CreateBookingResponse {
    bookingid: string;
    booking: BookingPayload;
}

interface BookingFlowState {
    token?: string;
    bookingId?: string;
}

test.describe.serial('Restful Booker CRUD API', () => {

    const headers = {
        'Accept': "application/json",
        'Content-Type': "application/json",
    };


    const payload : BookingPayload = {
        firstname: 'Pramod',
        lastname: 'Dutta',
        totalprice: 111,
        depositpaid: true,
        bookingdates: {
            checkin: '2018-01-01',
            checkout: '2019-01-01'
        },
        additionalneeds: 'Breakfast'

    }

    const bookingFlowState: BookingFlowState = {};
    
    test('TC#01 @p0 - Create Token: ', async({ request }) => {

        await test.step('Create Token', async () => {
            const responseData = await request.post('/auth', {
                headers,
                data: {
                    username: process.env.BOOKER_USERNAME,
                    password: process.env.BOOKER_PASSWORD,
                },
            });
        
        expect(responseData.status()).toBe(200);
        const data = await responseData.json() as AuthTokenResponse;
        expect(data.token).toBeTruthy();
        bookingFlowState.token = data.token;
        // saves the token from the /auth response into bookingFlowState.token
        // Later CRUD tests in the serial group can use that shared token for authenticated requests

        });
    });

    test('TC#02 @p0 - Create Booking', async({ request }) =>{

        await test.step('', async()=>{

            const responseData = await request.post('/booking',{
                headers,
                data: payload,
            });

            expect(responseData.status()).toBe(200);
            const data = await responseData.json() as CreateBookingResponse;
            expect(data.bookingid).toBeTruthy();
            expect(data.booking.firstname).toBe(payload.firstname);
            expect(data.booking.lastname).toBe(payload.lastname);

            bookingFlowState.bookingId = data.bookingid;
            logger.info(`Created booking id for CRUD flow: ${bookingFlowState.bookingId}`);
        });
    });

    test('TC#3 @p0 - Update booking', async ({ request }) => {


        await test.step('Update booking', async () => {

            const token = bookingFlowState.token;
            const bookingId = bookingFlowState.bookingId;
            if (!token || !bookingId) {
                throw new Error('Create token and create booking tests must pass before update booking.');
            }

             const responseData = await request.put(`/booking/${bookingId}`, {
                headers: {
                    ...headers,
                    Cookie:`token=${token}`
                },
                data: payload,
            });

            expect(responseData.status()).toBe(200);
            const data = await responseData.json() as BookingPayload;
            expect(data.firstname).toBe(payload.firstname);
            expect(data.lastname).toBe(payload.lastname);

            logger.info(`Updated booking id ${bookingId}: ${data.firstname} ${data.lastname}`);

        });
   });

})