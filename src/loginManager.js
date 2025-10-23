import { loadAccounts } from './utils.js';
import fs from 'fs';

const accounts = loadAccounts();
let currentIndex = 0;

async function saveScreenshot(page, filename) {
  try {
    await page.screenshot({ path: filename });
    console.log(`Screenshot saved: ${filename}`);
  } catch (err) {
    console.error(`Failed to save screenshot: ${filename}`, err);
  }
}

export async function loginLeonardo(browser) {
  const account = accounts[currentIndex];
  let page;
  try {
    page = await browser.newPage();

    // Desktop viewport and User-Agent (emulates Chrome on Windows)
    await page.setViewport({ width: 1200, height: 900 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("Navigating to Leonardo AI login page...");
    await page.goto('https://app.leonardo.ai/auth/login?callbackUrl=%2Flogin', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await saveScreenshot(page, 'login_step1.png');

    console.log('Waiting for "Continue with Email" button...');
    await page.waitForTimeout(1000); // Give extra time for render
    await page.waitForSelector('button', { visible: true, timeout: 40000 });
    const buttons = await page.$$('button');
    let foundEmailBtn = false;

    for (let btn of buttons) {
      const txt = await page.evaluate(el => el.textContent, btn);
      console.log(`Button text: "${txt && txt.trim()}"`);
      if (txt && txt.includes('Continue with Email')) {
        await btn.click();
        foundEmailBtn = true;
        console.log('Clicked "Continue with Email"');
        break;
      }
    }
    if (!foundEmailBtn) {
      await saveScreenshot(page, 'login_error_nowith_email.png');
      throw new Error('Could not find "Continue with Email" button');
    }

    await page.waitForTimeout(1000); // Let the next UI render
    await saveScreenshot(page, 'login_step2_emailbox.png');

    console.log('Waiting for email input...');
    await page.waitForSelector('input[type="email"], input[name="email"]', { visible: true, timeout: 40000 });
    await page.type('input[type="email"], input[name="email"]', account.email, { delay: 40 });
    console.log(`Typed email: ${account.email}`);

    await page.waitForTimeout(500);
    await saveScreenshot(page, 'login_step3_email_entered.png');

    console.log('Looking for "Continue" button after email...');
    await page.waitForSelector('button', { visible: true, timeout: 40000 });
    const continueButtons = await page.$$('button');
    let foundContinueBtn = false;
    for (let btn of continueButtons) {
      const txt = await page.evaluate(el => el.textContent, btn);
      console.log(`Button text after email: "${txt && txt.trim()}"`);
      if (txt && txt.trim() === 'Continue') {
        await btn.click();
        foundContinueBtn = true;
        console.log('Clicked "Continue" after email');
        break;
      }
    }
    if (!foundContinueBtn) {
      await saveScreenshot(page, 'login_error_nocontinue_email.png');
      throw new Error('Could not find "Continue" button after email entry');
    }

    await page.waitForTimeout(1000); // Wait for password render
    await saveScreenshot(page, 'login_step4_passwordbox.png');

    console.log('Waiting for password input...');
    await page.waitForSelector('input[type="password"], input[name="password"]', { visible: true, timeout: 40000 });
    await page.type('input[type="password"], input[name="password"]', account.password, { delay: 40 });
    console.log('Typed password.');

    await page.waitForTimeout(500);
    await saveScreenshot(page, 'login_step5_password_entered.png');

    console.log('Looking for final "Continue/Login" button...');
    await page.waitForSelector('button', { visible: true, timeout: 40000 });
    const loginButtons = await page.$$('button');
    let foundFinalBtn = false;
    for (let btn of loginButtons) {
      const txt = await page.evaluate(el => el.textContent, btn);
      console.log(`Button text at login: "${txt && txt.trim()}"`);
      if (txt && (txt.trim() === 'Continue' || txt.trim().toLowerCase() === 'login')) {
        await btn.click();
        foundFinalBtn = true;
        console.log('Clicked final "Continue/Login" button');
        break;
      }
    }
    if (!foundFinalBtn) {
      await saveScreenshot(page, 'login_error_nocontinue_login.png');
      throw new Error('Could not find final "Continue/Login" button');
    }

    await page.waitForTimeout(2000);
    await saveScreenshot(page, 'login_step6_after_login.png');
    // Wait for navigation (dashboard or success)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });

    console.log(`Successfully logged in as ${account.email}`);
    return page;
  } catch (err) {
    if (page) await saveScreenshot(page, 'login_error_final.png');
    console.error('Login error:', err);
    throw err; // Pass error up for process management/logs
  }
}

export async function switchAccount(browser) {
  currentIndex = (currentIndex + 1) % accounts.length;
  console.log(`Switching to account #${currentIndex + 1}`);

  let page;
  try {
    page = await browser.newPage();
    await page.goto('https://app.leonardo.ai/logout', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.close();
  } catch (err) {
    console.error('Error during logout and account switch:', err);
  }
  return await loginLeonardo(browser);
}
