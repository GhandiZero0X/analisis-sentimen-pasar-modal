const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const Sentiment = require("sentiment");

// list akun twitter 
// 1. hgr.allphantom22@gmail.com
// 2. paladintrinity01@gmail.com
// 3. phantom.zero2022@gmail.com
// 4. hgrphantom01@gmail.com

// akun file google: phantom.zero2022@gmail.com

puppeteer.use(StealthPlugin());
const sentiment = new Sentiment();

require("dotenv").config();

const twitterURLs = [
    // ICBP 2025
    // Kata Kunci: #ICBP
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-11-01&src=typed_query", // #ICBP Top November - Desember 2025
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-11-01&src=typed_query&f=live", // #ICBP Terbaru November - Desember 2025

    // Kata Kunci: ICBP
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-11-02&f=top&src=typed_query", // ICBP Top November - Desember 2025
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-11-01&f=live&src=typed_query" , // ICBP Terbaru November - Desember 2025

    // ICBP 2018
    // Kata Kunci: #ICBP
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query", // #ICBP Top Januari - Juni 2018
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query", // #ICBP Top Juli - Desember 2018
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query&f=live", // #ICBP Terbaru Januari - Juni 2018
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query&f=live", // #ICBP Terbaru Juli - Desember 2018

    // Kata Kunci: ICBP
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query", // ICBP Top Januari - Juni 2018
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query", // ICBP Top Juli - Desember 2018
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query&f=live", // ICBP Terbaru Januari - Juni 2018
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query&f=live", // ICBP Terbaru Juli - Desember 2018

    // BMRI 2021
    // Kata Kunci: BMRI
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-06-30%20since%3A2021-01-01&src=typed_query", // BMRI Top Januari - Juni 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query", // BMRI Top Juli - Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-03-30%20since%3A2021-01-01&src=typed_query&f=live", // BMRI Terbaru Januari - Juni 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query&f=live", // BMRI Terbaru Juli - Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-01-03%20since%3A2021-01-01&f=live&src=typed_query", // BMRI Terbaru 1-3 Januari 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-01-08%20since%3A2021-01-07&f=live&src=typed_query", // BMRI Terbaru 7-8 Januari 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-01-11%20since%3A2021-01-09&f=live&src=typed_query", // BMRI Terbaru 9-11 Januari 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-01-14%20since%3A2021-01-12&f=live&src=typed_query", // BMRI Terbaru 12-14 Januari 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-01-17%20since%3A2021-01-15&f=live&src=typed_query", // BMRI Terbaru 15-17 Januari 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-01-20%20since%3A2021-01-18&f=live&src=typed_query", // BMRI Terbaru 18-20 Januari 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-01-23%20since%3A2021-01-21&f=live&src=typed_query", // BMRI Terbaru 21-23 Januari 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-01-26%20since%3A2021-01-24&f=live&src=typed_query", // BMRI Terbaru 24-26 Januari 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-01-29%20since%3A2021-01-27&f=live&src=typed_query", // BMRI Terbaru 27-29 Januari 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-01-31%20since%3A2021-01-29&f=live&src=typed_query", // BMRI Terbaru 29-31 Januari 2021

    // juli
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-03%20since%3A2021-07-01&f=live&src=typed_query", // BMRI Terbaru 1-3 Juli 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-05%20since%3A2021-07-03&f=live&src=typed_query", // BMRI Terbaru 3-5 Juli 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-08%20since%3A2021-07-06&f=live&src=typed_query", // BMRI Terbaru 6-8 Juli 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-11%20since%3A2021-07-09&f=live&src=typed_query", // BMRI Terbaru 9-11 Juli 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-14%20since%3A2021-07-12&f=live&src=typed_query", // BMRI Terbaru 12-14 Juli 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-17%20since%3A2021-07-15&f=live&src=typed_query", // BMRI Terbaru 15-17 Juli 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-20%20since%3A2021-07-18&f=live&src=typed_query", // BMRI Terbaru 18-20 Juli 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-23%20since%3A2021-07-21&f=live&src=typed_query", // BMRI Terbaru 21-23 Juli 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-26%20since%3A2021-07-24&f=live&src=typed_query", // BMRI Terbaru 24-26 Juli 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-29%20since%3A2021-07-27&f=live&src=typed_query", // BMRI Terbaru 27-29 Juli 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-07-31%20since%3A2021-07-29&f=live&src=typed_query", // BMRI Terbaru 29-31 Juli 2021

    // // agustus
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-03%20since%3A2021-08-01&f=live&src=typed_query", // BMRI Terbaru 1-3 Agustus 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-05%20since%3A2021-08-03&f=live&src=typed_query", // BMRI Terbaru 3-5 Agustus 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-08%20since%3A2021-08-06&f=live&src=typed_query", // BMRI Terbaru 6-8 Agustus 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-11%20since%3A2021-08-09&f=live&src=typed_query", // BMRI Terbaru 9-11 Agustus 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-14%20since%3A2021-08-12&f=live&src=typed_query", // BMRI Terbaru 12-14 Agustus 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-17%20since%3A2021-08-15&f=live&src=typed_query", // BMRI Terbaru 15-17 Agustus 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-20%20since%3A2021-08-18&f=live&src=typed_query", // BMRI Terbaru 18-20 Agustus 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-23%20since%3A2021-08-21&f=live&src=typed_query", // BMRI Terbaru 21-23 Agustus 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-26%20since%3A2021-08-24&f=live&src=typed_query", // BMRI Terbaru 24-26 Agustus 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-29%20since%3A2021-08-27&f=live&src=typed_query", // BMRI Terbaru 27-29 Agustus 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-08-31%20since%3A2021-08-29&f=live&src=typed_query", // BMRI Terbaru 29-31 Agustus 2021

    // september
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-03%20since%3A2021-09-01&f=live&src=typed_query", // BMRI Terbaru 1-3 September 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-05%20since%3A2021-09-03&f=live&src=typed_query", // BMRI Terbaru 3-5 September 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-08%20since%3A2021-09-06&f=live&src=typed_query", // BMRI Terbaru 6-8 September 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-11%20since%3A2021-09-09&f=live&src=typed_query", // BMRI Terbaru 9-11 September 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-14%20since%3A2021-09-12&f=live&src=typed_query", // BMRI Terbaru 12-14 September 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-17%20since%3A2021-09-15&f=live&src=typed_query", // BMRI Terbaru 15-17 September 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-20%20since%3A2021-09-18&f=live&src=typed_query", // BMRI Terbaru 18-20 September 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-23%20since%3A2021-09-21&f=live&src=typed_query", // BMRI Terbaru 21-23 September 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-26%20since%3A2021-09-24&f=live&src=typed_query", // BMRI Terbaru 24-26 September 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-29%20since%3A2021-09-27&f=live&src=typed_query", // BMRI Terbaru 27-29 September 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-09-30%20since%3A2021-09-29&f=live&src=typed_query", // BMRI Terbaru 29-30 September 2021

    // // oktober
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-03%20since%3A2021-10-01&f=live&src=typed_query", // BMRI Terbaru 1-3 Oktober 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-05%20since%3A2021-10-03&f=live&src=typed_query", // BMRI Terbaru 3-5 Oktober 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-08%20since%3A2021-10-06&f=live&src=typed_query", // BMRI Terbaru 6-8 Oktober 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-11%20since%3A2021-10-09&f=live&src=typed_query", // BMRI Terbaru 9-11 Oktober 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-14%20since%3A2021-10-12&f=live&src=typed_query", // BMRI Terbaru 12-14 Oktober 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-17%20since%3A2021-10-15&f=live&src=typed_query", // BMRI Terbaru 15-17 Oktober 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-20%20since%3A2021-10-18&f=live&src=typed_query", // BMRI Terbaru 18-20 Oktober 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-23%20since%3A2021-10-21&f=live&src=typed_query", // BMRI Terbaru 21-23 Oktober 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-26%20since%3A2021-10-24&f=live&src=typed_query", // BMRI Terbaru 24-26 Oktober 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-29%20since%3A2021-10-27&f=live&src=typed_query", // BMRI Terbaru 27-29 Oktober 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-10-31%20since%3A2021-10-29&f=live&src=typed_query", // BMRI Terbaru 29-31 Oktober 2021

    // // november
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-03%20since%3A2021-11-01&f=live&src=typed_query", // BMRI Terbaru 1-3 November 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-05%20since%3A2021-11-03&f=live&src=typed_query", // BMRI Terbaru 3-5 November 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-08%20since%3A2021-11-06&f=live&src=typed_query", // BMRI Terbaru 6-8 November 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-11%20since%3A2021-11-09&f=live&src=typed_query", // BMRI Terbaru 9-11 November 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-14%20since%3A2021-11-12&f=live&src=typed_query", // BMRI Terbaru 12-14 November 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-17%20since%3A2021-11-15&f=live&src=typed_query", // BMRI Terbaru 15-17 November 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-20%20since%3A2021-11-18&f=live&src=typed_query", // BMRI Terbaru 18-20 November 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-23%20since%3A2021-11-21&f=live&src=typed_query", // BMRI Terbaru 21-23 November 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-26%20since%3A2021-11-24&f=live&src=typed_query", // BMRI Terbaru 24-26 November 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-29%20since%3A2021-11-27&f=live&src=typed_query", // BMRI Terbaru 27-29 November 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-11-30%20since%3A2021-11-29&f=live&src=typed_query", // BMRI Terbaru 29-30 November 2021

    // // desember
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-03%20since%3A2021-12-01&f=live&src=typed_query", // BMRI Terbaru 1-3 Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-05%20since%3A2021-12-03&f=live&src=typed_query", // BMRI Terbaru 3-5 Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-08%20since%3A2021-12-06&f=live&src=typed_query", // BMRI Terbaru 6-8 Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-11%20since%3A2021-12-09&f=live&src=typed_query", // BMRI Terbaru 9-11 Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-14%20since%3A2021-12-12&f=live&src=typed_query", // BMRI Terbaru 12-14 Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-17%20since%3A2021-12-15&f=live&src=typed_query", // BMRI Terbaru 15-17 Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-20%20since%3A2021-12-18&f=live&src=typed_query", // BMRI Terbaru 18-20 Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-23%20since%3A2021-12-21&f=live&src=typed_query", // BMRI Terbaru 21-23 Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-26%20since%3A2021-12-24&f=live&src=typed_query", // BMRI Terbaru 24-26 Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-29%20since%3A2021-12-27&f=live&src=typed_query", // BMRI Terbaru 27-29 Desember 2021
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-12-29&f=live&src=typed_query", // BMRI Terbaru 29-31 Desember 2021

    // Kata Kunci: #BMRI
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-30%20since%3A2021-01-01&src=typed_query", // #BMRI Top Januari - Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query", // #BMRI Top Juli - Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-30%20since%3A2021-01-01&src=typed_query&f=live", // #BMRI Terbaru Januari - Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query&f=live", // #BMRI Terbaru Juli - Desember 2021

    // // januari
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-03%20since%3A2021-01-01&f=live&src=typed_query", // BMRI 1-3 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-05%20since%3A2021-01-03&f=live&src=typed_query", // BMRI 3-5 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-07%20since%3A2021-01-05&f=live&src=typed_query", // BMRI 5-7 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-09%20since%3A2021-01-07&f=live&src=typed_query", // BMRI 7-9 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-11%20since%3A2021-01-09&f=live&src=typed_query", // BMRI 9-11 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-13%20since%3A2021-01-11&f=live&src=typed_query", // BMRI 11-13 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-15%20since%3A2021-01-13&f=live&src=typed_query", // BMRI 13-15 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-17%20since%3A2021-01-15&f=live&src=typed_query", // BMRI 15-17 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-19%20since%3A2021-01-17&f=live&src=typed_query", // BMRI 17-19 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-21%20since%3A2021-01-19&f=live&src=typed_query", // BMRI 19-21 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-23%20since%3A2021-01-21&f=live&src=typed_query", // BMRI 21-23 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-25%20since%3A2021-01-23&f=live&src=typed_query", // BMRI 23-25 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-27%20since%3A2021-01-25&f=live&src=typed_query", // BMRI 25-27 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-29%20since%3A2021-01-27&f=live&src=typed_query", // BMRI 27-29 Januari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-01-31%20since%3A2021-01-29&f=live&src=typed_query", // BMRI 29-31 Januari 2021

    // // februari
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-03%20since%3A2021-02-01&src=typed_query&f=live", // BMRI 1-3 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-05%20since%3A2021-02-03&src=typed_query&f=live", // BMRI 3-5 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-07%20since%3A2021-02-05&src=typed_query&f=live", // BMRI 5-7 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-09%20since%3A2021-02-07&src=typed_query&f=live", // BMRI 7-9 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-11%20since%3A2021-02-09&src=typed_query&f=live", // BMRI 9-11 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-13%20since%3A2021-02-11&src=typed_query&f=live", // BMRI 11-13 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-15%20since%3A2021-02-13&src=typed_query&f=live", // BMRI 13-15 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-17%20since%3A2021-02-15&src=typed_query&f=live", // BMRI 15-17 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-19%20since%3A2021-02-17&src=typed_query&f=live", // BMRI 17-19 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-21%20since%3A2021-02-19&src=typed_query&f=live", // BMRI 19-21 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-23%20since%3A2021-02-21&src=typed_query&f=live", // BMRI 21-23 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-25%20since%3A2021-02-23&src=typed_query&f=live", // BMRI 23-25 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-27%20since%3A2021-02-25&src=typed_query&f=live", // BMRI 25-27 Februari 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-02-28%20since%3A2021-02-27&src=typed_query&f=live", // BMRI 27-28 Februari 2021

    // // maret
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-03%20since%3A2021-03-01&src=typed_query&f=live", // BMRI 1-3 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-05%20since%3A2021-03-03&src=typed_query&f=live", // BMRI 3-5 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-07%20since%3A2021-03-05&src=typed_query&f=live", // BMRI 5-7 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-09%20since%3A2021-03-07&src=typed_query&f=live", // BMRI 7-9 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-11%20since%3A2021-03-09&src=typed_query&f=live", // BMRI 9-11 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-13%20since%3A2021-03-11&src=typed_query&f=live", // BMRI 11-13 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-15%20since%3A2021-03-13&src=typed_query&f=live", // BMRI 13-15 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-17%20since%3A2021-03-15&src=typed_query&f=live", // BMRI 15-17 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-19%20since%3A2021-03-17&src=typed_query&f=live", // BMRI 17-19 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-21%20since%3A2021-03-19&src=typed_query&f=live", // BMRI 19-21 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-23%20since%3A2021-03-21&src=typed_query&f=live", // BMRI 21-23 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-25%20since%3A2021-03-23&src=typed_query&f=live", // BMRI 23-25 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-27%20since%3A2021-03-25&src=typed_query&f=live", // BMRI 25-27 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-29%20since%3A2021-03-27&src=typed_query&f=live", // BMRI 27-29 Maret 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-03-31%20since%3A2021-03-29&src=typed_query&f=live", // BMRI 29-31 Maret 2021

    // // april
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-03%20since%3A2021-04-01&src=typed_query&f=live", // BMRI 1-3 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-05%20since%3A2021-04-03&src=typed_query&f=live", // BMRI 3-5 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-07%20since%3A2021-04-05&src=typed_query&f=live", // BMRI 5-7 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-09%20since%3A2021-04-07&src=typed_query&f=live", // BMRI 7-9 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-11%20since%3A2021-04-09&src=typed_query&f=live", // BMRI 9-11 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-13%20since%3A2021-04-11&src=typed_query&f=live", // BMRI 11-13 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-15%20since%3A2021-04-13&src=typed_query&f=live", // BMRI 13-15 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-17%20since%3A2021-04-15&src=typed_query&f=live", // BMRI 15-17 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-19%20since%3A2021-04-17&src=typed_query&f=live", // BMRI 17-19 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-21%20since%3A2021-04-19&src=typed_query&f=live", // BMRI 19-21 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-23%20since%3A2021-04-21&src=typed_query&f=live", // BMRI 21-23 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-25%20since%3A2021-04-23&src=typed_query&f=live", // BMRI 23-25 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-27%20since%3A2021-04-25&src=typed_query&f=live", // BMRI 25-27 April 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-04-30%20since%3A2021-04-27&src=typed_query&f=live", // BMRI 27-30 April 2021

    // // mei
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-03%20since%3A2021-05-01&src=typed_query&f=live", // BMRI 1-3 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-05%20since%3A2021-05-03&src=typed_query&f=live", // BMRI 3-5 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-07%20since%3A2021-05-05&src=typed_query&f=live", // BMRI 5-7 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-09%20since%3A2021-05-07&src=typed_query&f=live", // BMRI 7-9 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-11%20since%3A2021-05-09&src=typed_query&f=live", // BMRI 9-11 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-13%20since%3A2021-05-11&src=typed_query&f=live", // BMRI 11-13 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-15%20since%3A2021-05-13&src=typed_query&f=live", // BMRI 13-15 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-17%20since%3A2021-05-15&src=typed_query&f=live", // BMRI 15-17 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-19%20since%3A2021-05-17&src=typed_query&f=live", // BMRI 17-19 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-21%20since%3A2021-05-19&src=typed_query&f=live", // BMRI 19-21 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-23%20since%3A2021-05-21&src=typed_query&f=live", // BMRI 21-23 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-25%20since%3A2021-05-23&src=typed_query&f=live", // BMRI 23-25 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-27%20since%3A2021-05-25&src=typed_query&f=live", // BMRI 25-27 Mei 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-05-31%20since%3A2021-05-27&src=typed_query&f=live", // BMRI 27-31 Mei 2021

    // // juni
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-03%20since%3A2021-06-01&src=typed_query&f=live", // BMRI 1-3 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-05%20since%3A2021-06-03&src=typed_query&f=live", // BMRI 3-5 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-07%20since%3A2021-06-05&src=typed_query&f=live", // BMRI 5-7 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-09%20since%3A2021-06-07&src=typed_query&f=live", // BMRI 7-9 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-11%20since%3A2021-06-09&src=typed_query&f=live", // BMRI 9-11 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-13%20since%3A2021-06-11&src=typed_query&f=live", // BMRI 11-13 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-15%20since%3A2021-06-13&src=typed_query&f=live", // BMRI 13-15 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-17%20since%3A2021-06-15&src=typed_query&f=live", // BMRI 15-17 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-19%20since%3A2021-06-17&src=typed_query&f=live", // BMRI 17-19 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-21%20since%3A2021-06-19&src=typed_query&f=live", // BMRI 19-21 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-23%20since%3A2021-06-21&src=typed_query&f=live", // BMRI 21-23 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-25%20since%3A2021-06-23&src=typed_query&f=live", // BMRI 23-25 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-27%20since%3A2021-06-25&src=typed_query&f=live", // BMRI 25-27 Juni 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-06-30%20since%3A2021-06-27&src=typed_query&f=live", // BMRI 27-30 Juni 2021

    // // juli
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-03%20since%3A2021-07-01&src=typed_query&f=live", // BMRI 1-3 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-05%20since%3A2021-07-03&src=typed_query&f=live", // BMRI 3-5 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-07%20since%3A2021-07-05&src=typed_query&f=live", // BMRI 5-7 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-09%20since%3A2021-07-07&src=typed_query&f=live", // BMRI 7-9 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-11%20since%3A2021-07-09&src=typed_query&f=live", // BMRI 9-11 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-13%20since%3A2021-07-11&src=typed_query&f=live", // BMRI 11-13 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-15%20since%3A2021-07-13&src=typed_query&f=live", // BMRI 13-15 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-17%20since%3A2021-07-15&src=typed_query&f=live", // BMRI 15-17 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-19%20since%3A2021-07-17&src=typed_query&f=live", // BMRI 17-19 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-21%20since%3A2021-07-19&src=typed_query&f=live", // BMRI 19-21 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-23%20since%3A2021-07-21&src=typed_query&f=live", // BMRI 21-23 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-25%20since%3A2021-07-23&src=typed_query&f=live", // BMRI 23-25 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-27%20since%3A2021-07-25&src=typed_query&f=live", // BMRI 25-27 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-29%20since%3A2021-07-27&src=typed_query&f=live", // BMRI 27-29 Juli 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-07-31%20since%3A2021-07-29&src=typed_query&f=live", // BMRI 29-31 Juli 2021

    // // agustus
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-03%20since%3A2021-08-01&src=typed_query&f=live", // BMRI 1-3 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-05%20since%3A2021-08-03&src=typed_query&f=live", // BMRI 3-5 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-07%20since%3A2021-08-05&src=typed_query&f=live", // BMRI 5-7 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-09%20since%3A2021-08-07&src=typed_query&f=live", // BMRI 7-9 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-11%20since%3A2021-08-09&src=typed_query&f=live", // BMRI 9-11 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-13%20since%3A2021-08-11&src=typed_query&f=live", // BMRI 11-13 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-15%20since%3A2021-08-13&src=typed_query&f=live", // BMRI 13-15 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-17%20since%3A2021-08-15&src=typed_query&f=live", // BMRI 15-17 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-19%20since%3A2021-08-17&src=typed_query&f=live", // BMRI 17-19 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-21%20since%3A2021-08-19&src=typed_query&f=live", // BMRI 19-21 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-23%20since%3A2021-08-21&src=typed_query&f=live", // BMRI 21-23 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-25%20since%3A2021-08-23&src=typed_query&f=live", // BMRI 23-25 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-27%20since%3A2021-08-25&src=typed_query&f=live", // BMRI 25-27 Agustus 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-08-31%20since%3A2021-08-27&src=typed_query&f=live", // BMRI 27-31 Agustus 2021

    // // september
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-03%20since%3A2021-09-01&src=typed_query&f=live", // BMRI 1-3 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-05%20since%3A2021-09-03&src=typed_query&f=live", // BMRI 3-5 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-07%20since%3A2021-09-05&src=typed_query&f=live", // BMRI 5-7 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-09%20since%3A2021-09-07&src=typed_query&f=live", // BMRI 7-9 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-11%20since%3A2021-09-09&src=typed_query&f=live", // BMRI 9-11 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-13%20since%3A2021-09-11&src=typed_query&f=live", // BMRI 11-13 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-15%20since%3A2021-09-13&src=typed_query&f=live", // BMRI 13-15 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-17%20since%3A2021-09-15&src=typed_query&f=live", // BMRI 15-17 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-19%20since%3A2021-09-17&src=typed_query&f=live", // BMRI 17-19 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-21%20since%3A2021-09-19&src=typed_query&f=live", // BMRI 19-21 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-23%20since%3A2021-09-21&src=typed_query&f=live", // BMRI 21-23 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-25%20since%3A2021-09-23&src=typed_query&f=live", // BMRI 23-25 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-27%20since%3A2021-09-25&src=typed_query&f=live", // BMRI 25-27 September 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-09-30%20since%3A2021-09-27&src=typed_query&f=live", // BMRI 27-30 September 2021
    
    // // oktober
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-03%20since%3A2021-10-01&src=typed_query&f=live", // BMRI 1-3 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-05%20since%3A2021-10-03&src=typed_query&f=live", // BMRI 3-5 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-07%20since%3A2021-10-05&src=typed_query&f=live", // BMRI 5-7 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-09%20since%3A2021-10-07&src=typed_query&f=live", // BMRI 7-9 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-11%20since%3A2021-10-09&src=typed_query&f=live", // BMRI 9-11 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-13%20since%3A2021-10-11&src=typed_query&f=live", // BMRI 11-13 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-15%20since%3A2021-10-13&src=typed_query&f=live", // BMRI 13-15 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-17%20since%3A2021-10-15&src=typed_query&f=live", // BMRI 15-17 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-19%20since%3A2021-10-17&src=typed_query&f=live", // BMRI 17-19 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-21%20since%3A2021-10-19&src=typed_query&f=live", // BMRI 19-21 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-23%20since%3A2021-10-21&src=typed_query&f=live", // BMRI 21-23 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-25%20since%3A2021-10-23&src=typed_query&f=live", // BMRI 23-25 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-27%20since%3A2021-10-25&src=typed_query&f=live", // BMRI 25-27 Oktober 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-10-31%20since%3A2021-10-27&src=typed_query&f=live", // BMRI 27-31 Oktober 2021

    // // november
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-03%20since%3A2021-11-01&src=typed_query&f=live", // BMRI 1-3 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-05%20since%3A2021-11-03&src=typed_query&f=live", // BMRI 3-5 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-07%20since%3A2021-11-05&src=typed_query&f=live", // BMRI 5-7 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-09%20since%3A2021-11-07&src=typed_query&f=live", // BMRI 7-9 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-11%20since%3A2021-11-09&src=typed_query&f=live", // BMRI 9-11 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-13%20since%3A2021-11-11&src=typed_query&f=live", // BMRI 11-13 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-15%20since%3A2021-11-13&src=typed_query&f=live", // BMRI 13-15 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-17%20since%3A2021-11-15&src=typed_query&f=live", // BMRI 15-17 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-19%20since%3A2021-11-17&src=typed_query&f=live", // BMRI 17-19 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-21%20since%3A2021-11-19&src=typed_query&f=live", // BMRI 19-21 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-23%20since%3A2021-11-21&src=typed_query&f=live", // BMRI 21-23 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-25%20since%3A2021-11-23&src=typed_query&f=live", // BMRI 23-25 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-27%20since%3A2021-11-25&src=typed_query&f=live", // BMRI 25-27 November 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-11-30%20since%3A2021-11-27&src=typed_query&f=live", // BMRI 27-30 November 2021

    // // desember
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-03%20since%3A2021-12-01&src=typed_query&f=live", // BMRI 1-3 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-05%20since%3A2021-12-03&src=typed_query&f=live", // BMRI 3-5 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-07%20since%3A2021-12-05&src=typed_query&f=live", // BMRI 5-7 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-09%20since%3A2021-12-07&src=typed_query&f=live", // BMRI 7-9 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-11%20since%3A2021-12-09&src=typed_query&f=live", // BMRI 9-11 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-13%20since%3A2021-12-11&src=typed_query&f=live", // BMRI 11-13 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-15%20since%3A2021-12-13&src=typed_query&f=live", // BMRI 13-15 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-17%20since%3A2021-12-15&src=typed_query&f=live", // BMRI 15-17 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-19%20since%3A2021-12-17&src=typed_query&f=live", // BMRI 17-19 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-21%20since%3A2021-12-19&src=typed_query&f=live", // BMRI 19-21 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-23%20since%3A2021-12-21&src=typed_query&f=live", // BMRI 21-23 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-25%20since%3A2021-12-23&src=typed_query&f=live", // BMRI 23-25 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-27%20since%3A2021-12-25&src=typed_query&f=live", // BMRI 25-27 Desember 2021
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-12-27&src=typed_query&f=live", // BMRI 27-31 Desember 2021

    // BMRI 2025
    // Kata Kunci: BMRI
    // top
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-30%20since%3A2025-01-01&src=typed_query", // BMRI Top Januari - Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-07-01&src=typed_query", // #BMRI Top Juli - Desember 2025

    // // januari
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-03%20since%3A2025-01-01&f=live&src=typed_query", // BMRI 1-3 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-05%20since%3A2025-01-03&f=live&src=typed_query", // BMRI 3-5 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-07%20since%3A2025-01-05&f=live&src=typed_query", // BMRI 5-7 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-09%20since%3A2025-01-07&f=live&src=typed_query", // BMRI 7-9 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-11%20since%3A2025-01-09&f=live&src=typed_query", // BMRI 9-11 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-13%20since%3A2025-01-11&f=live&src=typed_query", // BMRI 11-13 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-15%20since%3A2025-01-13&f=live&src=typed_query", // BMRI 13-15 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-17%20since%3A2025-01-15&f=live&src=typed_query", // BMRI 15-17 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-19%20since%3A2025-01-17&f=live&src=typed_query", // BMRI 17-19 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-21%20since%3A2025-01-19&f=live&src=typed_query", // BMRI 19-21 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-23%20since%3A2025-01-21&f=live&src=typed_query", // BMRI 21-23 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-25%20since%3A2025-01-23&f=live&src=typed_query", // BMRI 23-25 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-27%20since%3A2025-01-25&f=live&src=typed_query", // BMRI 25-27 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-29%20since%3A2025-01-27&f=live&src=typed_query", // BMRI 27-29 Januari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-01-31%20since%3A2025-01-29&f=live&src=typed_query", // BMRI 29-31 Januari 2025

    // // februari
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-03%20since%3A2025-02-01&src=typed_query&f=live", // BMRI 1-3 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-05%20since%3A2025-02-03&src=typed_query&f=live", // BMRI 3-5 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-07%20since%3A2025-02-05&src=typed_query&f=live", // BMRI 5-7 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-09%20since%3A2025-02-07&src=typed_query&f=live", // BMRI 7-9 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-11%20since%3A2025-02-09&src=typed_query&f=live", // BMRI 9-11 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-13%20since%3A2025-02-11&src=typed_query&f=live", // BMRI 11-13 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-15%20since%3A2025-02-13&src=typed_query&f=live", // BMRI 13-15 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-17%20since%3A2025-02-15&src=typed_query&f=live", // BMRI 15-17 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-19%20since%3A2025-02-17&src=typed_query&f=live", // BMRI 17-19 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-21%20since%3A2025-02-19&src=typed_query&f=live", // BMRI 19-21 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-23%20since%3A2025-02-21&src=typed_query&f=live", // BMRI 21-23 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-25%20since%3A2025-02-23&src=typed_query&f=live", // BMRI 23-25 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-27%20since%3A2025-02-25&src=typed_query&f=live", // BMRI 25-27 Februari 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-02-28%20since%3A2025-02-27&src=typed_query&f=live", // BMRI 27-28 Februari 2025

    // // maret
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-03%20since%3A2025-03-01&src=typed_query&f=live", // BMRI 1-3 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-05%20since%3A2025-03-03&src=typed_query&f=live", // BMRI 3-5 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-07%20since%3A2025-03-05&src=typed_query&f=live", // BMRI 5-7 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-09%20since%3A2025-03-07&src=typed_query&f=live", // BMRI 7-9 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-11%20since%3A2025-03-09&src=typed_query&f=live", // BMRI 9-11 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-13%20since%3A2025-03-11&src=typed_query&f=live", // BMRI 11-13 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-15%20since%3A2025-03-13&src=typed_query&f=live", // BMRI 13-15 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-17%20since%3A2025-03-15&src=typed_query&f=live", // BMRI 15-17 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-19%20since%3A2025-03-17&src=typed_query&f=live", // BMRI 17-19 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-21%20since%3A2025-03-19&src=typed_query&f=live", // BMRI 19-21 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-23%20since%3A2025-03-21&src=typed_query&f=live", // BMRI 21-23 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-25%20since%3A2025-03-23&src=typed_query&f=live", // BMRI 23-25 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-27%20since%3A2025-03-25&src=typed_query&f=live", // BMRI 25-27 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-29%20since%3A2025-03-27&src=typed_query&f=live", // BMRI 27-29 Maret 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-03-31%20since%3A2025-03-29&src=typed_query&f=live", // BMRI 29-31 Maret 2025

    // // april
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-03%20since%3A2025-04-01&src=typed_query&f=live", // BMRI 1-3 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-05%20since%3A2025-04-03&src=typed_query&f=live", // BMRI 3-5 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-07%20since%3A2025-04-05&src=typed_query&f=live", // BMRI 5-7 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-09%20since%3A2025-04-07&src=typed_query&f=live", // BMRI 7-9 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-11%20since%3A2025-04-09&src=typed_query&f=live", // BMRI 9-11 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-13%20since%3A2025-04-11&src=typed_query&f=live", // BMRI 11-13 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-15%20since%3A2025-04-13&src=typed_query&f=live", // BMRI 13-15 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-17%20since%3A2025-04-15&src=typed_query&f=live", // BMRI 15-17 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-19%20since%3A2025-04-17&src=typed_query&f=live", // BMRI 17-19 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-21%20since%3A2025-04-19&src=typed_query&f=live", // BMRI 19-21 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-23%20since%3A2025-04-21&src=typed_query&f=live", // BMRI 21-23 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-25%20since%3A2025-04-23&src=typed_query&f=live", // BMRI 23-25 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-27%20since%3A2025-04-25&src=typed_query&f=live", // BMRI 25-27 April 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-04-30%20since%3A2025-04-27&src=typed_query&f=live", // BMRI 27-30 April 2025

    // // mei
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-03%20since%3A2025-05-01&src=typed_query&f=live", // BMRI 1-3 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-05%20since%3A2025-05-03&src=typed_query&f=live", // BMRI 3-5 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-07%20since%3A2025-05-05&src=typed_query&f=live", // BMRI 5-7 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-09%20since%3A2025-05-07&src=typed_query&f=live", // BMRI 7-9 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-11%20since%3A2025-05-09&src=typed_query&f=live", // BMRI 9-11 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-13%20since%3A2025-05-11&src=typed_query&f=live", // BMRI 11-13 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-15%20since%3A2025-05-13&src=typed_query&f=live", // BMRI 13-15 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-17%20since%3A2025-05-15&src=typed_query&f=live", // BMRI 15-17 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-19%20since%3A2025-05-17&src=typed_query&f=live", // BMRI 17-19 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-21%20since%3A2025-05-19&src=typed_query&f=live", // BMRI 19-21 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-23%20since%3A2025-05-21&src=typed_query&f=live", // BMRI 21-23 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-25%20since%3A2025-05-23&src=typed_query&f=live", // BMRI 23-25 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-27%20since%3A2025-05-25&src=typed_query&f=live", // BMRI 25-27 Mei 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-05-31%20since%3A2025-05-27&src=typed_query&f=live", // BMRI 27-31 Mei 2025

    // // juni
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-03%20since%3A2025-06-01&src=typed_query&f=live", // BMRI 1-3 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-05%20since%3A2025-06-03&src=typed_query&f=live", // BMRI 3-5 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-07%20since%3A2025-06-05&src=typed_query&f=live", // BMRI 5-7 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-09%20since%3A2025-06-07&src=typed_query&f=live", // BMRI 7-9 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-11%20since%3A2025-06-09&src=typed_query&f=live", // BMRI 9-11 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-13%20since%3A2025-06-11&src=typed_query&f=live", // BMRI 11-13 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-15%20since%3A2025-06-13&src=typed_query&f=live", // BMRI 13-15 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-17%20since%3A2025-06-15&src=typed_query&f=live", // BMRI 15-17 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-19%20since%3A2025-06-17&src=typed_query&f=live", // BMRI 17-19 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-21%20since%3A2025-06-19&src=typed_query&f=live", // BMRI 19-21 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-23%20since%3A2025-06-21&src=typed_query&f=live", // BMRI 21-23 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-25%20since%3A2025-06-23&src=typed_query&f=live", // BMRI 23-25 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-27%20since%3A2025-06-25&src=typed_query&f=live", // BMRI 25-27 Juni 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-06-30%20since%3A2025-06-27&src=typed_query&f=live", // BMRI 27-30 Juni 2025

    // // juli
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-03%20since%3A2025-07-01&src=typed_query&f=live", // BMRI 1-3 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-05%20since%3A2025-07-03&src=typed_query&f=live", // BMRI 3-5 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-07%20since%3A2025-07-05&src=typed_query&f=live", // BMRI 5-7 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-09%20since%3A2025-07-07&src=typed_query&f=live", // BMRI 7-9 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-11%20since%3A2025-07-09&src=typed_query&f=live", // BMRI 9-11 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-13%20since%3A2025-07-11&src=typed_query&f=live", // BMRI 11-13 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-15%20since%3A2025-07-13&src=typed_query&f=live", // BMRI 13-15 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-17%20since%3A2025-07-15&src=typed_query&f=live", // BMRI 15-17 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-19%20since%3A2025-07-17&src=typed_query&f=live", // BMRI 17-19 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-21%20since%3A2025-07-19&src=typed_query&f=live", // BMRI 19-21 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-23%20since%3A2025-07-21&src=typed_query&f=live", // BMRI 21-23 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-25%20since%3A2025-07-23&src=typed_query&f=live", // BMRI 23-25 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-27%20since%3A2025-07-25&src=typed_query&f=live", // BMRI 25-27 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-29%20since%3A2025-07-27&src=typed_query&f=live", // BMRI 27-29 Juli 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-07-31%20since%3A2025-07-29&src=typed_query&f=live", // BMRI 29-31 Juli 2025

    // // agustus
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-03%20since%3A2025-08-01&src=typed_query&f=live", // BMRI 1-3 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-05%20since%3A2025-08-03&src=typed_query&f=live", // BMRI 3-5 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-07%20since%3A2025-08-05&src=typed_query&f=live", // BMRI 5-7 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-09%20since%3A2025-08-07&src=typed_query&f=live", // BMRI 7-9 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-11%20since%3A2025-08-09&src=typed_query&f=live", // BMRI 9-11 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-13%20since%3A2025-08-11&src=typed_query&f=live", // BMRI 11-13 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-15%20since%3A2025-08-13&src=typed_query&f=live", // BMRI 13-15 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-17%20since%3A2025-08-15&src=typed_query&f=live", // BMRI 15-17 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-19%20since%3A2025-08-17&src=typed_query&f=live", // BMRI 17-19 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-21%20since%3A2025-08-19&src=typed_query&f=live", // BMRI 19-21 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-23%20since%3A2025-08-21&src=typed_query&f=live", // BMRI 21-23 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-25%20since%3A2025-08-23&src=typed_query&f=live", // BMRI 23-25 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-27%20since%3A2025-08-25&src=typed_query&f=live", // BMRI 25-27 Agustus 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-08-31%20since%3A2025-08-27&src=typed_query&f=live", // BMRI 27-31 Agustus 2025

    // // september
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-03%20since%3A2025-09-01&src=typed_query&f=live", // BMRI 1-3 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-05%20since%3A2025-09-03&src=typed_query&f=live", // BMRI 3-5 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-07%20since%3A2025-09-05&src=typed_query&f=live", // BMRI 5-7 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-09%20since%3A2025-09-07&src=typed_query&f=live", // BMRI 7-9 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-11%20since%3A2025-09-09&src=typed_query&f=live", // BMRI 9-11 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-13%20since%3A2025-09-11&src=typed_query&f=live", // BMRI 11-13 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-15%20since%3A2025-09-13&src=typed_query&f=live", // BMRI 13-15 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-17%20since%3A2025-09-15&src=typed_query&f=live", // BMRI 15-17 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-19%20since%3A2025-09-17&src=typed_query&f=live", // BMRI 17-19 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-21%20since%3A2025-09-19&src=typed_query&f=live", // BMRI 19-21 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-23%20since%3A2025-09-21&src=typed_query&f=live", // BMRI 21-23 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-25%20since%3A2025-09-23&src=typed_query&f=live", // BMRI 23-25 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-27%20since%3A2025-09-25&src=typed_query&f=live", // BMRI 25-27 September 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-09-30%20since%3A2025-09-27&src=typed_query&f=live", // BMRI 27-30 September 2025
    
    // // oktober
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-03%20since%3A2025-10-01&src=typed_query&f=live", // BMRI 1-3 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-05%20since%3A2025-10-03&src=typed_query&f=live", // BMRI 3-5 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-07%20since%3A2025-10-05&src=typed_query&f=live", // BMRI 5-7 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-09%20since%3A2025-10-07&src=typed_query&f=live", // BMRI 7-9 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-11%20since%3A2025-10-09&src=typed_query&f=live", // BMRI 9-11 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-13%20since%3A2025-10-11&src=typed_query&f=live", // BMRI 11-13 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-15%20since%3A2025-10-13&src=typed_query&f=live", // BMRI 13-15 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-17%20since%3A2025-10-15&src=typed_query&f=live", // BMRI 15-17 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-19%20since%3A2025-10-17&src=typed_query&f=live", // BMRI 17-19 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-21%20since%3A2025-10-19&src=typed_query&f=live", // BMRI 19-21 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-23%20since%3A2025-10-21&src=typed_query&f=live", // BMRI 21-23 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-25%20since%3A2025-10-23&src=typed_query&f=live", // BMRI 23-25 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-27%20since%3A2025-10-25&src=typed_query&f=live", // BMRI 25-27 Oktober 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-10-27&src=typed_query&f=live", // BMRI 27-31 Oktober 2025

    // // november
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-03%20since%3A2025-11-01&src=typed_query&f=live", // BMRI 1-3 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-05%20since%3A2025-11-03&src=typed_query&f=live", // BMRI 3-5 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-07%20since%3A2025-11-05&src=typed_query&f=live", // BMRI 5-7 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-09%20since%3A2025-11-07&src=typed_query&f=live", // BMRI 7-9 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-11%20since%3A2025-11-09&src=typed_query&f=live", // BMRI 9-11 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-13%20since%3A2025-11-11&src=typed_query&f=live", // BMRI 11-13 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-15%20since%3A2025-11-13&src=typed_query&f=live", // BMRI 13-15 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-17%20since%3A2025-11-15&src=typed_query&f=live", // BMRI 15-17 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-19%20since%3A2025-11-17&src=typed_query&f=live", // BMRI 17-19 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-21%20since%3A2025-11-19&src=typed_query&f=live", // BMRI 19-21 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-23%20since%3A2025-11-21&src=typed_query&f=live", // BMRI 21-23 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-25%20since%3A2025-11-23&src=typed_query&f=live", // BMRI 23-25 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-27%20since%3A2025-11-25&src=typed_query&f=live", // BMRI 25-27 November 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-11-30%20since%3A2025-11-27&src=typed_query&f=live", // BMRI 27-30 November 2025

    // // desember
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-03%20since%3A2025-12-01&src=typed_query&f=live", // BMRI 1-3 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-05%20since%3A2025-12-03&src=typed_query&f=live", // BMRI 3-5 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-07%20since%3A2025-12-05&src=typed_query&f=live", // BMRI 5-7 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-09%20since%3A2025-12-07&src=typed_query&f=live", // BMRI 7-9 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-11%20since%3A2025-12-09&src=typed_query&f=live", // BMRI 9-11 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-13%20since%3A2025-12-11&src=typed_query&f=live", // BMRI 11-13 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-15%20since%3A2025-12-13&src=typed_query&f=live", // BMRI 13-15 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-17%20since%3A2025-12-15&src=typed_query&f=live", // BMRI 15-17 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-19%20since%3A2025-12-17&src=typed_query&f=live", // BMRI 17-19 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-21%20since%3A2025-12-19&src=typed_query&f=live", // BMRI 19-21 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-23%20since%3A2025-12-21&src=typed_query&f=live", // BMRI 21-23 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-25%20since%3A2025-12-23&src=typed_query&f=live", // BMRI 23-25 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-27%20since%3A2025-12-25&src=typed_query&f=live", // BMRI 25-27 Desember 2025
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-12-27&src=typed_query&f=live", // BMRI 27-31 Desember 2025
    
    // Kata Kunci: #BMRI
    // top 
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-30%20since%3A2025-01-01&src=typed_query", // #BMRI januari - juni top 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-07-01&src=typed_query", // #BMRI juli - desember top 2025

    // // januari
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-03%20since%3A2025-01-01&f=live&src=typed_query", // BMRI 1-3 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-05%20since%3A2025-01-03&f=live&src=typed_query", // BMRI 3-5 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-07%20since%3A2025-01-05&f=live&src=typed_query", // BMRI 5-7 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-09%20since%3A2025-01-07&f=live&src=typed_query", // BMRI 7-9 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-11%20since%3A2025-01-09&f=live&src=typed_query", // BMRI 9-11 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-13%20since%3A2025-01-11&f=live&src=typed_query", // BMRI 11-13 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-15%20since%3A2025-01-13&f=live&src=typed_query", // BMRI 13-15 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-17%20since%3A2025-01-15&f=live&src=typed_query", // BMRI 15-17 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-19%20since%3A2025-01-17&f=live&src=typed_query", // BMRI 17-19 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-21%20since%3A2025-01-19&f=live&src=typed_query", // BMRI 19-21 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-23%20since%3A2025-01-21&f=live&src=typed_query", // BMRI 21-23 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-25%20since%3A2025-01-23&f=live&src=typed_query", // BMRI 23-25 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-27%20since%3A2025-01-25&f=live&src=typed_query", // BMRI 25-27 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-29%20since%3A2025-01-27&f=live&src=typed_query", // BMRI 27-29 Januari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-01-31%20since%3A2025-01-29&f=live&src=typed_query", // BMRI 29-31 Januari 2025

    // // februari
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-03%20since%3A2025-02-01&src=typed_query&f=live", // BMRI 1-3 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-05%20since%3A2025-02-03&src=typed_query&f=live", // BMRI 3-5 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-07%20since%3A2025-02-05&src=typed_query&f=live", // BMRI 5-7 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-09%20since%3A2025-02-07&src=typed_query&f=live", // BMRI 7-9 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-11%20since%3A2025-02-09&src=typed_query&f=live", // BMRI 9-11 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-13%20since%3A2025-02-11&src=typed_query&f=live", // BMRI 11-13 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-15%20since%3A2025-02-13&src=typed_query&f=live", // BMRI 13-15 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-17%20since%3A2025-02-15&src=typed_query&f=live", // BMRI 15-17 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-19%20since%3A2025-02-17&src=typed_query&f=live", // BMRI 17-19 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-21%20since%3A2025-02-19&src=typed_query&f=live", // BMRI 19-21 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-23%20since%3A2025-02-21&src=typed_query&f=live", // BMRI 21-23 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-25%20since%3A2025-02-23&src=typed_query&f=live", // BMRI 23-25 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-27%20since%3A2025-02-25&src=typed_query&f=live", // BMRI 25-27 Februari 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-02-28%20since%3A2025-02-27&src=typed_query&f=live", // BMRI 27-28 Februari 2025

    // // maret
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-03%20since%3A2025-03-01&src=typed_query&f=live", // BMRI 1-3 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-05%20since%3A2025-03-03&src=typed_query&f=live", // BMRI 3-5 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-07%20since%3A2025-03-05&src=typed_query&f=live", // BMRI 5-7 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-09%20since%3A2025-03-07&src=typed_query&f=live", // BMRI 7-9 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-11%20since%3A2025-03-09&src=typed_query&f=live", // BMRI 9-11 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-13%20since%3A2025-03-11&src=typed_query&f=live", // BMRI 11-13 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-15%20since%3A2025-03-13&src=typed_query&f=live", // BMRI 13-15 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-17%20since%3A2025-03-15&src=typed_query&f=live", // BMRI 15-17 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-19%20since%3A2025-03-17&src=typed_query&f=live", // BMRI 17-19 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-21%20since%3A2025-03-19&src=typed_query&f=live", // BMRI 19-21 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-23%20since%3A2025-03-21&src=typed_query&f=live", // BMRI 21-23 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-25%20since%3A2025-03-23&src=typed_query&f=live", // BMRI 23-25 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-27%20since%3A2025-03-25&src=typed_query&f=live", // BMRI 25-27 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-29%20since%3A2025-03-27&src=typed_query&f=live", // BMRI 27-29 Maret 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-03-31%20since%3A2025-03-29&src=typed_query&f=live", // BMRI 29-31 Maret 2025

    // // april
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-03%20since%3A2025-04-01&src=typed_query&f=live", // BMRI 1-3 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-05%20since%3A2025-04-03&src=typed_query&f=live", // BMRI 3-5 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-07%20since%3A2025-04-05&src=typed_query&f=live", // BMRI 5-7 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-09%20since%3A2025-04-07&src=typed_query&f=live", // BMRI 7-9 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-11%20since%3A2025-04-09&src=typed_query&f=live", // BMRI 9-11 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-13%20since%3A2025-04-11&src=typed_query&f=live", // BMRI 11-13 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-15%20since%3A2025-04-13&src=typed_query&f=live", // BMRI 13-15 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-17%20since%3A2025-04-15&src=typed_query&f=live", // BMRI 15-17 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-19%20since%3A2025-04-17&src=typed_query&f=live", // BMRI 17-19 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-21%20since%3A2025-04-19&src=typed_query&f=live", // BMRI 19-21 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-23%20since%3A2025-04-21&src=typed_query&f=live", // BMRI 21-23 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-25%20since%3A2025-04-23&src=typed_query&f=live", // BMRI 23-25 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-27%20since%3A2025-04-25&src=typed_query&f=live", // BMRI 25-27 April 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-04-30%20since%3A2025-04-27&src=typed_query&f=live", // BMRI 27-30 April 2025

    // // mei
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-03%20since%3A2025-05-01&src=typed_query&f=live", // BMRI 1-3 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-05%20since%3A2025-05-03&src=typed_query&f=live", // BMRI 3-5 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-07%20since%3A2025-05-05&src=typed_query&f=live", // BMRI 5-7 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-09%20since%3A2025-05-07&src=typed_query&f=live", // BMRI 7-9 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-11%20since%3A2025-05-09&src=typed_query&f=live", // BMRI 9-11 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-13%20since%3A2025-05-11&src=typed_query&f=live", // BMRI 11-13 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-15%20since%3A2025-05-13&src=typed_query&f=live", // BMRI 13-15 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-17%20since%3A2025-05-15&src=typed_query&f=live", // BMRI 15-17 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-19%20since%3A2025-05-17&src=typed_query&f=live", // BMRI 17-19 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-21%20since%3A2025-05-19&src=typed_query&f=live", // BMRI 19-21 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-23%20since%3A2025-05-21&src=typed_query&f=live", // BMRI 21-23 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-25%20since%3A2025-05-23&src=typed_query&f=live", // BMRI 23-25 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-27%20since%3A2025-05-25&src=typed_query&f=live", // BMRI 25-27 Mei 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-05-31%20since%3A2025-05-27&src=typed_query&f=live", // BMRI 27-31 Mei 2025

    // // juni
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-03%20since%3A2025-06-01&src=typed_query&f=live", // BMRI 1-3 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-05%20since%3A2025-06-03&src=typed_query&f=live", // BMRI 3-5 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-07%20since%3A2025-06-05&src=typed_query&f=live", // BMRI 5-7 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-09%20since%3A2025-06-07&src=typed_query&f=live", // BMRI 7-9 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-11%20since%3A2025-06-09&src=typed_query&f=live", // BMRI 9-11 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-13%20since%3A2025-06-11&src=typed_query&f=live", // BMRI 11-13 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-15%20since%3A2025-06-13&src=typed_query&f=live", // BMRI 13-15 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-17%20since%3A2025-06-15&src=typed_query&f=live", // BMRI 15-17 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-19%20since%3A2025-06-17&src=typed_query&f=live", // BMRI 17-19 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-21%20since%3A2025-06-19&src=typed_query&f=live", // BMRI 19-21 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-23%20since%3A2025-06-21&src=typed_query&f=live", // BMRI 21-23 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-25%20since%3A2025-06-23&src=typed_query&f=live", // BMRI 23-25 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-27%20since%3A2025-06-25&src=typed_query&f=live", // BMRI 25-27 Juni 2025
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-06-30%20since%3A2025-06-27&src=typed_query&f=live", // BMRI 27-30 Juni 2025

    // juli
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-03%20since%3A2025-07-01&src=typed_query&f=live", // BMRI 1-3 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-05%20since%3A2025-07-03&src=typed_query&f=live", // BMRI 3-5 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-07%20since%3A2025-07-05&src=typed_query&f=live", // BMRI 5-7 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-09%20since%3A2025-07-07&src=typed_query&f=live", // BMRI 7-9 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-11%20since%3A2025-07-09&src=typed_query&f=live", // BMRI 9-11 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-13%20since%3A2025-07-11&src=typed_query&f=live", // BMRI 11-13 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-15%20since%3A2025-07-13&src=typed_query&f=live", // BMRI 13-15 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-17%20since%3A2025-07-15&src=typed_query&f=live", // BMRI 15-17 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-19%20since%3A2025-07-17&src=typed_query&f=live", // BMRI 17-19 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-21%20since%3A2025-07-19&src=typed_query&f=live", // BMRI 19-21 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-23%20since%3A2025-07-21&src=typed_query&f=live", // BMRI 21-23 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-25%20since%3A2025-07-23&src=typed_query&f=live", // BMRI 23-25 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-27%20since%3A2025-07-25&src=typed_query&f=live", // BMRI 25-27 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-29%20since%3A2025-07-27&src=typed_query&f=live", // BMRI 27-29 Juli 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-07-31%20since%3A2025-07-29&src=typed_query&f=live", // BMRI 29-31 Juli 2025

    // agustus
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-03%20since%3A2025-08-01&src=typed_query&f=live", // BMRI 1-3 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-05%20since%3A2025-08-03&src=typed_query&f=live", // BMRI 3-5 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-07%20since%3A2025-08-05&src=typed_query&f=live", // BMRI 5-7 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-09%20since%3A2025-08-07&src=typed_query&f=live", // BMRI 7-9 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-11%20since%3A2025-08-09&src=typed_query&f=live", // BMRI 9-11 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-13%20since%3A2025-08-11&src=typed_query&f=live", // BMRI 11-13 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-15%20since%3A2025-08-13&src=typed_query&f=live", // BMRI 13-15 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-17%20since%3A2025-08-15&src=typed_query&f=live", // BMRI 15-17 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-19%20since%3A2025-08-17&src=typed_query&f=live", // BMRI 17-19 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-21%20since%3A2025-08-19&src=typed_query&f=live", // BMRI 19-21 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-23%20since%3A2025-08-21&src=typed_query&f=live", // BMRI 21-23 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-25%20since%3A2025-08-23&src=typed_query&f=live", // BMRI 23-25 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-27%20since%3A2025-08-25&src=typed_query&f=live", // BMRI 25-27 Agustus 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-08-31%20since%3A2025-08-27&src=typed_query&f=live", // BMRI 27-31 Agustus 2025

    // september
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-03%20since%3A2025-09-01&src=typed_query&f=live", // BMRI 1-3 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-05%20since%3A2025-09-03&src=typed_query&f=live", // BMRI 3-5 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-07%20since%3A2025-09-05&src=typed_query&f=live", // BMRI 5-7 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-09%20since%3A2025-09-07&src=typed_query&f=live", // BMRI 7-9 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-11%20since%3A2025-09-09&src=typed_query&f=live", // BMRI 9-11 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-13%20since%3A2025-09-11&src=typed_query&f=live", // BMRI 11-13 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-15%20since%3A2025-09-13&src=typed_query&f=live", // BMRI 13-15 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-17%20since%3A2025-09-15&src=typed_query&f=live", // BMRI 15-17 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-19%20since%3A2025-09-17&src=typed_query&f=live", // BMRI 17-19 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-21%20since%3A2025-09-19&src=typed_query&f=live", // BMRI 19-21 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-23%20since%3A2025-09-21&src=typed_query&f=live", // BMRI 21-23 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-25%20since%3A2025-09-23&src=typed_query&f=live", // BMRI 23-25 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-27%20since%3A2025-09-25&src=typed_query&f=live", // BMRI 25-27 September 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-09-30%20since%3A2025-09-27&src=typed_query&f=live", // BMRI 27-30 September 2025
    
    // oktober
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-03%20since%3A2025-10-01&src=typed_query&f=live", // BMRI 1-3 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-05%20since%3A2025-10-03&src=typed_query&f=live", // BMRI 3-5 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-07%20since%3A2025-10-05&src=typed_query&f=live", // BMRI 5-7 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-09%20since%3A2025-10-07&src=typed_query&f=live", // BMRI 7-9 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-11%20since%3A2025-10-09&src=typed_query&f=live", // BMRI 9-11 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-13%20since%3A2025-10-11&src=typed_query&f=live", // BMRI 11-13 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-15%20since%3A2025-10-13&src=typed_query&f=live", // BMRI 13-15 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-17%20since%3A2025-10-15&src=typed_query&f=live", // BMRI 15-17 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-19%20since%3A2025-10-17&src=typed_query&f=live", // BMRI 17-19 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-21%20since%3A2025-10-19&src=typed_query&f=live", // BMRI 19-21 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-23%20since%3A2025-10-21&src=typed_query&f=live", // BMRI 21-23 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-25%20since%3A2025-10-23&src=typed_query&f=live", // BMRI 23-25 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-27%20since%3A2025-10-25&src=typed_query&f=live", // BMRI 25-27 Oktober 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-10-27&src=typed_query&f=live", // BMRI 27-31 Oktober 2025

    // november
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-03%20since%3A2025-11-01&src=typed_query&f=live", // BMRI 1-3 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-05%20since%3A2025-11-03&src=typed_query&f=live", // BMRI 3-5 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-07%20since%3A2025-11-05&src=typed_query&f=live", // BMRI 5-7 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-09%20since%3A2025-11-07&src=typed_query&f=live", // BMRI 7-9 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-11%20since%3A2025-11-09&src=typed_query&f=live", // BMRI 9-11 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-13%20since%3A2025-11-11&src=typed_query&f=live", // BMRI 11-13 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-15%20since%3A2025-11-13&src=typed_query&f=live", // BMRI 13-15 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-17%20since%3A2025-11-15&src=typed_query&f=live", // BMRI 15-17 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-19%20since%3A2025-11-17&src=typed_query&f=live", // BMRI 17-19 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-21%20since%3A2025-11-19&src=typed_query&f=live", // BMRI 19-21 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-23%20since%3A2025-11-21&src=typed_query&f=live", // BMRI 21-23 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-25%20since%3A2025-11-23&src=typed_query&f=live", // BMRI 23-25 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-27%20since%3A2025-11-25&src=typed_query&f=live", // BMRI 25-27 November 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-11-30%20since%3A2025-11-27&src=typed_query&f=live", // BMRI 27-30 November 2025

    // desember
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-03%20since%3A2025-12-01&src=typed_query&f=live", // BMRI 1-3 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-05%20since%3A2025-12-03&src=typed_query&f=live", // BMRI 3-5 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-07%20since%3A2025-12-05&src=typed_query&f=live", // BMRI 5-7 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-09%20since%3A2025-12-07&src=typed_query&f=live", // BMRI 7-9 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-11%20since%3A2025-12-09&src=typed_query&f=live", // BMRI 9-11 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-13%20since%3A2025-12-11&src=typed_query&f=live", // BMRI 11-13 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-15%20since%3A2025-12-13&src=typed_query&f=live", // BMRI 13-15 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-17%20since%3A2025-12-15&src=typed_query&f=live", // BMRI 15-17 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-19%20since%3A2025-12-17&src=typed_query&f=live", // BMRI 17-19 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-21%20since%3A2025-12-19&src=typed_query&f=live", // BMRI 19-21 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-23%20since%3A2025-12-21&src=typed_query&f=live", // BMRI 21-23 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-25%20since%3A2025-12-23&src=typed_query&f=live", // BMRI 23-25 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-27%20since%3A2025-12-25&src=typed_query&f=live", // BMRI 25-27 Desember 2025
    "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-12-27&src=typed_query&f=live", // BMRI 27-31 Desember 2025
];

