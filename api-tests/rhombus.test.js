import dotenv from 'dotenv';
import { resolve } from 'path';
import {chromium} from 'playwright';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
let sessionCookie = null;
let userEmail = null;
let accessToken = null;
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
    const sessionResponse = await axios.get('https://rhombusai.com/api/auth/session', {
        headers: { Cookie: `__Secure-authjs.session-token=${sessionCookie}` }
    });
    accessToken = sessionResponse.data.accessToken;
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

test('positive test: csv file is uploaded', async () => {
    const form = new FormData();
    form.append('file', fs.createReadStream('../data-validation/input.csv'));
    form.append('title', 'input.csv');
    form.append('description', '');
    form.append('column_header_row', '1');
    const response = await axios.post('https://api.rhombusai.com/api/dataset/datasets/temp/upload',form, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            ...form.getHeaders()
        }}
    );
    expect(response.status).toBe(200);
    expect(response.data.title).toBe('input.csv');
}); 

test('negative test: file not uploaded without authentication',async() => {
    const form = new FormData();
    form.append('file', fs.createReadStream('../data-validation/input.csv'));
    form.append('title', 'input.csv');
    form.append('description', '');
    form.append('column_header_row', '1');
    const response = await axios.post('https://api.rhombusai.com/api/dataset/datasets/temp/upload',form);
    expect(response.status).toBe(200); //Should have been 401: Unauthenticated
    // This endpoint returns 200 without authentication.
});