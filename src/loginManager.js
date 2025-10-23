import { loadAccounts } from './utils.js';

const accounts = loadAccounts();
let currentIndex = 0;

export async function loginLeonardo(browser) {
  const page = await browser.newPage();
  const account = accounts[currentIndex];
  console.log(`Logging in with ${account.email}`);

  // Step 1: Go to Leonardo login page
  await page.goto('https://app.leonardo.ai/auth/login?callbackUrl=%2Flogin', { waitUntil: 'networkidle2' });

  // Step 2: Click "Continue with Email"
  await page.waitForSelector('button', { visible: true, timeout: 10000 });
  const buttons = await page.$$('button');
  let foundEmailBtn = false;
  for (let btn of buttons) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt && txt.includes('Continue with Email')) {
      await btn.click();
      foundEmailBtn = true;
      break;
    }
  }
  if (!foundEmailBtn) throw new Error('Could not find "Continue with Email" button');

  // Step 3: Wait for email input and enter email
  await page.waitForSelector('input[type="email"], input[name="email"]', { visible: true, timeout: 10000 });
  await page.type('input[type="email"], input[name="email"]', account.email, { delay: 40 });

  // Step 4: Click "Continue" button to proceed
  await page.waitForSelector('button', { visible: true, timeout: 10000 });
  const continueButtons = await page.$$('button');
  let foundContinueBtn = false;
  for (let btn of continueButtons) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt && txt.trim() === 'Continue') {
      await btn.click();
      foundContinueBtn = true;
      break;
    }
  }
  if (!foundContinueBtn) throw new Error('Could not find "Continue" button after email entry');

  // Step 5: Wait for password input and enter password
  await page.waitForSelector('input[type="password"], input[name="password"]', { visible: true, timeout: 10000 });
  await page.type('input[type="password"], input[name="password"]', account.password, { delay: 40 });

  // Step 6: Click "Continue" or "Login" button after password
  await page.waitForSelector('button', { visible: true, timeout: 10000 });
  const loginButtons = await page.$$('button');
  let foundFinalBtn = false;
  for (let btn of loginButtons) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt && (txt.trim() === 'Continue' || txt.trim().toLowerCase() === 'login')) {
      await btn.click();
      foundFinalBtn = true;
      break;
    }
  }
  if (!foundFinalBtn) throw new Error('Could not find final "Continue/Login" button');

  // Step 7: Wait for navigation or dashboard element
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
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
