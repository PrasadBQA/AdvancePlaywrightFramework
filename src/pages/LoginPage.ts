// This File Contains only Page Locators and Page Actions(functions) for Login Page.


import { Page, Locator, test} from '@playwright/test';

export class LoginPage {
    // Page Locators for Login Page:
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    // Constructor to initialize the locators and page object
    constructor(page: Page)
    {
        // Why do we initilize the page locators inside the constructor?
        // Because we need to pass the page object to the constructor and then use that page object to initialize the locators.
        // This is because the locators are dependent on the page object and we need to have access to the page object in order to initialize the locators.

        // or

        // Whenever we say readonly says that this variable is only going to be initialized only once and then it will be read-only. So we can initialize the locators in the constructor and then use them in the page actions.
        // if something is readonly onetime you can assign/initialize it and that assignment/initialization happens in constructor.
        // After that, you cannot change it. So we can initialize the locators in the constructor and then use them in the page actions.
        this.page = page;
        this.emailInput = page.getByRole('textbox', { name: 'Username' });
        this.passwordInput = page.getByRole('textbox', { name: 'Password' });
        // TTACart uses data-test, not Playwright's default data-testid.
        this.loginButton = page.locator('[data-test="login-button"]');
    }

    // Page Actions for Login Page:
    async goto()
    {
        await this.page.goto("https://app.thetestingacademy.com/playwright/ttacart/");
    }

    async login(username: string, password: string)
    {
        await this.emailInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

}