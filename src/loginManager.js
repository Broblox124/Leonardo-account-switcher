import puppeteer from 'puppeteer';
import { loadAccounts } from './utils.js';

const accounts = loadAccounts();
let currentIndex = 0;

export async function loginLeonardo(browser) {
  const page = await browser.newPage();

  const account = accounts[currentIndex];
  console.log(`Logging in with ${account.email}`);

  await page.goto('https://app.leonardo.ai/login', { waitUntil: 'networkidle2' });

  await page.type('input[type="email"]', account.email, { delay: 50 });
  await page.type('input[type="password"]', account.password, { delay: 50 });
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log(`Successfully logged in as ${account.email}`);
  return page;
}

export async function switchAccount(browser) {
  currentIndex = (currentIndex + 1) % accounts.length;
  console.log(`Switching to account #${currentIndex + 1}`);

  const page = await browser.newPage();
  await page.goto('https://app.leonardo.ai/logout', { waitUntil: 'networkidle2' });
  await page.close();

  return await loginLeonardo(browser);
}