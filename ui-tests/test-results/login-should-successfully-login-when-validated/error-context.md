# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> should successfully login when validated
- Location: login.spec.js:4:5

# Error details

```
Error: locator.fill: value: expected string, got undefined
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]: Get Started | Rhombus AI
  - generic [ref=e7]: Loading
```

# Test source

```ts
  1  | import dotenv from 'dotenv';
  2  | dotenv.config();
  3  | import { test , expect } from '@playwright/test';
  4  | test('should successfully login when validated', async ({ page }) => {
  5  |     await page.goto('https://rhombusai.com/'); //Navigating to the website
  6  |     await page.getByRole('button', { name: 'Close' }).click(); //close the modal
  7  |     await page.getByRole('button', { name: 'Log In' }).click(); //click login button
> 8  |     await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_EMAIL);
     |                                                                ^ Error: locator.fill: value: expected string, got undefined
  9  |     await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_PASSWORD);//enter email and password
  10 |     await page.getByRole('button', { name: 'Log In' }).click();//click login submit
  11 |     await page.waitforURL('https://rhombusai.com/');//wait for page to be ready
  12 |     expect(page.locator('span.text-muted-foreground')).toContainText(process.env.TEST_EMAIL); //assert that user is logged in (check email appears)
  13 | });
```