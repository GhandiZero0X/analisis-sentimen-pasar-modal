const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const Sentiment = require("sentiment");

puppeteer.use(StealthPlugin());
const sentiment = new Sentiment();

require("dotenv").config();

const twitterURLs = [
  // BBRI 2024
  // Kata Kunci: #BBRI
  // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query", // BBRI top januari - juni 2024
  // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query", // BBRI top juli - desember 2024
  // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query&f=live", // BBRI latest januari - juni 2024
  // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query&f=live", // BBRI latest juli - desember 2024

  // Kata Kunci: BBRI
  // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query", // BBRI top januari - juni 2024
  // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query", // BBRI top juli - desember 2024
  "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2024-01-14%20since%3A2024-01-01&src=typed_query&f=live", // BBRI latest januari - juni 2024
  // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query&f=live", // BBRI latest juli - desember 2024
];

const SCRAPING_TIME = 2 * 60 * 60 * 1000; // 2 jam
const COOKIES_FILE = "cookies_twitter.json";
const COOKIES_MAX_AGE = 8 * 60 * 60 * 1000; // 8 jam

/* -------------------------------------------------------------------------- */
/*                             Utility Functions                              */
/* -------------------------------------------------------------------------- */

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeGoto(page, url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      return;
    } catch (err) {
      console.error(`❌ Gagal membuka ${url} (percobaan ${i + 1}):`, err.message);
      if (i === retries - 1) throw err;
      await delay(10000);
    }
  }
}

async function clearAllCookies(page, cookiesFile) {
  if (fs.existsSync(cookiesFile)) {
    fs.unlinkSync(cookiesFile);
    console.log("🗑️ Cookies file dihapus");
  }

  const cookies = await page.cookies();
  if (cookies.length > 0) {
    await page.deleteCookie(...cookies);
    console.log("🗑️ Browser cookies dihapus");
  }
}

/* -------------------------------------------------------------------------- */
/*                           Cookie Expiration Check                          */
/* -------------------------------------------------------------------------- */

function isCookieExpired(file) {
  if (!fs.existsSync(file)) return true;
  const stats = fs.statSync(file);
  const age = Date.now() - stats.mtimeMs;
  return age > COOKIES_MAX_AGE;
}

/* -------------------------------------------------------------------------- */
/*                              Login Management                              */
/* -------------------------------------------------------------------------- */

async function doManualLogin(page) {
  console.log("🔄 Membersihkan session sebelumnya...");
  await clearAllCookies(page, COOKIES_FILE);

  const loginUrls = [
    "https://x.com/i/flow/login",
    "https://twitter.com/i/flow/login",
    "https://x.com/login",
    "https://twitter.com/login",
  ];

  for (const loginUrl of loginUrls) {
    console.log(`🔐 Mencoba login manual di: ${loginUrl}`);
    try {
      await safeGoto(page, loginUrl);
      console.log("⏰ Kamu punya 120 detik buat login manual...");
      console.log("💡 Tips: login pakai email/username aja, jangan Google/Apple.");

      await Promise.race([
        page.waitForSelector('a[href="/compose/tweet"]', { timeout: 120000 }),
        page.waitForSelector('div[data-testid="AppTabBar_Home_Link"]', { timeout: 120000 }),
        page.waitForSelector("article", { timeout: 120000 }),
        page.waitForSelector('[data-testid="primaryColumn"]', { timeout: 120000 }),
      ]);

      await delay(8000);

      const isLoggedIn = await page.evaluate(() => {
        const indicators = [
          document.querySelector('a[href="/compose/tweet"]'),
          document.querySelector('div[data-testid="AppTabBar_Home_Link"]'),
          document.querySelector("article"),
          document.querySelector('[data-testid="primaryColumn"]'),
          document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]'),
        ];
        return (
          indicators.some((i) => i !== null) &&
          !window.location.href.includes("/login") &&
          !window.location.href.includes("/i/flow")
        );
      });

      if (isLoggedIn) {
        const cookies = await page.cookies();
        if (cookies && cookies.length > 0) {
          fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
          console.log("✅ Login manual berhasil, cookies disimpan!");
          return true;
        }
      } else {
        console.log("❌ Gagal verifikasi login, coba URL lain...");
      }
    } catch (error) {
      console.log(`⚠️ Error login di ${loginUrl}:`, error.message);
    }
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/*                             Request Handling Mode                          */
/* -------------------------------------------------------------------------- */

async function enableRequestBlocking(page) {
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "stylesheet", "font"].includes(req.resourceType())) req.abort();
    else req.continue();
  });
}

async function disableRequestBlocking(page) {
  page.removeAllListeners("request");
  await page.setRequestInterception(false);
}

