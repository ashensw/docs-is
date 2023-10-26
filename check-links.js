const puppeteer = require('puppeteer');

async function checkLinks(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url);

  // Find all clickable elements
  const clickableElements = await page.$$('[href], button, [role="button"], [onclick], [tabindex="0"]');
  
  for (const element of clickableElements) {
    try {
      // Try to click the element and wait for navigation
      await Promise.all([
        element.click(),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ]);

      // Check the response status after navigation
      const response = await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });
      if (response && !response.ok()) {
        console.error(`Broken link found: ${page.url()} - Status: ${response.status()}`);
      } else {
        console.log(`Working link: ${page.url()} - Status: ${response.status()}`);
      }

      // Go back to the original page
      await page.goto(url, { waitUntil: 'networkidle0' });
    } catch (error) {
      console.error(`Error checking link: ${error.message}`);
    }
  }

  await browser.close();
}

const websiteUrl = process.argv[2];
if (!websiteUrl) {
  console.error('Please provide a URL as an argument');
  process.exit(1);
}

checkLinks(websiteUrl)
  .then(() => console.log('Link check complete'))
  .catch(err => {
    console.error('Error checking links:', err);
    process.exit(1);
  });
