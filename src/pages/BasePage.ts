// Base page can have common methods that can be used across all pages. For example, waitForPageLoad, waitForElementVisible, etc.
// Base page will setup your page, elementlocator, logger, goto(P).

/**
 * BasePage - shared scaffolding for every TTACart Page Object.
 *
 * The TTACart suite is intentionally thin. We only inherit:
 *  - `page`     -> Playwright Page handle
 *  - `el`       -> UtilElementLocator wrapper for actions
 *  - `log`      -> a per-page Logger (scope = the subclass name)
 *  - `goto(p)`  -> small navigation helper that respects baseURL
 *
 * Subclasses still declare their own `private readonly` Locator fields; the
 * base class deliberately does NOT pre-build any locators.
 */

import {Page} from '@playwright/test';
import { UtilElementLocator } from '@utils/UtilElementLocator';
import { createLogger, type Logger } from '@/utils/logger';


export abstract class BasePage {

    protected readonly page: Page;
    protected readonly el: UtilElementLocator;
    protected readonly log: Logger;
    
    protected constructor(page: Page, scope: string){

        this.page = page;
        this.el = new UtilElementLocator(page, scope);
        this.log = createLogger(scope);

        // The resposbility of base page is to initialize the page fixtures, element locator and logger. The subclasses will have their own locators and methods.
        // Before using LoginPage, HomePage, CartPage, etc. we need to initialize the page fixtures, element locator and logger.

        // Loginpage will not inherit the basePage constructor, so we need to call the basePage constructor from the subclass constructor. The subclass constructor will call the basePage constructor with the page and scope.
    }

    protected async goto(relativePath: string): Promise<void> {
        await this.page.goto(relativePath);
        await this.page.waitForLoadState('domcontentloaded');
    }
}