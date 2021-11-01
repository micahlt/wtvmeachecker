const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
var path = require('path');
const port = process.env.PORT || 8080;
var areResultsReady = false;

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--no-sandbox', '--disable-setuid-sandbox', "--incognito", "--single-process", "--no-zygote"] });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
      request.abort();
    } else {
      request.continue();
    }
  });
  page.goto("https://wtvmea.org/results");
  let loop = true;
  let interval = setInterval(async () => {
    if (!loop) {
      clearInterval(interval);
    } else {
      let first = await page.evaluate(() => window.find("2021"));
      let second = await page.evaluate(() => window.find("2021"));
      let third = await page.evaluate(() => window.find("2021"));
      if (first && second && third) {
        // then results are posted
        loop = false;
        areResultsReady = true;
        console.log('RESULTS ARE HERE! 🎉');
        console.log("Hopefully they won't let you down 😂");
      } else {
        console.log('Still waiting on results...')
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
      }
    }
  }, 30000);
})();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.get('/results', (req, res) => {
  res.send(areResultsReady);
})

app.listen(port, () => {
  console.log(`Example app listening`);
});