const SCRAPING_TIME = 6 * 60 * 60 * 1000; // 6 jam
const COOKIES_FILE = "cookies_twitter3.json";
const COOKIES_MAX_AGE = 12 * 60 * 60 * 1000; // 12 jam

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

function detectSahamFromURL(url) {
    const lower = url.toLowerCase();

    if (lower.includes("bbri")) return "bbri";
    if (lower.includes("tlkm")) return "tlkm";
    if (lower.includes("icbp")) return "icbp";
    if (lower.includes("bmri")) return "bmri";
    if (lower.includes("unvr")) return "unvr";
    if (lower.includes("isat")) return "isat";

    return "unknown";
}

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
    if (fs.existsSync("tweets_bmri_2025.json")) {
        const existing = JSON.parse(fs.readFileSync("tweets_bmri_2025.json", "utf-8"));
        existing.forEach((t) => tweets.add(JSON.stringify(t)));
    }

    const startTime = Date.now();

    for (const url of twitterURLs) {
        const sahamCode = detectSahamFromURL(url);
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
                const newTweets = await page.evaluate((saham) => {
                    const data = [];
                    document.querySelectorAll("article").forEach((tweet) => {
                        const content = tweet.querySelector("div[lang]")?.innerText || "No content";
                        const dateEl = tweet.querySelector("time");
                        const date = dateEl ? dateEl.getAttribute("datetime").split("T")[0] : null;
                        if (date && content && content !== "No content") {
                            data.push({ 
                                date, 
                                tweet: content, 
                                sentiment: "", 
                                saham: saham } );
                        }
                    });
                    return data;
                }, sahamCode);

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
    fs.writeFileSync("tweets_bmri_2025.json", JSON.stringify(tweetArray, null, 2));
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