/* -------------------------------------------------------------------------- */
/*                                 Main Logic                                 */
/* -------------------------------------------------------------------------- */

async function scrapeTweets() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  ];

  await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
  await page.setViewport({ width: 1920, height: 1080 });

  await enableRequestBlocking(page);

  let loggedIn = false;

  // Cek cookies expired
  if (isCookieExpired(COOKIES_FILE)) {
    console.log("🕒 Cookies sudah lebih dari 24 jam, menghapus file lama...");
    await clearAllCookies(page, COOKIES_FILE);
  }

  // Login dengan cookies
  if (fs.existsSync(COOKIES_FILE)) {
    console.log("🍪 Mencoba login dengan cookies tersimpan...");
    const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, "utf-8"));
    await page.setCookie(...cookies);

    await safeGoto(page, "https://x.com/home");
    await delay(5000);

    const isLoggedIn = await page.evaluate(() => {
      const hasComposeButton = document.querySelector('a[href="/compose/tweet"]') !== null;
      const hasHomeLink = document.querySelector('div[data-testid="AppTabBar_Home_Link"]') !== null;
      const hasTweets = document.querySelector("article") !== null;
      const notOnLoginPage =
        !window.location.href.includes("/login") && !window.location.href.includes("/i/flow");
      return (hasComposeButton || hasHomeLink || hasTweets) && notOnLoginPage;
    });

    loggedIn = isLoggedIn;
    console.log(isLoggedIn ? "✅ Login berhasil via cookies" : "❌ Cookies invalid, login manual diperlukan...");
  }

  if (!loggedIn) loggedIn = await doManualLogin(page);
  if (!loggedIn) {
    console.log("❌ Gagal login, hentikan proses scraping.");
    await browser.close();
    return;
  }

  console.log("✅ Login sukses! Mulai scraping...");

  await disableRequestBlocking(page);

  const tweets = new Set();
  if (fs.existsSync("tweets_bbri_2024.json")) {
    const existing = JSON.parse(fs.readFileSync("tweets_bbri_2024.json", "utf-8"));
    existing.forEach((t) => tweets.add(JSON.stringify(t)));
  }

  const startTime = Date.now();

  for (const url of twitterURLs) {
    console.log(`🌐 Membuka URL: ${url}`);
    try {
      await safeGoto(page, url);
      await delay(5000);

      try {
        await page.waitForSelector("article", { timeout: 15000 });
      } catch {
        console.log("⚠️ Tidak menemukan tweet, lanjut...");
      }

      let lastHeight = await page.evaluate(() => document.body.scrollHeight);
      let attempt = 0;

      while (Date.now() - startTime < SCRAPING_TIME) {
        const newTweets = await page.evaluate(() => {
          const data = [];
          document.querySelectorAll("article").forEach((tweet) => {
            const content = tweet.querySelector("div[lang]")?.innerText || "No content";
            const dateEl = tweet.querySelector("time");
            const date = dateEl ? dateEl.getAttribute("datetime").split("T")[0] : null;
            if (date && content && content !== "No content") {
              data.push({ date, tweet: content, sentiment: "" });
            }
          });
          return data;
        });

        newTweets.forEach((tweet) => {
          if (!Array.from(tweets).some((t) => JSON.parse(t).tweet === tweet.tweet)) {
            tweets.add(JSON.stringify(tweet));
          }
        });

        console.log(`📥 Jumlah tweet sementara: ${tweets.size}`);

        await page.evaluate(() =>
          window.scrollBy({ top: Math.random() * 1000 + 500, behavior: "smooth" })
        );
        await delay(Math.floor(Math.random() * 9000) + 3500);

        const newHeight = await page.evaluate(() => document.body.scrollHeight);
        if (newHeight === lastHeight) {
          attempt++;
          if (attempt > 3) {
            console.log("⏹️ Tidak ada konten baru, lanjut ke URL berikutnya");
            break;
          }
        } else {
          attempt = 0;
          lastHeight = newHeight;
        }
      }
    } catch (err) {
      console.error(`⚠️ Error scraping ${url}:`, err.message);
    }
  }

  const tweetArray = Array.from(tweets).map((t) => JSON.parse(t));
  fs.writeFileSync("tweets_bbri_2024.json", JSON.stringify(tweetArray, null, 2));
  console.log(`✅ Selesai! Total tweet terkumpul: ${tweetArray.length}`);

  await browser.close();
}

/* -------------------------------------------------------------------------- */
/*                               Graceful Exit                                */
/* -------------------------------------------------------------------------- */

process.on("SIGINT", async () => {
  console.log("🛑 Dihentikan oleh user");
  process.exit();
});

scrapeTweets().catch(console.error);
