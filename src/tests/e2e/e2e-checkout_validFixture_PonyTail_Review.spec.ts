import { test, expect } from '@fixtures/test-base';
import { DataGenerator } from '@utils/DataGenerator';
import { visualStep } from '@utils/visualSteps';

const FIRST_ITEM_ID = 'test-allthethings-tshirt-red';

test.describe('@P0 @Regression E2E @Checkout Checkout Feature', () => {
    test('should complete checkout successfully', async ({
        page,
        loginWithInventory,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
    }) => {
        const customer = DataGenerator.checkoutCustomer();

        await visualStep(page, 'Add first item to cart', async () => {
            await loginWithInventory.addToCart(FIRST_ITEM_ID);
        });

        await visualStep(page, 'Verify cart contains one item', async () => {
            await cartPage.open();
            expect(await cartPage.rowCount()).toBe(1);
        });

        await visualStep(page, 'Enter checkout details', async () => {
            await cartPage.checkout();
            await checkoutStepOnePage.assertLoaded();
            await checkoutStepOnePage.fillGuest(customer);
        });

        await visualStep(page, 'Review order overview', async () => {
            await checkoutStepOnePage.continue();
            await checkoutStepTwoPage.assertLoaded();
        });

        await visualStep(page, 'Complete checkout', async () => {
            await checkoutStepTwoPage.finish();
            await checkoutCompletePage.assertOrderComplete();
        });
    });

    test('should reject login for a locked-out user', async ({ page, invalidLogin }) => {
        const { loginPage, username } = invalidLogin;

        await visualStep(page, `Verify locked-out error for ${username}`, async () => {
            await loginPage.expectErrorContains('locked out');
            await expect(page).not.toHaveURL(/inventory/);
        });
    });
});
