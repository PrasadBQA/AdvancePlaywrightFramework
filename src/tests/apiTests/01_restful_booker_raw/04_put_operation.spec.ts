import { test, expect, request } from '@playwright/test';
import { logger } from '@utils/logger';

test.describe('Restful Booker booking API', () => {
    
    // If you want to make PUT request,
    // You need to make sure that you create a token - Post Auth -> will five you token
    // For that Post request first
    // Then you have to Create a Booking -> Post Booking - it will give you a booking ID
    // By using this token and booking Id only we can make a PUT Request
    // You can not make a PUT Request directly, If you try it'll give you a forbidden

    test('TC#2 @p0 - PUT : Verify that update the existing booking is working fine.', async({ request }) => {

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        const payload = {
            firstname: 'Pramod',
            lastname: 'Dutta',
            totalprice: 111,
            depositpaid: true,
            bookingdates: {
                checkin: '2018-01-01',
                checkout: '2019-01-01',
            },
            additionalneeds: 'Breakfast',
        };

        let token ='';
        let bookingId = 0;

        await test.step('Step 1 - Create Auth token', async() => {

            const responseData = await request.post('/auth',{
                headers,
                data: {
                    username: 'admin',
                    password: 'password123',
                },
                // we have hard-coded our Username and Password, 
                // we'll replace it with process.env.username - later/future
            });

            expect(responseData.status()).toBe(200);

            const data = await responseData.json();
            token = data.token;
            expect(token).toBeTruthy();
            logger.info('Created auth token for PUT booking flow ');

        });

        await test.step('Step 2 - Create Booking to Update', async() => {

            const responseData = await request.post('/booking', {
                
                headers,
                data: payload,
            });

            expect(responseData.status()).toBe(200)
            const data = await responseData.json();
            bookingId = data.bookingid;
            expect(bookingId).toBeTruthy();
            logger.info(`Created booking id for update: ${bookingId}`);
        });

        await test.step('Step 3 - Update Booking', async() => {


            const responseData = await request.put(`/booking/${bookingId}`, {
                headers: {
                    ...headers,
                    Cookie:`token=${token}`
                },
                data: payload,
            });
            const data = await responseData.json();
            expect(data.firstname).toBe(payload.firstname);
            expect(data.lastname).toBe(payload.lastname);
            logger.info(`Updated booking id ${bookingId}: ${data.firstname} ${data.lastname}`);
        
        });

    });
});