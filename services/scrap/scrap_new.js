const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

/* -------------------------------------------------------------------------- */
/*                                  CONFIG                                    */
/* -------------------------------------------------------------------------- */

const COOKIES_FILE = "cookies_twitter_new.json";
const OUTPUT_FILE = "tweets_bmri_2022.json";

const SCRAPE_PER_URL = 1 * 60 * 60 * 1000; // 1 jam per URL (biar natural)

/* -------------------------------------------------------------------------- */
/*                              MULTI URL LIST                                */
/* -------------------------------------------------------------------------- */

const twitterURLs = [
    "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-31%20since%3A2022-01-01&src=typed_query", // BMRI JANUARI - MARET 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-04-01&src=typed_query" // BMRI APRIL - JUNI 2022
];

/* -------------------------------------------------------------------------- */
/*                              HUMAN BEHAVIOR                                */
/* -------------------------------------------------------------------------- */

function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

async function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function humanDelay() {
    await delay(rand(2000, 6000));
}

async function humanScroll(page) {
    const distance = rand(400, 1200);

    await page.evaluate((d) => {
        window.scrollBy({ top: d, behavior: "smooth" });
    }, distance);

    await humanDelay();

    if (Math.random() < 0.3) {
        await page.evaluate(() => window.scrollBy({ top: -200 }));
        await delay(1000);
    }
}

async function randomMouse(page) {
    await page.mouse.move(rand(100, 800), rand(100, 600), {
        steps: rand(10, 25)
    });
}

/* -------------------------------------------------------------------------- */
/*                              LOGIN SYSTEM                                  */
/* -------------------------------------------------------------------------- */

async function loadCookies(page) {
    if (!fs.existsSync(COOKIES_FILE)) return false;

    const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE));
    await page.setCookie(...cookies);
    return true;
}

async function saveCookies(page) {
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
}

async function isLoggedIn(page) {
    return await page.evaluate(() => {
        return document.querySelector("article") !== null;
    });
}

async function manualLogin(page) {
    console.log("🔐 Login manual...");
    await page.goto("https://x.com/login");

    console.log("⏳ 120 detik...");
    await page.waitForTimeout(120000);

    if (await isLoggedIn(page)) {
        await saveCookies(page);
        return true;
    }
    return false;
}

/* -------------------------------------------------------------------------- */
/*                              SCRAPER ENGINE                                */
/* -------------------------------------------------------------------------- */

async function scrapeSingleURL(page, url, globalSet) {
    console.log(`🌐 Open: ${url}`);

    await page.goto(url, { waitUntil: "networkidle2" });
    await humanDelay();

    const start = Date.now();
    let idle = 0;

    while (Date.now() - start < SCRAPE_PER_URL) {
        await randomMouse(page);

        const tweets = await page.evaluate(() => {
            const data = [];

            document.querySelectorAll("article").forEach((el) => {
                const text = el.querySelector("div[lang]")?.innerText;
                const date = el.querySelector("time")?.getAttribute("datetime");

                if (text && date) {
                    data.push({
                        tweet: text,
                        date: date.split("T")[0]
                    });
                }
            });

            return data;
        });

        let before = globalSet.size;

        tweets.forEach((t) => globalSet.add(JSON.stringify(t)));

        let after = globalSet.size;

        console.log(`📊 +${after - before} | Total: ${after}`);

        await humanScroll(page);

        // idle simulation
        if (Math.random() < 0.2) {
            let t = rand(5000, 15000);
            console.log(`😴 Idle ${t / 1000}s`);
            await delay(t);
            idle++;
        }

        if (idle > 4) break;
    }
}

/* -------------------------------------------------------------------------- */
/*                              MAIN RUNNER                                   */
/* -------------------------------------------------------------------------- */

async function run() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768 });

    const agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Mozilla/5.0 (X11; Linux x86_64)"
    ];

    await page.setUserAgent(agents[rand(0, agents.length)]);

    /* ---------------- LOGIN ---------------- */

    let loggedIn = false;

    if (await loadCookies(page)) {
        await page.goto("https://x.com/home");
        await delay(5000);
        loggedIn = await isLoggedIn(page);
    }

    if (!loggedIn) {
        loggedIn = await manualLogin(page);
    }

    if (!loggedIn) {
        console.log("❌ Login gagal");
        return;
    }

    console.log("✅ Login sukses");

    /* ---------------- SCRAPE MULTI URL ---------------- */

    const globalTweets = new Set();

    // load existing (biar resume)
    if (fs.existsSync(OUTPUT_FILE)) {
        JSON.parse(fs.readFileSync(OUTPUT_FILE)).forEach((t) =>
            globalTweets.add(JSON.stringify(t))
        );
    }

    for (let i = 0; i < twitterURLs.length; i++) {
        await scrapeSingleURL(page, twitterURLs[i], globalTweets);

        // cooldown antar URL (biar gak suspicious)
        let cooldown = rand(10000, 30000);
        console.log(`⏸️ Cooldown ${cooldown / 1000}s`);
        await delay(cooldown);
    }

    /* ---------------- SAVE ---------------- */

    const result = Array.from(globalTweets).map((t) => JSON.parse(t));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

    console.log(`✅ DONE: ${result.length} tweets`);

    await browser.close();
}

run().catch(console.error);