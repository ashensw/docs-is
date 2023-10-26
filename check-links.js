const puppeteer = require('puppeteer');

async function checkLinks(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .map(link => link.href)
  );

  for (const link of links) {
    const response = await page.goto(link);
    if (!response.ok()) {
      console.error(`Broken link found: ${link} - Status: ${response.status()}`);
    } else {
      console.log(`Working link: ${link} - Status: ${response.status()}`);
    }
    await page.goto(url);
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
