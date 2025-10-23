import puppeteer from 'puppeteer';
import { loginLeonardo, switchAccount } from './loginManager.js';
import { checkCredits } from './creditChecker.js';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let page = await loginLeonardo(browser);

  while (true) {
    const hasCredits = await checkCredits(page);

    if (!hasCredits) {
      console.log('🔄 Switching to next account...');
      page = await switchAccount(browser);
    }

    console.log('Sleeping 10 minutes before next check...');
    await new Promise(res => setTimeout(res, 10 * 60 * 1000));
  }
}

main().catch(console.error);