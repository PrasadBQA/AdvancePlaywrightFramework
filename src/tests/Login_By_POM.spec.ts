// POM files(test files) should contain only test cases/assertions and not locators or page actions.

import {test, expect} from '@playwright/test';
import { LoginPage} from '../pages/LoginPage';

test.describe('POM with Login Page Simple', () => {
    test('Login with valid credentials', async ({page}) => {

        // This is without the POM
            // await page.goto('https://app.thetestingacademy.com/playwright/ttacart/');
            // await page.getByRole("textbox", { name: "Username" }).fill;
            // //...


        // This is with the POM
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login("standard_user","tta_secret");
        await expect(page).toHaveURL(/inventory/);

    })

})