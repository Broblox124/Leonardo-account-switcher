export async function checkCredits(page) {
  try {
    // Navigate to user profile or credits panel
    await page.goto('https://app.leonardo.ai/', { waitUntil: 'networkidle2' });

    // Wait a second for UI to load
    await page.waitForTimeout(2000);

    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes('Out of credits') || text.includes('No credits remaining')) {
      console.log('⚠️  Credits exhausted for this account.');
      return false;
    }

    console.log('✅  Credits available.');
    return true;
  } catch (err) {
    console.error('Error checking credits:', err);
    return true; // Fail-safe, assume credits available
  }
}