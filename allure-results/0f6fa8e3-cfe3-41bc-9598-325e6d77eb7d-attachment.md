# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apiTests\01_restful_booker_raw\03_newContext_api.spec.ts >> newContext for isolated headers
- Location: src\tests\apiTests\01_restful_booker_raw\03_newContext_api.spec.ts:3:1

# Error details

```
TypeError: ctx.get is not a function
```

# Test source

```ts
  1  | import {test,expect, request} from '@playwright/test';
  2  | 
  3  | test('newContext for isolated headers', async() => {
  4  | 
  5  |     const ctx = request.newContext({
  6  |         baseURL: 'https://gorest.in',
  7  |         extraHTTPHeaders: { 'X-Trace-Id': 'demo-123' },
  8  |         timeout: 15000,
  9  |     });
  10 | 
> 11 |     const ping = await ctx.get('/public/v2/users/1001?page=1&per_page=10');
     |                            ^ TypeError: ctx.get is not a function
  12 |     expect(ping.status()).toBe(200);
  13 | 
  14 |     await ctx.dispose();
  15 | 
  16 | });
```