import dotenv from 'dotenv';
import { resolve } from 'path';
import {chromium} from 'playwright';
import axios from 'axios';
let sessionCookie = null;
let userEmail = null;
beforeAll(async () => {
    dotenv.config({ path: resolve('..', '.env') });
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://rhombusai.com/'); //Navigating to the website 
    await page.getByRole('button', { name: 'Close' }).click(); //close the pop-up
    await page.getByRole('button', { name: 'Log In' }).click(); //click login button
    await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_PASSWORD);//enter email and password
    await page.getByRole('button', { name: 'Log In' }).click();//click login submit
    await page.waitForURL('https://rhombusai.com/');//wait for page to be ready
    const cookies = await context.cookies();
    const found = cookies.find(cookie => cookie.name === '__Secure-authjs.session-token');
    sessionCookie = found.value;
    userEmail = process.env.TEST_EMAIL;
    await browser.close();
});

test ('positive test: authenticated session returns user email', async () => {
    const response = await axios.get('https://rhombusai.com/api/auth/session', {
        headers: {
            Cookie: `__Secure-authjs.session-token=${sessionCookie}`
        }
    });
    expect(response.status).toBe(200);
    expect(response.data.user.email).toBe(userEmail);
});

test ('negative test: unauthenticated session returns null', async () => {
    const response = await axios.get('https://rhombusai.com/api/auth/session');
    expect(response.status).toBe(200);
    expect(response.data).toBe(null); 
});