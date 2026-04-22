import dotenv from 'dotenv';
import { test , expect } from '@playwright/test';
import path from 'path';
test('should successfully login when validated', async ({ page }) => {
    test.setTimeout(180000);
    dotenv.config();
    await page.goto('https://rhombusai.com/'); //Navigating to the website 
    await page.getByRole('button', { name: 'Close' }).click(); //close the pop-up
    await page.getByRole('button', { name: 'Log In' }).click(); //click login button
    await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_PASSWORD);//enter email and password
    await page.getByRole('button', { name: 'Log In' }).click();//click login submit
    await page.waitForURL('https://rhombusai.com/');//wait for page to be ready
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('span.text-muted-foreground')).toContainText(process.env.TEST_EMAIL,{timeout:10000}); //assert that the email is visible on the page
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click(); //click the upload button
    await page.locator('input[type="file"]').setInputFiles(path.join(__dirname,'../../data-validation/input.csv')) //upload the file
    await page.getByRole('button', { name: 'Attach' }).click(); //click the attach button
    await expect(page.locator('span').filter({ hasText: 'input.csv' })).toBeVisible(); //assert that the file is visible on the page
    await page.locator('textarea').fill('Clean the attached CSV and output only the corrected CSV: trim whitespace; standardize casing (names=Title Case, emails=lowercase, state/country codes=UPPERCASE); convert missing tokens (N/A, NA, NULL, None, -, empty) to blank; delete rows where every field is blank/null; infer each column’s expected data type from the column name and values (e.g., age/qty/count=int; price/amount=float; date columns=date; email=email; booleans=true/false; ids as strings unless purely numeric ids are explicit) and enforce it by replacing any incompatible value with null/blank (e.g., Age = “No age” → blank); validate emails (exactly one @, no spaces, domain contains .) and blank invalid ones; remove duplicates by key (id else email else name+company) keeping the row with most non-empty valid fields; keep the same header/columns.');
    await page.locator('textarea').press('Enter'); //press enter to submit the file
    await expect(page.getByRole('button', { name: 'Cancel Pipeline' })).toBeVisible({timeout:120000});
    await expect(page.getByRole('button', { name: 'Cancel Pipeline' })).toBeHidden({timeout:120000});
    await expect(page.getByRole('button', { name: 'Run Pipeline' })).toBeVisible({timeout:120000}); //assert that the run pipeline button is visible on the page
    await page.getByTestId('rf__node-llm_node_1').click();
    await page.locator('.text-card-foreground.shadow-sm.relative.flex.flex-col.items-center.justify-center.gap-0\\.5.h-28.w-28.rounded-lg.p-3.cursor-grab.border-2.bg-card.transition-all.duration-200.active\\:cursor-grabbing.group-hover\\:scale-105.group-hover\\:shadow-xl.border-transform-clean > .absolute.left-1 > .inline-flex').click();
    await expect(page.locator('table.caption-bottom')).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    await page.getByRole('menuitem', { name: 'Download as CSV' }).click();
    const download = await downloadPromise; //capture the download
    await download.saveAs(path.join(__dirname,'../../data-validation/output.csv')); //save the file
});