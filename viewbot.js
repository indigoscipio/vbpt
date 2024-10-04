const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const proxyURL = `5.79.73.131:13040`;

puppeteer.use(StealthPlugin());

const getProxyIP = async (page) => {
  await page.goto("https://httpbin.org/ip");
  const ipInfo = await page.evaluate(() => document.body.innerText);
  console.log("Proxy IP Info:", ipInfo);
};

const run = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        `--proxy-server=http://${proxyURL}`,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--ignore-certificate-errors", // FOR BRIGHTDATA ONLY
      ],
      defaultViewport: {
        width: 1280 + Math.floor(Math.random() * 100),
        height: 720 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
      },
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36"
    );

    // await page.authenticate({
    //   username: "brd-customer-hl_9f9cf878-zone-residential_proxy3",
    //   password: "dpoem16y36bc",
    // });

    // await getProxyIP(page);

    const blockedDomains = [
      "https://pagead2.googlesyndication.com",
      "https://creativecdn.com",
      "https://google.com",
      "https://www.googletagmanager.com",
      "https://cdn.krxd.net",
      "https://adservice.google.com",
      "https://cdn.concert.io",
      "https://z.moatads.com",
      "https://js.stripe.com",
      "https://cdn.dribbble.com",
      "https://cdn.permutive.com",
    ];

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = req.url();

      if (blockedDomains.some((d) => url.startsWith(d))) {
        return req.abort();
      }
      if (
        req.resourceType() == "image" ||
        req.resourceType() == "stylesheet" ||
        req.resourceType() == "font" ||
        req.resourceType() === "script" || // Intercept JavaScript files
        req.resourceType() === "media" || // Intercept media files (audio, video)
        req.resourceType() == "xhr" ||
        req.resourceType() == "jpeg" ||
        req.resourceType() == "png" ||
        req.resourceType() == "svg" ||
        req.resourceType() == "gif"
      )
        return req.abort();
      req.continue();
    });

    await page.goto(
      "https://dribbble.com/shots/24840071-turing-UI-Kit-AI-Smart-Healthcare-App-Date-Tab-Bar-Switch-UI",
      { waitUntil: "networkidle2", timeout: 10000 }
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
  } catch (error) {
    console.error(`An error occured`, error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Main function to loop the viewbot script X times
const main = async () => {
  const numRuns = 3000; // Number of times to run the script

  for (let i = 1; i <= numRuns; i++) {
    console.log(`Starting run ${i} of ${numRuns}...`);
    await run();
    console.log(`Run ${i} of ${numRuns} completed.`);
  }

  console.log("All runs completed.");
};

main();
