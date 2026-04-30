const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const Sentiment = require("sentiment");

// list akun twitter 
// 1. hgr.allphantom22@gmail.com
// 2. paladintrinity01@gmail.com
// 3. phantom.zero2022@gmail.com
// 4. hgrphantom01@gmail.com

// akun file google: hgr.allphantom22@gmail.com

puppeteer.use(StealthPlugin());
const sentiment = new Sentiment();

require("dotenv").config();

const twitterURLs = [
    // BBRI 2025
    // Kata Kunci: BBRI
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2025-11-30%20since%3A2025-11-01&src=typed_query&f=live", // November live 2025
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-12-01&f=live&src=typed_query", // Desember live 2025
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2025-11-30%20since%3A2025-11-01&src=typed_query", // November top 2025
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-12-01&src=typed_query" // Desember top 2025

    // Kata Kunci: #BBRI
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2025-11-30%20since%3A2025-11-01&src=typed_query&f=live", // November live 2025
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-12-01&f=live&src=typed_query", // Desember live 2025
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2025-11-30%20since%3A2025-11-01&src=typed_query", // November top 2025
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2025-12-31%20since%3A2025-12-01&src=typed_query" // Desember top 2025

    // BBRI 2018
    // Kata Kunci: BBRI
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query", // BBRI Top Januari - Juni 2018
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query", // BBRI Top Juli - Desember 2018
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query&f=live", // BBRI Live Januari - Juni 2018
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query&f=live", // BBRI Live Juli - Desember 2018

    // Kata Kunci: #BBRI
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query", // #BBRI Top Januari - Juni 2018
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query", // #BBRI Top Juli - Desember 2018
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query&f=live", // #BBRI Live Januari - Juni 2018
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query&f=live", // #BBRI Live Juli - Desember 2018

    // BMRI 2018
    // Kata Kunci: BMRI
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query", // BMRI Top Januari - Juni 2019
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query", // BMRI Top Juli - Desember 2019
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query&f=live", // BMRI Live Januari - Juni 2019
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query&f=live", // BMRI Live Juli - Desember 2019

    // Kata Kunci: #BMRI
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query", // #BMRI Top Januari - Juni 2019
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query", // #BMRI Top Juli - Desember 2019
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query&f=live", // #BMRI Live Januari - Juni 2019
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query&f=live", // #BMRI Live Juli - Desember 2019

    // BMRI 2023
    // Kata Kunci: BMRI
    // top
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query", // BMRI Top Januari - Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query", // #BMRI Top Juli - Desember 2023

    // // januari
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-03%20since%3A2023-01-01&f=live&src=typed_query", // BMRI 1-3 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-05%20since%3A2023-01-03&f=live&src=typed_query", // BMRI 3-5 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-07%20since%3A2023-01-05&f=live&src=typed_query", // BMRI 5-7 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-09%20since%3A2023-01-07&f=live&src=typed_query", // BMRI 7-9 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-11%20since%3A2023-01-09&f=live&src=typed_query", // BMRI 9-11 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-13%20since%3A2023-01-11&f=live&src=typed_query", // BMRI 11-13 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-15%20since%3A2023-01-13&f=live&src=typed_query", // BMRI 13-15 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-17%20since%3A2023-01-15&f=live&src=typed_query", // BMRI 15-17 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-19%20since%3A2023-01-17&f=live&src=typed_query", // BMRI 17-19 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-21%20since%3A2023-01-19&f=live&src=typed_query", // BMRI 19-21 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-23%20since%3A2023-01-21&f=live&src=typed_query", // BMRI 21-23 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-25%20since%3A2023-01-23&f=live&src=typed_query", // BMRI 23-25 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-27%20since%3A2023-01-25&f=live&src=typed_query", // BMRI 25-27 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-29%20since%3A2023-01-27&f=live&src=typed_query", // BMRI 27-29 Januari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-01-31%20since%3A2023-01-29&f=live&src=typed_query", // BMRI 29-31 Januari 2023

    // // februari
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-03%20since%3A2023-02-01&src=typed_query&f=live", // BMRI 1-3 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-05%20since%3A2023-02-03&src=typed_query&f=live", // BMRI 3-5 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-07%20since%3A2023-02-05&src=typed_query&f=live", // BMRI 5-7 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-09%20since%3A2023-02-07&src=typed_query&f=live", // BMRI 7-9 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-11%20since%3A2023-02-09&src=typed_query&f=live", // BMRI 9-11 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-13%20since%3A2023-02-11&src=typed_query&f=live", // BMRI 11-13 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-15%20since%3A2023-02-13&src=typed_query&f=live", // BMRI 13-15 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-17%20since%3A2023-02-15&src=typed_query&f=live", // BMRI 15-17 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-19%20since%3A2023-02-17&src=typed_query&f=live", // BMRI 17-19 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-21%20since%3A2023-02-19&src=typed_query&f=live", // BMRI 19-21 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-23%20since%3A2023-02-21&src=typed_query&f=live", // BMRI 21-23 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-25%20since%3A2023-02-23&src=typed_query&f=live", // BMRI 23-25 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-27%20since%3A2023-02-25&src=typed_query&f=live", // BMRI 25-27 Februari 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-27&src=typed_query&f=live", // BMRI 27-28 Februari 2023

    // // maret
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-03%20since%3A2023-03-01&src=typed_query&f=live", // BMRI 1-3 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-05%20since%3A2023-03-03&src=typed_query&f=live", // BMRI 3-5 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-07%20since%3A2023-03-05&src=typed_query&f=live", // BMRI 5-7 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-09%20since%3A2023-03-07&src=typed_query&f=live", // BMRI 7-9 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-11%20since%3A2023-03-09&src=typed_query&f=live", // BMRI 9-11 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-13%20since%3A2023-03-11&src=typed_query&f=live", // BMRI 11-13 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-15%20since%3A2023-03-13&src=typed_query&f=live", // BMRI 13-15 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-17%20since%3A2023-03-15&src=typed_query&f=live", // BMRI 15-17 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-19%20since%3A2023-03-17&src=typed_query&f=live", // BMRI 17-19 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-21%20since%3A2023-03-19&src=typed_query&f=live", // BMRI 19-21 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-23%20since%3A2023-03-21&src=typed_query&f=live", // BMRI 21-23 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-25%20since%3A2023-03-23&src=typed_query&f=live", // BMRI 23-25 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-27%20since%3A2023-03-25&src=typed_query&f=live", // BMRI 25-27 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-29%20since%3A2023-03-27&src=typed_query&f=live", // BMRI 27-29 Maret 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-29&src=typed_query&f=live", // BMRI 29-31 Maret 2023

    // // april
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-03%20since%3A2023-04-01&src=typed_query&f=live", // BMRI 1-3 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-05%20since%3A2023-04-03&src=typed_query&f=live", // BMRI 3-5 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-07%20since%3A2023-04-05&src=typed_query&f=live", // BMRI 5-7 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-09%20since%3A2023-04-07&src=typed_query&f=live", // BMRI 7-9 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-11%20since%3A2023-04-09&src=typed_query&f=live", // BMRI 9-11 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-13%20since%3A2023-04-11&src=typed_query&f=live", // BMRI 11-13 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-15%20since%3A2023-04-13&src=typed_query&f=live", // BMRI 13-15 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-17%20since%3A2023-04-15&src=typed_query&f=live", // BMRI 15-17 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-19%20since%3A2023-04-17&src=typed_query&f=live", // BMRI 17-19 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-21%20since%3A2023-04-19&src=typed_query&f=live", // BMRI 19-21 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-23%20since%3A2023-04-21&src=typed_query&f=live", // BMRI 21-23 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-25%20since%3A2023-04-23&src=typed_query&f=live", // BMRI 23-25 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-27%20since%3A2023-04-25&src=typed_query&f=live", // BMRI 25-27 April 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-27&src=typed_query&f=live", // BMRI 27-30 April 2023

    // // mei
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-03%20since%3A2023-05-01&src=typed_query&f=live", // BMRI 1-3 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-05%20since%3A2023-05-03&src=typed_query&f=live", // BMRI 3-5 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-07%20since%3A2023-05-05&src=typed_query&f=live", // BMRI 5-7 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-09%20since%3A2023-05-07&src=typed_query&f=live", // BMRI 7-9 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-11%20since%3A2023-05-09&src=typed_query&f=live", // BMRI 9-11 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-13%20since%3A2023-05-11&src=typed_query&f=live", // BMRI 11-13 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-15%20since%3A2023-05-13&src=typed_query&f=live", // BMRI 13-15 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-17%20since%3A2023-05-15&src=typed_query&f=live", // BMRI 15-17 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-19%20since%3A2023-05-17&src=typed_query&f=live", // BMRI 17-19 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-21%20since%3A2023-05-19&src=typed_query&f=live", // BMRI 19-21 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-23%20since%3A2023-05-21&src=typed_query&f=live", // BMRI 21-23 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-25%20since%3A2023-05-23&src=typed_query&f=live", // BMRI 23-25 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-27%20since%3A2023-05-25&src=typed_query&f=live", // BMRI 25-27 Mei 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-27&src=typed_query&f=live", // BMRI 27-31 Mei 2023

    // // juni
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-03%20since%3A2023-06-01&src=typed_query&f=live", // BMRI 1-3 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-05%20since%3A2023-06-03&src=typed_query&f=live", // BMRI 3-5 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-07%20since%3A2023-06-05&src=typed_query&f=live", // BMRI 5-7 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-09%20since%3A2023-06-07&src=typed_query&f=live", // BMRI 7-9 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-11%20since%3A2023-06-09&src=typed_query&f=live", // BMRI 9-11 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-13%20since%3A2023-06-11&src=typed_query&f=live", // BMRI 11-13 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-15%20since%3A2023-06-13&src=typed_query&f=live", // BMRI 13-15 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-17%20since%3A2023-06-15&src=typed_query&f=live", // BMRI 15-17 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-19%20since%3A2023-06-17&src=typed_query&f=live", // BMRI 17-19 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-21%20since%3A2023-06-19&src=typed_query&f=live", // BMRI 19-21 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-23%20since%3A2023-06-21&src=typed_query&f=live", // BMRI 21-23 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-25%20since%3A2023-06-23&src=typed_query&f=live", // BMRI 23-25 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-27%20since%3A2023-06-25&src=typed_query&f=live", // BMRI 25-27 Juni 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-27&src=typed_query&f=live", // BMRI 27-30 Juni 2023

    // // juli
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-03%20since%3A2023-07-01&src=typed_query&f=live", // BMRI 1-3 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-05%20since%3A2023-07-03&src=typed_query&f=live", // BMRI 3-5 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-07%20since%3A2023-07-05&src=typed_query&f=live", // BMRI 5-7 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-09%20since%3A2023-07-07&src=typed_query&f=live", // BMRI 7-9 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-11%20since%3A2023-07-09&src=typed_query&f=live", // BMRI 9-11 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-13%20since%3A2023-07-11&src=typed_query&f=live", // BMRI 11-13 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-15%20since%3A2023-07-13&src=typed_query&f=live", // BMRI 13-15 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-17%20since%3A2023-07-15&src=typed_query&f=live", // BMRI 15-17 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-19%20since%3A2023-07-17&src=typed_query&f=live", // BMRI 17-19 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-21%20since%3A2023-07-19&src=typed_query&f=live", // BMRI 19-21 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-23%20since%3A2023-07-21&src=typed_query&f=live", // BMRI 21-23 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-25%20since%3A2023-07-23&src=typed_query&f=live", // BMRI 23-25 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-27%20since%3A2023-07-25&src=typed_query&f=live", // BMRI 25-27 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-29%20since%3A2023-07-27&src=typed_query&f=live", // BMRI 27-29 Juli 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-29&src=typed_query&f=live", // BMRI 29-31 Juli 2023

    // // agustus
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-03%20since%3A2023-08-01&src=typed_query&f=live", // BMRI 1-3 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-05%20since%3A2023-08-03&src=typed_query&f=live", // BMRI 3-5 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-07%20since%3A2023-08-05&src=typed_query&f=live", // BMRI 5-7 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-09%20since%3A2023-08-07&src=typed_query&f=live", // BMRI 7-9 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-11%20since%3A2023-08-09&src=typed_query&f=live", // BMRI 9-11 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-13%20since%3A2023-08-11&src=typed_query&f=live", // BMRI 11-13 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-15%20since%3A2023-08-13&src=typed_query&f=live", // BMRI 13-15 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-17%20since%3A2023-08-15&src=typed_query&f=live", // BMRI 15-17 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-19%20since%3A2023-08-17&src=typed_query&f=live", // BMRI 17-19 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-21%20since%3A2023-08-19&src=typed_query&f=live", // BMRI 19-21 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-23%20since%3A2023-08-21&src=typed_query&f=live", // BMRI 21-23 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-25%20since%3A2023-08-23&src=typed_query&f=live", // BMRI 23-25 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-27%20since%3A2023-08-25&src=typed_query&f=live", // BMRI 25-27 Agustus 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-08-31%20since%3A2023-08-27&src=typed_query&f=live", // BMRI 27-31 Agustus 2023

    // // september
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-03%20since%3A2023-09-01&src=typed_query&f=live", // BMRI 1-3 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-05%20since%3A2023-09-03&src=typed_query&f=live", // BMRI 3-5 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-07%20since%3A2023-09-05&src=typed_query&f=live", // BMRI 5-7 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-09%20since%3A2023-09-07&src=typed_query&f=live", // BMRI 7-9 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-11%20since%3A2023-09-09&src=typed_query&f=live", // BMRI 9-11 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-13%20since%3A2023-09-11&src=typed_query&f=live", // BMRI 11-13 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-15%20since%3A2023-09-13&src=typed_query&f=live", // BMRI 13-15 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-17%20since%3A2023-09-15&src=typed_query&f=live", // BMRI 15-17 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-19%20since%3A2023-09-17&src=typed_query&f=live", // BMRI 17-19 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-21%20since%3A2023-09-19&src=typed_query&f=live", // BMRI 19-21 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-23%20since%3A2023-09-21&src=typed_query&f=live", // BMRI 21-23 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-25%20since%3A2023-09-23&src=typed_query&f=live", // BMRI 23-25 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-27%20since%3A2023-09-25&src=typed_query&f=live", // BMRI 25-27 September 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-27&src=typed_query&f=live", // BMRI 27-30 September 2023
    
    // // oktober
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-03%20since%3A2023-10-01&src=typed_query&f=live", // BMRI 1-3 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-05%20since%3A2023-10-03&src=typed_query&f=live", // BMRI 3-5 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-07%20since%3A2023-10-05&src=typed_query&f=live", // BMRI 5-7 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-09%20since%3A2023-10-07&src=typed_query&f=live", // BMRI 7-9 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-11%20since%3A2023-10-09&src=typed_query&f=live", // BMRI 9-11 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-13%20since%3A2023-10-11&src=typed_query&f=live", // BMRI 11-13 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-15%20since%3A2023-10-13&src=typed_query&f=live", // BMRI 13-15 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-17%20since%3A2023-10-15&src=typed_query&f=live", // BMRI 15-17 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-19%20since%3A2023-10-17&src=typed_query&f=live", // BMRI 17-19 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-21%20since%3A2023-10-19&src=typed_query&f=live", // BMRI 19-21 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-23%20since%3A2023-10-21&src=typed_query&f=live", // BMRI 21-23 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-25%20since%3A2023-10-23&src=typed_query&f=live", // BMRI 23-25 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-27%20since%3A2023-10-25&src=typed_query&f=live", // BMRI 25-27 Oktober 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-27&src=typed_query&f=live", // BMRI 27-31 Oktober 2023

    // // november
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-03%20since%3A2023-11-01&src=typed_query&f=live", // BMRI 1-3 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-05%20since%3A2023-11-03&src=typed_query&f=live", // BMRI 3-5 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-07%20since%3A2023-11-05&src=typed_query&f=live", // BMRI 5-7 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-09%20since%3A2023-11-07&src=typed_query&f=live", // BMRI 7-9 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-11%20since%3A2023-11-09&src=typed_query&f=live", // BMRI 9-11 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-13%20since%3A2023-11-11&src=typed_query&f=live", // BMRI 11-13 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-15%20since%3A2023-11-13&src=typed_query&f=live", // BMRI 13-15 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-17%20since%3A2023-11-15&src=typed_query&f=live", // BMRI 15-17 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-19%20since%3A2023-11-17&src=typed_query&f=live", // BMRI 17-19 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-21%20since%3A2023-11-19&src=typed_query&f=live", // BMRI 19-21 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-23%20since%3A2023-11-21&src=typed_query&f=live", // BMRI 21-23 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-25%20since%3A2023-11-23&src=typed_query&f=live", // BMRI 23-25 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-27%20since%3A2023-11-25&src=typed_query&f=live", // BMRI 25-27 November 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-27&src=typed_query&f=live", // BMRI 27-30 November 2023

    // // desember
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-03%20since%3A2023-12-01&src=typed_query&f=live", // BMRI 1-3 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-05%20since%3A2023-12-03&src=typed_query&f=live", // BMRI 3-5 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-07%20since%3A2023-12-05&src=typed_query&f=live", // BMRI 5-7 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-09%20since%3A2023-12-07&src=typed_query&f=live", // BMRI 7-9 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-11%20since%3A2023-12-09&src=typed_query&f=live", // BMRI 9-11 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-13%20since%3A2023-12-11&src=typed_query&f=live", // BMRI 11-13 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-15%20since%3A2023-12-13&src=typed_query&f=live", // BMRI 13-15 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-17%20since%3A2023-12-15&src=typed_query&f=live", // BMRI 15-17 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-19%20since%3A2023-12-17&src=typed_query&f=live", // BMRI 17-19 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-21%20since%3A2023-12-19&src=typed_query&f=live", // BMRI 19-21 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-23%20since%3A2023-12-21&src=typed_query&f=live", // BMRI 21-23 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-25%20since%3A2023-12-23&src=typed_query&f=live", // BMRI 23-25 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-27%20since%3A2023-12-25&src=typed_query&f=live", // BMRI 25-27 Desember 2023
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-27&src=typed_query&f=live", // BMRI 27-31 Desember 2023
    
    // Kata Kunci: #BMRI
    // top 
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query", // #BMRI januari - juni top 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query", // #BMRI juli - desember top 2023

    // // januari
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-03%20since%3A2023-01-01&f=live&src=typed_query", // BMRI 1-3 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-05%20since%3A2023-01-03&f=live&src=typed_query", // BMRI 3-5 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-07%20since%3A2023-01-05&f=live&src=typed_query", // BMRI 5-7 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-09%20since%3A2023-01-07&f=live&src=typed_query", // BMRI 7-9 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-11%20since%3A2023-01-09&f=live&src=typed_query", // BMRI 9-11 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-13%20since%3A2023-01-11&f=live&src=typed_query", // BMRI 11-13 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-15%20since%3A2023-01-13&f=live&src=typed_query", // BMRI 13-15 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-17%20since%3A2023-01-15&f=live&src=typed_query", // BMRI 15-17 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-19%20since%3A2023-01-17&f=live&src=typed_query", // BMRI 17-19 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-21%20since%3A2023-01-19&f=live&src=typed_query", // BMRI 19-21 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-23%20since%3A2023-01-21&f=live&src=typed_query", // BMRI 21-23 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-25%20since%3A2023-01-23&f=live&src=typed_query", // BMRI 23-25 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-27%20since%3A2023-01-25&f=live&src=typed_query", // BMRI 25-27 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-29%20since%3A2023-01-27&f=live&src=typed_query", // BMRI 27-29 Januari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-01-31%20since%3A2023-01-29&f=live&src=typed_query", // BMRI 29-31 Januari 2023

    // // februari
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-03%20since%3A2023-02-01&src=typed_query&f=live", // BMRI 1-3 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-05%20since%3A2023-02-03&src=typed_query&f=live", // BMRI 3-5 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-07%20since%3A2023-02-05&src=typed_query&f=live", // BMRI 5-7 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-09%20since%3A2023-02-07&src=typed_query&f=live", // BMRI 7-9 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-11%20since%3A2023-02-09&src=typed_query&f=live", // BMRI 9-11 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-13%20since%3A2023-02-11&src=typed_query&f=live", // BMRI 11-13 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-15%20since%3A2023-02-13&src=typed_query&f=live", // BMRI 13-15 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-17%20since%3A2023-02-15&src=typed_query&f=live", // BMRI 15-17 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-19%20since%3A2023-02-17&src=typed_query&f=live", // BMRI 17-19 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-21%20since%3A2023-02-19&src=typed_query&f=live", // BMRI 19-21 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-23%20since%3A2023-02-21&src=typed_query&f=live", // BMRI 21-23 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-25%20since%3A2023-02-23&src=typed_query&f=live", // BMRI 23-25 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-27%20since%3A2023-02-25&src=typed_query&f=live", // BMRI 25-27 Februari 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-27&src=typed_query&f=live", // BMRI 27-28 Februari 2023

    // // maret
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-03%20since%3A2023-03-01&src=typed_query&f=live", // BMRI 1-3 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-05%20since%3A2023-03-03&src=typed_query&f=live", // BMRI 3-5 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-07%20since%3A2023-03-05&src=typed_query&f=live", // BMRI 5-7 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-09%20since%3A2023-03-07&src=typed_query&f=live", // BMRI 7-9 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-11%20since%3A2023-03-09&src=typed_query&f=live", // BMRI 9-11 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-13%20since%3A2023-03-11&src=typed_query&f=live", // BMRI 11-13 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-15%20since%3A2023-03-13&src=typed_query&f=live", // BMRI 13-15 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-17%20since%3A2023-03-15&src=typed_query&f=live", // BMRI 15-17 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-19%20since%3A2023-03-17&src=typed_query&f=live", // BMRI 17-19 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-21%20since%3A2023-03-19&src=typed_query&f=live", // BMRI 19-21 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-23%20since%3A2023-03-21&src=typed_query&f=live", // BMRI 21-23 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-25%20since%3A2023-03-23&src=typed_query&f=live", // BMRI 23-25 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-27%20since%3A2023-03-25&src=typed_query&f=live", // BMRI 25-27 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-29%20since%3A2023-03-27&src=typed_query&f=live", // BMRI 27-29 Maret 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-29&src=typed_query&f=live", // BMRI 29-31 Maret 2023

    // // april
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-03%20since%3A2023-04-01&src=typed_query&f=live", // BMRI 1-3 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-05%20since%3A2023-04-03&src=typed_query&f=live", // BMRI 3-5 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-07%20since%3A2023-04-05&src=typed_query&f=live", // BMRI 5-7 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-09%20since%3A2023-04-07&src=typed_query&f=live", // BMRI 7-9 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-11%20since%3A2023-04-09&src=typed_query&f=live", // BMRI 9-11 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-13%20since%3A2023-04-11&src=typed_query&f=live", // BMRI 11-13 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-15%20since%3A2023-04-13&src=typed_query&f=live", // BMRI 13-15 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-17%20since%3A2023-04-15&src=typed_query&f=live", // BMRI 15-17 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-19%20since%3A2023-04-17&src=typed_query&f=live", // BMRI 17-19 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-21%20since%3A2023-04-19&src=typed_query&f=live", // BMRI 19-21 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-23%20since%3A2023-04-21&src=typed_query&f=live", // BMRI 21-23 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-25%20since%3A2023-04-23&src=typed_query&f=live", // BMRI 23-25 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-27%20since%3A2023-04-25&src=typed_query&f=live", // BMRI 25-27 April 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-27&src=typed_query&f=live", // BMRI 27-30 April 2023

    // // mei
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-03%20since%3A2023-05-01&src=typed_query&f=live", // BMRI 1-3 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-05%20since%3A2023-05-03&src=typed_query&f=live", // BMRI 3-5 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-07%20since%3A2023-05-05&src=typed_query&f=live", // BMRI 5-7 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-09%20since%3A2023-05-07&src=typed_query&f=live", // BMRI 7-9 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-11%20since%3A2023-05-09&src=typed_query&f=live", // BMRI 9-11 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-13%20since%3A2023-05-11&src=typed_query&f=live", // BMRI 11-13 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-15%20since%3A2023-05-13&src=typed_query&f=live", // BMRI 13-15 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-17%20since%3A2023-05-15&src=typed_query&f=live", // BMRI 15-17 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-19%20since%3A2023-05-17&src=typed_query&f=live", // BMRI 17-19 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-21%20since%3A2023-05-19&src=typed_query&f=live", // BMRI 19-21 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-23%20since%3A2023-05-21&src=typed_query&f=live", // BMRI 21-23 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-25%20since%3A2023-05-23&src=typed_query&f=live", // BMRI 23-25 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-27%20since%3A2023-05-25&src=typed_query&f=live", // BMRI 25-27 Mei 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-27&src=typed_query&f=live", // BMRI 27-31 Mei 2023

    // // juni
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-03%20since%3A2023-06-01&src=typed_query&f=live", // BMRI 1-3 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-05%20since%3A2023-06-03&src=typed_query&f=live", // BMRI 3-5 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-07%20since%3A2023-06-05&src=typed_query&f=live", // BMRI 5-7 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-09%20since%3A2023-06-07&src=typed_query&f=live", // BMRI 7-9 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-11%20since%3A2023-06-09&src=typed_query&f=live", // BMRI 9-11 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-13%20since%3A2023-06-11&src=typed_query&f=live", // BMRI 11-13 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-15%20since%3A2023-06-13&src=typed_query&f=live", // BMRI 13-15 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-17%20since%3A2023-06-15&src=typed_query&f=live", // BMRI 15-17 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-19%20since%3A2023-06-17&src=typed_query&f=live", // BMRI 17-19 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-21%20since%3A2023-06-19&src=typed_query&f=live", // BMRI 19-21 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-23%20since%3A2023-06-21&src=typed_query&f=live", // BMRI 21-23 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-25%20since%3A2023-06-23&src=typed_query&f=live", // BMRI 23-25 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-27%20since%3A2023-06-25&src=typed_query&f=live", // BMRI 25-27 Juni 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-27&src=typed_query&f=live", // BMRI 27-30 Juni 2023

    // // juli
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-03%20since%3A2023-07-01&src=typed_query&f=live", // BMRI 1-3 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-05%20since%3A2023-07-03&src=typed_query&f=live", // BMRI 3-5 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-07%20since%3A2023-07-05&src=typed_query&f=live", // BMRI 5-7 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-09%20since%3A2023-07-07&src=typed_query&f=live", // BMRI 7-9 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-11%20since%3A2023-07-09&src=typed_query&f=live", // BMRI 9-11 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-13%20since%3A2023-07-11&src=typed_query&f=live", // BMRI 11-13 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-15%20since%3A2023-07-13&src=typed_query&f=live", // BMRI 13-15 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-17%20since%3A2023-07-15&src=typed_query&f=live", // BMRI 15-17 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-19%20since%3A2023-07-17&src=typed_query&f=live", // BMRI 17-19 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-21%20since%3A2023-07-19&src=typed_query&f=live", // BMRI 19-21 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-23%20since%3A2023-07-21&src=typed_query&f=live", // BMRI 21-23 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-25%20since%3A2023-07-23&src=typed_query&f=live", // BMRI 23-25 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-27%20since%3A2023-07-25&src=typed_query&f=live", // BMRI 25-27 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-29%20since%3A2023-07-27&src=typed_query&f=live", // BMRI 27-29 Juli 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-29&src=typed_query&f=live", // BMRI 29-31 Juli 2023

    // // agustus
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-03%20since%3A2023-08-01&src=typed_query&f=live", // BMRI 1-3 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-05%20since%3A2023-08-03&src=typed_query&f=live", // BMRI 3-5 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-07%20since%3A2023-08-05&src=typed_query&f=live", // BMRI 5-7 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-09%20since%3A2023-08-07&src=typed_query&f=live", // BMRI 7-9 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-11%20since%3A2023-08-09&src=typed_query&f=live", // BMRI 9-11 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-13%20since%3A2023-08-11&src=typed_query&f=live", // BMRI 11-13 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-15%20since%3A2023-08-13&src=typed_query&f=live", // BMRI 13-15 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-17%20since%3A2023-08-15&src=typed_query&f=live", // BMRI 15-17 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-19%20since%3A2023-08-17&src=typed_query&f=live", // BMRI 17-19 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-21%20since%3A2023-08-19&src=typed_query&f=live", // BMRI 19-21 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-23%20since%3A2023-08-21&src=typed_query&f=live", // BMRI 21-23 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-25%20since%3A2023-08-23&src=typed_query&f=live", // BMRI 23-25 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-27%20since%3A2023-08-25&src=typed_query&f=live", // BMRI 25-27 Agustus 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-08-31%20since%3A2023-08-27&src=typed_query&f=live", // BMRI 27-31 Agustus 2023

    // // september
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-03%20since%3A2023-09-01&src=typed_query&f=live", // BMRI 1-3 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-05%20since%3A2023-09-03&src=typed_query&f=live", // BMRI 3-5 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-07%20since%3A2023-09-05&src=typed_query&f=live", // BMRI 5-7 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-09%20since%3A2023-09-07&src=typed_query&f=live", // BMRI 7-9 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-11%20since%3A2023-09-09&src=typed_query&f=live", // BMRI 9-11 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-13%20since%3A2023-09-11&src=typed_query&f=live", // BMRI 11-13 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-15%20since%3A2023-09-13&src=typed_query&f=live", // BMRI 13-15 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-17%20since%3A2023-09-15&src=typed_query&f=live", // BMRI 15-17 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-19%20since%3A2023-09-17&src=typed_query&f=live", // BMRI 17-19 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-21%20since%3A2023-09-19&src=typed_query&f=live", // BMRI 19-21 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-23%20since%3A2023-09-21&src=typed_query&f=live", // BMRI 21-23 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-25%20since%3A2023-09-23&src=typed_query&f=live", // BMRI 23-25 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-27%20since%3A2023-09-25&src=typed_query&f=live", // BMRI 25-27 September 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-27&src=typed_query&f=live", // BMRI 27-30 September 2023
    
    // // oktober
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-03%20since%3A2023-10-01&src=typed_query&f=live", // BMRI 1-3 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-05%20since%3A2023-10-03&src=typed_query&f=live", // BMRI 3-5 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-07%20since%3A2023-10-05&src=typed_query&f=live", // BMRI 5-7 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-09%20since%3A2023-10-07&src=typed_query&f=live", // BMRI 7-9 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-11%20since%3A2023-10-09&src=typed_query&f=live", // BMRI 9-11 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-13%20since%3A2023-10-11&src=typed_query&f=live", // BMRI 11-13 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-15%20since%3A2023-10-13&src=typed_query&f=live", // BMRI 13-15 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-17%20since%3A2023-10-15&src=typed_query&f=live", // BMRI 15-17 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-19%20since%3A2023-10-17&src=typed_query&f=live", // BMRI 17-19 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-21%20since%3A2023-10-19&src=typed_query&f=live", // BMRI 19-21 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-23%20since%3A2023-10-21&src=typed_query&f=live", // BMRI 21-23 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-25%20since%3A2023-10-23&src=typed_query&f=live", // BMRI 23-25 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-27%20since%3A2023-10-25&src=typed_query&f=live", // BMRI 25-27 Oktober 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-27&src=typed_query&f=live", // BMRI 27-31 Oktober 2023

    // // november
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-03%20since%3A2023-11-01&src=typed_query&f=live", // BMRI 1-3 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-05%20since%3A2023-11-03&src=typed_query&f=live", // BMRI 3-5 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-07%20since%3A2023-11-05&src=typed_query&f=live", // BMRI 5-7 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-09%20since%3A2023-11-07&src=typed_query&f=live", // BMRI 7-9 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-11%20since%3A2023-11-09&src=typed_query&f=live", // BMRI 9-11 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-13%20since%3A2023-11-11&src=typed_query&f=live", // BMRI 11-13 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-15%20since%3A2023-11-13&src=typed_query&f=live", // BMRI 13-15 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-17%20since%3A2023-11-15&src=typed_query&f=live", // BMRI 15-17 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-19%20since%3A2023-11-17&src=typed_query&f=live", // BMRI 17-19 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-21%20since%3A2023-11-19&src=typed_query&f=live", // BMRI 19-21 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-23%20since%3A2023-11-21&src=typed_query&f=live", // BMRI 21-23 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-25%20since%3A2023-11-23&src=typed_query&f=live", // BMRI 23-25 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-27%20since%3A2023-11-25&src=typed_query&f=live", // BMRI 25-27 November 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-27&src=typed_query&f=live", // BMRI 27-30 November 2023

    // // desember
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-03%20since%3A2023-12-01&src=typed_query&f=live", // BMRI 1-3 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-05%20since%3A2023-12-03&src=typed_query&f=live", // BMRI 3-5 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-07%20since%3A2023-12-05&src=typed_query&f=live", // BMRI 5-7 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-09%20since%3A2023-12-07&src=typed_query&f=live", // BMRI 7-9 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-11%20since%3A2023-12-09&src=typed_query&f=live", // BMRI 9-11 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-13%20since%3A2023-12-11&src=typed_query&f=live", // BMRI 11-13 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-15%20since%3A2023-12-13&src=typed_query&f=live", // BMRI 13-15 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-17%20since%3A2023-12-15&src=typed_query&f=live", // BMRI 15-17 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-19%20since%3A2023-12-17&src=typed_query&f=live", // BMRI 17-19 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-21%20since%3A2023-12-19&src=typed_query&f=live", // BMRI 19-21 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-23%20since%3A2023-12-21&src=typed_query&f=live", // BMRI 21-23 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-25%20since%3A2023-12-23&src=typed_query&f=live", // BMRI 23-25 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-27%20since%3A2023-12-25&src=typed_query&f=live", // BMRI 25-27 Desember 2023
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-27&src=typed_query&f=live", // BMRI 27-31 Desember 2023

    // ISAT 2020
    // Kata Kunci: ISAT
    // top
    // // januari 
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-03%20since%3A2020-01-01&src=typed_query", // ISAT 1-3 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-05%20since%3A2020-01-03&src=typed_query", // ISAT 3-5 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-07%20since%3A2020-01-05&src=typed_query", // ISAT 5-7 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-09%20since%3A2020-01-07&src=typed_query", // ISAT 7-9 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-11%20since%3A2020-01-09&src=typed_query", // ISAT 9-11 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-13%20since%3A2020-01-11&src=typed_query", // ISAT 11-13 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-15%20since%3A2020-01-13&src=typed_query", // ISAT 13-15 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-17%20since%3A2020-01-15&src=typed_query", // ISAT 15-17 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-19%20since%3A2020-01-17&src=typed_query", // ISAT 17-19Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-21%20since%3A2020-01-19&src=typed_query", // ISAT 19-21 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-23%20since%3A2020-01-21&src=typed_query", // ISAT 21-23 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-25%20since%3A2020-01-23&src=typed_query", // ISAT 23-25 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-27%20since%3A2020-01-25&src=typed_query", // ISAT 25-27 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-31%20since%3A2020-01-27&src=typed_query", // ISAT 27-31 Januari 2020

    // // februari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-03%20since%3A2020-02-01&src=typed_query", // ISAT 1-3 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-05%20since%3A2020-02-03&src=typed_query", // ISAT 3-5 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-07%20since%3A2020-02-05&src=typed_query", // ISAT 5-7 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-09%20since%3A2020-02-07&src=typed_query", // ISAT 7-9 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-11%20since%3A2020-02-09&src=typed_query", // ISAT 9-11 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-13%20since%3A2020-02-11&src=typed_query", // ISAT 11-13 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-15%20since%3A2020-02-13&src=typed_query", // ISAT 13-15 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-17%20since%3A2020-02-15&src=typed_query", // ISAT 15-17 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-19%20since%3A2020-02-17&src=typed_query", // ISAT 17-19Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-21%20since%3A2020-02-19&src=typed_query", // ISAT 19-21 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-23%20since%3A2020-02-21&src=typed_query", // ISAT 21-23 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-25%20since%3A2020-02-23&src=typed_query", // ISAT 23-25 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-27%20since%3A2020-02-25&src=typed_query", // ISAT 25-27 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-28%20since%3A2020-02-27&src=typed_query", // ISAT 27-28 Januari 2020

    // // maret
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-03%20since%3A2020-03-01&src=typed_query", // ISAT 1-3 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-05%20since%3A2020-03-03&src=typed_query", // ISAT 3-5 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-07%20since%3A2020-03-05&src=typed_query", // ISAT 5-7 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-09%20since%3A2020-03-07&src=typed_query", // ISAT 7-9 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-11%20since%3A2020-03-09&src=typed_query", // ISAT 9-11 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-13%20since%3A2020-03-11&src=typed_query", // ISAT 11-13 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-15%20since%3A2020-03-13&src=typed_query", // ISAT 13-15 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-17%20since%3A2020-03-15&src=typed_query", // ISAT 15-17 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-19%20since%3A2020-03-17&src=typed_query", // ISAT 17-19 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-21%20since%3A2020-03-19&src=typed_query", // ISAT 19-21 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-23%20since%3A2020-03-21&src=typed_query", // ISAT 21-23 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-25%20since%3A2020-03-23&src=typed_query", // ISAT 23-25 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-27%20since%3A2020-03-25&src=typed_query", // ISAT 25-27 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-31%20since%3A2020-03-27&src=typed_query", // ISAT 27-31 Maret 2020

    // // april
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-03%20since%3A2020-04-01&src=typed_query", // ISAT 1-3 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-05%20since%3A2020-04-03&src=typed_query", // ISAT 3-5 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-07%20since%3A2020-04-05&src=typed_query", // ISAT 5-7 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-09%20since%3A2020-04-07&src=typed_query", // ISAT 7-9 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-11%20since%3A2020-04-09&src=typed_query", // ISAT 9-11 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-13%20since%3A2020-04-11&src=typed_query", // ISAT 11-13 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-15%20since%3A2020-04-13&src=typed_query", // ISAT 13-15 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-17%20since%3A2020-04-15&src=typed_query", // ISAT 15-17 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-19%20since%3A2020-04-17&src=typed_query", // ISAT 17-19 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-21%20since%3A2020-04-19&src=typed_query", // ISAT 19-21 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-23%20since%3A2020-04-21&src=typed_query", // ISAT 21-23 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-25%20since%3A2020-04-23&src=typed_query", // ISAT 23-25 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-27%20since%3A2020-04-25&src=typed_query", // ISAT 25-27 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-30%20since%3A2020-04-27&src=typed_query", // ISAT 27-30 April 2020

    // // mei
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-03%20since%3A2020-05-01&src=typed_query", // ISAT 1-3 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-05%20since%3A2020-05-03&src=typed_query", // ISAT 3-5 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-07%20since%3A2020-05-05&src=typed_query", // ISAT 5-7 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-09%20since%3A2020-05-07&src=typed_query", // ISAT 7-9 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-11%20since%3A2020-05-09&src=typed_query", // ISAT 9-11 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-13%20since%3A2020-05-11&src=typed_query", // ISAT 11-13 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-15%20since%3A2020-05-13&src=typed_query", // ISAT 13-15 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-17%20since%3A2020-05-15&src=typed_query", // ISAT 15-17 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-19%20since%3A2020-05-17&src=typed_query", // ISAT 17-19 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-21%20since%3A2020-05-19&src=typed_query", // ISAT 19-21 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-23%20since%3A2020-05-21&src=typed_query", // ISAT 21-23 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-25%20since%3A2020-05-23&src=typed_query", // ISAT 23-25 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-27%20since%3A2020-05-25&src=typed_query", // ISAT 25-27 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-31%20since%3A2020-05-27&src=typed_query", // ISAT 27-31 Mei 2020

    // // juni
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-03%20since%3A2020-06-01&src=typed_query", // ISAT 1-3 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-05%20since%3A2020-06-03&src=typed_query", // ISAT 3-5 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-07%20since%3A2020-06-05&src=typed_query", // ISAT 5-7 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-09%20since%3A2020-06-07&src=typed_query", // ISAT 7-9 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-11%20since%3A2020-06-09&src=typed_query", // ISAT 9-11 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-13%20since%3A2020-06-11&src=typed_query", // ISAT 11-13 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-15%20since%3A2020-06-13&src=typed_query", // ISAT 13-15 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-17%20since%3A2020-06-15&src=typed_query", // ISAT 15-17 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-19%20since%3A2020-06-17&src=typed_query", // ISAT 17-19 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-21%20since%3A2020-06-19&src=typed_query", // ISAT 19-21 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-23%20since%3A2020-06-21&src=typed_query", // ISAT 21-23 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-25%20since%3A2020-06-23&src=typed_query", // ISAT 23-25 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-27%20since%3A2020-06-25&src=typed_query", // ISAT 25-27 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-06-27&src=typed_query", // ISAT 27-30 Juni 2020

    // // juli
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-03%20since%3A2020-07-01&src=typed_query", // ISAT 1-3 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-05%20since%3A2020-07-03&src=typed_query", // ISAT 3-5 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-07%20since%3A2020-07-05&src=typed_query", // ISAT 5-7 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-09%20since%3A2020-07-07&src=typed_query", // ISAT 7-9 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-11%20since%3A2020-07-09&src=typed_query", // ISAT 9-11 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-13%20since%3A2020-07-11&src=typed_query", // ISAT 11-13 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-15%20since%3A2020-07-13&src=typed_query", // ISAT 13-15 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-17%20since%3A2020-07-15&src=typed_query", // ISAT 15-17 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-19%20since%3A2020-07-17&src=typed_query", // ISAT 17-19 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-21%20since%3A2020-07-19&src=typed_query", // ISAT 19-21 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-23%20since%3A2020-07-21&src=typed_query", // ISAT 21-23 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-25%20since%3A2020-07-23&src=typed_query", // ISAT 23-25 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-27%20since%3A2020-07-25&src=typed_query", // ISAT 25-27 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-31%20since%3A2020-07-27&src=typed_query", // ISAT 27-31 Juli 2020

    // // agustus
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-03%20since%3A2020-08-01&src=typed_query", // ISAT 1-3 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-05%20since%3A2020-08-03&src=typed_query", // ISAT 3-5 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-07%20since%3A2020-08-05&src=typed_query", // ISAT 5-7 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-09%20since%3A2020-08-07&src=typed_query", // ISAT 7-9 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-11%20since%3A2020-08-09&src=typed_query", // ISAT 9-11 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-13%20since%3A2020-08-11&src=typed_query", // ISAT 11-13 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-15%20since%3A2020-08-13&src=typed_query", // ISAT 13-15 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-17%20since%3A2020-08-15&src=typed_query", // ISAT 15-17 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-19%20since%3A2020-08-17&src=typed_query", // ISAT 17-19 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-21%20since%3A2020-08-19&src=typed_query", // ISAT 19-21 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-23%20since%3A2020-08-21&src=typed_query", // ISAT 21-23 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-25%20since%3A2020-08-23&src=typed_query", // ISAT 23-25 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-27%20since%3A2020-08-25&src=typed_query", // ISAT 25-27 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-31%20since%3A2020-08-27&src=typed_query", // ISAT 27-31 Agustus 2020

    // // september
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-03%20since%3A2020-09-01&src=typed_query", // ISAT 1-3 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-05%20since%3A2020-09-03&src=typed_query", // ISAT 3-5 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-07%20since%3A2020-09-05&src=typed_query", // ISAT 5-7 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-09%20since%3A2020-09-07&src=typed_query", // ISAT 7-9 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-11%20since%3A2020-09-09&src=typed_query", // ISAT 9-11 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-13%20since%3A2020-09-11&src=typed_query", // ISAT 11-13 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-15%20since%3A2020-09-13&src=typed_query", // ISAT 13-15 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-17%20since%3A2020-09-15&src=typed_query", // ISAT 15-17 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-19%20since%3A2020-09-17&src=typed_query", // ISAT 17-19 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-21%20since%3A2020-09-19&src=typed_query", // ISAT 19-21 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-23%20since%3A2020-09-21&src=typed_query", // ISAT 21-23 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-25%20since%3A2020-09-23&src=typed_query", // ISAT 23-25 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-27%20since%3A2020-09-25&src=typed_query", // ISAT 25-27 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-30%20since%3A2020-09-27&src=typed_query", // ISAT 27-30 September 2020

    // // oktober
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-03%20since%3A2020-10-01&src=typed_query", // ISAT 1-3 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-05%20since%3A2020-10-03&src=typed_query", // ISAT 3-5 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-07%20since%3A2020-10-05&src=typed_query", // ISAT 5-7 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-09%20since%3A2020-10-07&src=typed_query", // ISAT 7-9 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-11%20since%3A2020-10-09&src=typed_query", // ISAT 9-11 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-13%20since%3A2020-10-11&src=typed_query", // ISAT 11-13 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-15%20since%3A2020-10-13&src=typed_query", // ISAT 13-15 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-17%20since%3A2020-10-15&src=typed_query", // ISAT 15-17 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-19%20since%3A2020-10-17&src=typed_query", // ISAT 17-19 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-21%20since%3A2020-10-19&src=typed_query", // ISAT 19-21 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-23%20since%3A2020-10-21&src=typed_query", // ISAT 21-23 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-25%20since%3A2020-10-23&src=typed_query", // ISAT 23-25 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-27%20since%3A2020-10-25&src=typed_query", // ISAT 25-27 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-31%20since%3A2020-10-27&src=typed_query", // ISAT 27-31 Oktober 2020

    // // november
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-03%20since%3A2020-11-01&src=typed_query", // ISAT 1-3 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-05%20since%3A2020-11-03&src=typed_query", // ISAT 3-5 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-07%20since%3A2020-11-05&src=typed_query", // ISAT 5-7 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-09%20since%3A2020-11-07&src=typed_query", // ISAT 7-9 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-11%20since%3A2020-11-09&src=typed_query", // ISAT 9-11 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-13%20since%3A2020-11-11&src=typed_query", // ISAT 11-13 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-15%20since%3A2020-11-13&src=typed_query", // ISAT 13-15 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-17%20since%3A2020-11-15&src=typed_query", // ISAT 15-17 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-19%20since%3A2020-11-17&src=typed_query", // ISAT 17-19 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-21%20since%3A2020-11-19&src=typed_query", // ISAT 19-21 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-23%20since%3A2020-11-21&src=typed_query", // ISAT 21-23 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-25%20since%3A2020-11-23&src=typed_query", // ISAT 23-25 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-27%20since%3A2020-11-25&src=typed_query", // ISAT 25-27 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-30%20since%3A2020-11-27&src=typed_query", // ISAT 27-30 November 2020

    // // desember
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-03%20since%3A2020-12-01&src=typed_query", // ISAT 1-3 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-05%20since%3A2020-12-03&src=typed_query", // ISAT 3-5 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-07%20since%3A2020-12-05&src=typed_query", // ISAT 5-7 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-09%20since%3A2020-12-07&src=typed_query", // ISAT 7-9 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-11%20since%3A2020-12-09&src=typed_query", // ISAT 9-11 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-13%20since%3A2020-12-11&src=typed_query", // ISAT 11-13 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-15%20since%3A2020-12-13&src=typed_query", // ISAT 13-15 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-17%20since%3A2020-12-15&src=typed_query", // ISAT 15-17 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-19%20since%3A2020-12-17&src=typed_query", // ISAT 17-19 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-21%20since%3A2020-12-19&src=typed_query", // ISAT 19-21 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-23%20since%3A2020-12-21&src=typed_query", // ISAT 21-23 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-25%20since%3A2020-12-23&src=typed_query", // ISAT 23-25 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-27%20since%3A2020-12-25&src=typed_query", // ISAT 25-27 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-12-27&src=typed_query", // ISAT 27-31 Desember 2020

    // // latest
    // // januari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-03%20since%3A2020-01-01&src=typed_query&f=live", // ISAT 1-3 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-05%20since%3A2020-01-03&src=typed_query&f=live", // ISAT 3-5 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-07%20since%3A2020-01-05&src=typed_query&f=live", // ISAT 5-7 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-09%20since%3A2020-01-07&src=typed_query&f=live", // ISAT 7-9 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-11%20since%3A2020-01-09&src=typed_query&f=live", // ISAT 9-11 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-13%20since%3A2020-01-11&src=typed_query&f=live", // ISAT 11-13 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-15%20since%3A2020-01-13&src=typed_query&f=live", // ISAT 13-15 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-17%20since%3A2020-01-15&src=typed_query&f=live", // ISAT 15-17 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-19%20since%3A2020-01-17&src=typed_query&f=live", // ISAT 17-19 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-21%20since%3A2020-01-19&src=typed_query&f=live", // ISAT 19-21 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-23%20since%3A2020-01-21&src=typed_query&f=live", // ISAT 21-23 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-25%20since%3A2020-01-23&src=typed_query&f=live", // ISAT 23-25 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-27%20since%3A2020-01-25&src=typed_query&f=live", // ISAT 25-27 Januari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-01-31%20since%3A2020-01-27&src=typed_query&f=live", // ISAT 27-31 Januari 2020

    // // februari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-03%20since%3A2020-02-01&src=typed_query&f=live", // ISAT 1-3 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-05%20since%3A2020-02-03&src=typed_query&f=live", // ISAT 3-5 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-07%20since%3A2020-02-05&src=typed_query&f=live", // ISAT 5-7 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-09%20since%3A2020-02-07&src=typed_query&f=live", // ISAT 7-9 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-11%20since%3A2020-02-09&src=typed_query&f=live", // ISAT 9-11 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-13%20since%3A2020-02-11&src=typed_query&f=live", // ISAT 11-13 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-15%20since%3A2020-02-13&src=typed_query&f=live", // ISAT 13-15 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-17%20since%3A2020-02-15&src=typed_query&f=live", // ISAT 15-17 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-19%20since%3A2020-02-17&src=typed_query&f=live", // ISAT 17-19 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-21%20since%3A2020-02-19&src=typed_query&f=live", // ISAT 19-21 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-23%20since%3A2020-02-21&src=typed_query&f=live", // ISAT 21-23 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-25%20since%3A2020-02-23&src=typed_query&f=live", // ISAT 23-25 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-27%20since%3A2020-02-25&src=typed_query&f=live", // ISAT 25-27 Februari 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-02-28%20since%3A2020-02-27&src=typed_query&f=live", // ISAT 27-28 Februari 2020

    // // maret
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-03%20since%3A2020-03-01&src=typed_query&f=live", // ISAT 1-3 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-05%20since%3A2020-03-03&src=typed_query&f=live", // ISAT 3-5 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-07%20since%3A2020-03-05&src=typed_query&f=live", // ISAT 5-7 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-09%20since%3A2020-03-07&src=typed_query&f=live", // ISAT 7-9 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-11%20since%3A2020-03-09&src=typed_query&f=live", // ISAT 9-11 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-13%20since%3A2020-03-11&src=typed_query&f=live", // ISAT 11-13 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-15%20since%3A2020-03-13&src=typed_query&f=live", // ISAT 13-15 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-17%20since%3A2020-03-15&src=typed_query&f=live", // ISAT 15-17 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-19%20since%3A2020-03-17&src=typed_query&f=live", // ISAT 17-19 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-21%20since%3A2020-03-19&src=typed_query&f=live", // ISAT 19-21 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-23%20since%3A2020-03-21&src=typed_query&f=live", // ISAT 21-23 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-25%20since%3A2020-03-23&src=typed_query&f=live", // ISAT 23-25 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-27%20since%3A2020-03-25&src=typed_query&f=live", // ISAT 25-27 Maret 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-03-31%20since%3A2020-03-27&src=typed_query&f=live", // ISAT 27-31 Maret 2020

    // // april
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-03%20since%3A2020-04-01&src=typed_query&f=live", // ISAT 1-3 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-05%20since%3A2020-04-03&src=typed_query&f=live", // ISAT 3-5 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-07%20since%3A2020-04-05&src=typed_query&f=live", // ISAT 5-7 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-09%20since%3A2020-04-07&src=typed_query&f=live", // ISAT 7-9 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-11%20since%3A2020-04-09&src=typed_query&f=live", // ISAT 9-11 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-13%20since%3A2020-04-11&src=typed_query&f=live", // ISAT 11-13 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-15%20since%3A2020-04-13&src=typed_query&f=live", // ISAT 13-15 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-17%20since%3A2020-04-15&src=typed_query&f=live", // ISAT 15-17 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-19%20since%3A2020-04-17&src=typed_query&f=live", // ISAT 17-19 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-21%20since%3A2020-04-19&src=typed_query&f=live", // ISAT 19-21 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-23%20since%3A2020-04-21&src=typed_query&f=live", // ISAT 21-23 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-25%20since%3A2020-04-23&src=typed_query&f=live", // ISAT 23-25 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-27%20since%3A2020-04-25&src=typed_query&f=live", // ISAT 25-27 April 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-04-30%20since%3A2020-04-27&src=typed_query&f=live", // ISAT 27-30 April 2020

    // // mei
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-03%20since%3A2020-05-01&src=typed_query&f=live", // ISAT 1-3 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-05%20since%3A2020-05-03&src=typed_query&f=live", // ISAT 3-5 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-07%20since%3A2020-05-05&src=typed_query&f=live", // ISAT 5-7 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-09%20since%3A2020-05-07&src=typed_query&f=live", // ISAT 7-9 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-11%20since%3A2020-05-09&src=typed_query&f=live", // ISAT 9-11 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-13%20since%3A2020-05-11&src=typed_query&f=live", // ISAT 11-13 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-15%20since%3A2020-05-13&src=typed_query&f=live", // ISAT 13-15 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-17%20since%3A2020-05-15&src=typed_query&f=live", // ISAT 15-17 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-19%20since%3A2020-05-17&src=typed_query&f=live", // ISAT 17-19 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-21%20since%3A2020-05-19&src=typed_query&f=live", // ISAT 19-21 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-23%20since%3A2020-05-21&src=typed_query&f=live", // ISAT 21-23 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-25%20since%3A2020-05-23&src=typed_query&f=live", // ISAT 23-25 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-27%20since%3A2020-05-25&src=typed_query&f=live", // ISAT 25-27 Mei 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-05-31%20since%3A2020-05-27&src=typed_query&f=live", // ISAT 27-31 Mei 2020

    // // juni
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-03%20since%3A2020-06-01&src=typed_query&f=live", // ISAT 1-3 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-05%20since%3A2020-06-03&src=typed_query&f=live", // ISAT 3-5 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-07%20since%3A2020-06-05&src=typed_query&f=live", // ISAT 5-7 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-09%20since%3A2020-06-07&src=typed_query&f=live", // ISAT 7-9 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-11%20since%3A2020-06-09&src=typed_query&f=live", // ISAT 9-11 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-13%20since%3A2020-06-11&src=typed_query&f=live", // ISAT 11-13 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-15%20since%3A2020-06-13&src=typed_query&f=live", // ISAT 13-15 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-17%20since%3A2020-06-15&src=typed_query&f=live", // ISAT 15-17 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-19%20since%3A2020-06-17&src=typed_query&f=live", // ISAT 17-19 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-21%20since%3A2020-06-19&src=typed_query&f=live", // ISAT 19-21 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-23%20since%3A2020-06-21&src=typed_query&f=live", // ISAT 21-23 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-25%20since%3A2020-06-23&src=typed_query&f=live", // ISAT 23-25 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-27%20since%3A2020-06-25&src=typed_query&f=live", // ISAT 25-27 Juni 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-06-27&src=typed_query&f=live", // ISAT 27-30 Juni 2020

    // // juli
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-03%20since%3A2020-07-01&src=typed_query&f=live", // ISAT 1-3 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-05%20since%3A2020-07-03&src=typed_query&f=live", // ISAT 3-5 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-07%20since%3A2020-07-05&src=typed_query&f=live", // ISAT 5-7 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-09%20since%3A2020-07-07&src=typed_query&f=live", // ISAT 7-9 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-11%20since%3A2020-07-09&src=typed_query&f=live", // ISAT 9-11 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-13%20since%3A2020-07-11&src=typed_query&f=live", // ISAT 11-13 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-15%20since%3A2020-07-13&src=typed_query&f=live", // ISAT 13-15 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-17%20since%3A2020-07-15&src=typed_query&f=live", // ISAT 15-17 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-19%20since%3A2020-07-17&src=typed_query&f=live", // ISAT 17-19 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-21%20since%3A2020-07-19&src=typed_query&f=live", // ISAT 19-21 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-23%20since%3A2020-07-21&src=typed_query&f=live", // ISAT 21-23 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-25%20since%3A2020-07-23&src=typed_query&f=live", // ISAT 23-25 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-27%20since%3A2020-07-25&src=typed_query&f=live", // ISAT 25-27 Juli 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-07-31%20since%3A2020-07-27&src=typed_query&f=live", // ISAT 27-31 Juli 2020

    // // agustus
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-03%20since%3A2020-08-01&src=typed_query&f=live", // ISAT 1-3 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-05%20since%3A2020-08-03&src=typed_query&f=live", // ISAT 3-5 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-07%20since%3A2020-08-05&src=typed_query&f=live", // ISAT 5-7 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-09%20since%3A2020-08-07&src=typed_query&f=live", // ISAT 7-9 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-11%20since%3A2020-08-09&src=typed_query&f=live", // ISAT 9-11 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-13%20since%3A2020-08-11&src=typed_query&f=live", // ISAT 11-13 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-15%20since%3A2020-08-13&src=typed_query&f=live", // ISAT 13-15 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-17%20since%3A2020-08-15&src=typed_query&f=live", // ISAT 15-17 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-19%20since%3A2020-08-17&src=typed_query&f=live", // ISAT 17-19 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-21%20since%3A2020-08-19&src=typed_query&f=live", // ISAT 19-21 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-23%20since%3A2020-08-21&src=typed_query&f=live", // ISAT 21-23 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-25%20since%3A2020-08-23&src=typed_query&f=live", // ISAT 23-25 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-27%20since%3A2020-08-25&src=typed_query&f=live", // ISAT 25-27 Agustus 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-08-30%20since%3A2020-08-27&src=typed_query&f=live", // ISAT 27-30 Agustus 2020

    // // september
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-03%20since%3A2020-09-01&src=typed_query&f=live", // ISAT 1-3 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-05%20since%3A2020-09-03&src=typed_query&f=live", // ISAT 3-5 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-07%20since%3A2020-09-05&src=typed_query&f=live", // ISAT 5-7 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-09%20since%3A2020-09-07&src=typed_query&f=live", // ISAT 7-9 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-11%20since%3A2020-09-09&src=typed_query&f=live", // ISAT 9-11 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-13%20since%3A2020-09-11&src=typed_query&f=live", // ISAT 11-13 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-15%20since%3A2020-09-13&src=typed_query&f=live", // ISAT 13-15 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-17%20since%3A2020-09-15&src=typed_query&f=live", // ISAT 15-17 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-19%20since%3A2020-09-17&src=typed_query&f=live", // ISAT 17-19 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-21%20since%3A2020-09-19&src=typed_query&f=live", // ISAT 19-21 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-23%20since%3A2020-09-21&src=typed_query&f=live", // ISAT 21-23 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-25%20since%3A2020-09-23&src=typed_query&f=live", // ISAT 23-25 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-27%20since%3A2020-09-25&src=typed_query&f=live", // ISAT 25-27 September 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-09-30%20since%3A2020-09-27&src=typed_query&f=live", // ISAT 27-30 September 2020

    // // oktober
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-03%20since%3A2020-10-01&src=typed_query&f=live", // ISAT 1-3 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-05%20since%3A2020-10-03&src=typed_query&f=live", // ISAT 3-5 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-07%20since%3A2020-10-05&src=typed_query&f=live", // ISAT 5-7 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-09%20since%3A2020-10-07&src=typed_query&f=live", // ISAT 7-9 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-11%20since%3A2020-10-09&src=typed_query&f=live", // ISAT 9-11 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-13%20since%3A2020-10-11&src=typed_query&f=live", // ISAT 11-13 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-15%20since%3A2020-10-13&src=typed_query&f=live", // ISAT 13-15 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-17%20since%3A2020-10-15&src=typed_query&f=live", // ISAT 15-17 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-19%20since%3A2020-10-17&src=typed_query&f=live", // ISAT 17-19 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-21%20since%3A2020-10-19&src=typed_query&f=live", // ISAT 19-21 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-23%20since%3A2020-10-21&src=typed_query&f=live", // ISAT 21-23 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-25%20since%3A2020-10-23&src=typed_query&f=live", // ISAT 23-25 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-27%20since%3A2020-10-25&src=typed_query&f=live", // ISAT 25-27 Oktober 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-10-31%20since%3A2020-10-27&src=typed_query&f=live", // ISAT 27-31 Oktober 2020

    // // november
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-03%20since%3A2020-11-01&src=typed_query&f=live", // ISAT 1-3 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-05%20since%3A2020-11-03&src=typed_query&f=live", // ISAT 3-5 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-07%20since%3A2020-11-05&src=typed_query&f=live", // ISAT 5-7 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-09%20since%3A2020-11-07&src=typed_query&f=live", // ISAT 7-9 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-11%20since%3A2020-11-09&src=typed_query&f=live", // ISAT 9-11 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-13%20since%3A2020-11-11&src=typed_query&f=live", // ISAT 11-13 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-15%20since%3A2020-11-13&src=typed_query&f=live", // ISAT 13-15 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-17%20since%3A2020-11-15&src=typed_query&f=live", // ISAT 15-17 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-19%20since%3A2020-11-17&src=typed_query&f=live", // ISAT 17-19 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-21%20since%3A2020-11-19&src=typed_query&f=live", // ISAT 19-21 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-23%20since%3A2020-11-21&src=typed_query&f=live", // ISAT 21-23 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-25%20since%3A2020-11-23&src=typed_query&f=live", // ISAT 23-25 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-27%20since%3A2020-11-25&src=typed_query&f=live", // ISAT 25-27 November 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-11-30%20since%3A2020-11-27&src=typed_query&f=live", // ISAT 27-30 November 2020

    // // desember
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-03%20since%3A2020-12-01&src=typed_query&f=live", // ISAT 1-3 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-05%20since%3A2020-12-03&src=typed_query&f=live", // ISAT 3-5 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-07%20since%3A2020-12-05&src=typed_query&f=live", // ISAT 5-7 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-09%20since%3A2020-12-07&src=typed_query&f=live", // ISAT 7-9 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-11%20since%3A2020-12-09&src=typed_query&f=live", // ISAT 9-11 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-13%20since%3A2020-12-11&src=typed_query&f=live", // ISAT 11-13 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-15%20since%3A2020-12-13&src=typed_query&f=live", // ISAT 13-15 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-17%20since%3A2020-12-15&src=typed_query&f=live", // ISAT 15-17 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-19%20since%3A2020-12-17&src=typed_query&f=live", // ISAT 17-19 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-21%20since%3A2020-12-19&src=typed_query&f=live", // ISAT 19-21 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-23%20since%3A2020-12-21&src=typed_query&f=live", // ISAT 21-23 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-25%20since%3A2020-12-23&src=typed_query&f=live", // ISAT 23-25 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-27%20since%3A2020-12-25&src=typed_query&f=live", // ISAT 25-27 Desember 2020
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-12-27&src=typed_query&f=live", // ISAT 27-31 Desember 2020

    // Kata Kunci: #ISAT
    // // top
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-01-31%20since%3A2020-01-01&src=typed_query", // ISAT Januari 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-02-28%20since%3A2020-02-01&src=typed_query", // ISAT Februari 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-03-31%20since%3A2020-03-01&src=typed_query", // ISAT Maret 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-04-30%20since%3A2020-04-01&src=typed_query", // ISAT April 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-05-31%20since%3A2020-05-01&src=typed_query", // ISAT Mei 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-06-01&src=typed_query", // ISAT Juni 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-07-31%20since%3A2020-07-01&src=typed_query", // ISAT Juli 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-08-31%20since%3A2020-08-01&src=typed_query", // ISAT Agustus 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-09-30%20since%3A2020-09-01&src=typed_query", // ISAT September 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-10-31%20since%3A2020-10-01&src=typed_query", // ISAT Oktober 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-11-30%20since%3A2020-11-01&src=typed_query", // ISAT November 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-12-01&src=typed_query", // ISAT Desember 2020

    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-01-01&src=typed_query", // ISAT sejak Januari 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-02-01&src=typed_query", // ISAT sejak Februari 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-03-01&src=typed_query", // ISAT sejak Maret 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-04-01&src=typed_query", // ISAT sejak April 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-05-01&src=typed_query", // ISAT sejak Mei 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-06-01&src=typed_query", // ISAT sejak Juni 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-07-01&src=typed_query", // ISAT sejak Juli 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-08-01&src=typed_query", // ISAT sejak Agustus 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-09-01&src=typed_query", // ISAT sejak September 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-10-01&src=typed_query", // ISAT sejak Oktober 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-11-01&src=typed_query", // ISAT sejak November 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2020-12-01&src=typed_query", // ISAT sejak Desember 2020

    // latest
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-01-31%20since%3A2020-01-01&src=typed_query&f=live", // ISAT Januari 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-02-28%20since%3A2020-02-01&src=typed_query&f=live", // ISAT Februari 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-03-31%20since%3A2020-03-01&src=typed_query&f=live", // ISAT Maret 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-04-30%20since%3A2020-04-01&src=typed_query&f=live", // ISAT April 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-05-31%20since%3A2020-05-01&src=typed_query&f=live", // ISAT Mei 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-06-01&src=typed_query&f=live", // ISAT Juni 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-07-31%20since%3A2020-07-01&src=typed_query&f=live", // ISAT Juli 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-08-31%20since%3A2020-08-01&src=typed_query&f=live", // ISAT Agustus 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-09-30%20since%3A2020-09-01&src=typed_query&f=live", // ISAT September 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-10-31%20since%3A2020-10-01&src=typed_query&f=live", // ISAT Oktober 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-11-30%20since%3A2020-11-01&src=typed_query&f=live", // ISAT November 2020
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-12-01&src=typed_query&f=live", // ISAT Desember 2020

    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-02-28%20since%3A2020-02-01&src=typed_query&f=live", // ISAT Februari 2020
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-03-31%20since%3A2020-03-01&src=typed_query&f=live", // ISAT Maret 2020
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-04-30%20since%3A2020-04-01&src=typed_query&f=live", // ISAT April 2020
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-05-31%20since%3A2020-05-01&src=typed_query&f=live", // ISAT Mei 2020
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-06-01&src=typed_query&f=live", // ISAT Juni 2020
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-07-31%20since%3A2020-07-01&src=typed_query&f=live", // ISAT Juli 2020
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-08-31%20since%3A2020-08-01&src=typed_query&f=live", // ISAT Agustus 2020
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-09-30%20since%3A2020-09-01&src=typed_query&f=live", // ISAT September 2020
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-10-31%20since%3A2020-10-01&src=typed_query&f=live", // ISAT Oktober 2020
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-11-30%20since%3A2020-11-01&src=typed_query&f=live", // ISAT November 2020
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-12-01&src=typed_query&f=live", // ISAT Desember 2020

    // ISAT 2024
    // Kata Kunci: ISAT
    // top
    // januari 
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-03%20since%3A2024-01-01&src=typed_query", // ISAT 1-3 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-05%20since%3A2024-01-03&src=typed_query", // ISAT 3-5 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-07%20since%3A2024-01-05&src=typed_query", // ISAT 5-7 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-09%20since%3A2024-01-07&src=typed_query", // ISAT 7-9 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-11%20since%3A2024-01-09&src=typed_query", // ISAT 9-11 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-13%20since%3A2024-01-11&src=typed_query", // ISAT 11-13 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-15%20since%3A2024-01-13&src=typed_query", // ISAT 13-15 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-17%20since%3A2024-01-15&src=typed_query", // ISAT 15-17 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-19%20since%3A2024-01-17&src=typed_query", // ISAT 17-19Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-21%20since%3A2024-01-19&src=typed_query", // ISAT 19-21 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-23%20since%3A2024-01-21&src=typed_query", // ISAT 21-23 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-25%20since%3A2024-01-23&src=typed_query", // ISAT 23-25 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-27%20since%3A2024-01-25&src=typed_query", // ISAT 25-27 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-31%20since%3A2024-01-27&src=typed_query", // ISAT 27-31 Januari 2024

    // // februari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-03%20since%3A2024-02-01&src=typed_query", // ISAT 1-3 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-05%20since%3A2024-02-03&src=typed_query", // ISAT 3-5 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-07%20since%3A2024-02-05&src=typed_query", // ISAT 5-7 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-09%20since%3A2024-02-07&src=typed_query", // ISAT 7-9 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-11%20since%3A2024-02-09&src=typed_query", // ISAT 9-11 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-13%20since%3A2024-02-11&src=typed_query", // ISAT 11-13 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-15%20since%3A2024-02-13&src=typed_query", // ISAT 13-15 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-17%20since%3A2024-02-15&src=typed_query", // ISAT 15-17 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-19%20since%3A2024-02-17&src=typed_query", // ISAT 17-19Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-21%20since%3A2024-02-19&src=typed_query", // ISAT 19-21 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-23%20since%3A2024-02-21&src=typed_query", // ISAT 21-23 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-25%20since%3A2024-02-23&src=typed_query", // ISAT 23-25 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-27%20since%3A2024-02-25&src=typed_query", // ISAT 25-27 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-28%20since%3A2024-02-27&src=typed_query", // ISAT 27-28 Januari 2024

    // // maret
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-03%20since%3A2024-03-01&src=typed_query", // ISAT 1-3 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-05%20since%3A2024-03-03&src=typed_query", // ISAT 3-5 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-07%20since%3A2024-03-05&src=typed_query", // ISAT 5-7 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-09%20since%3A2024-03-07&src=typed_query", // ISAT 7-9 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-11%20since%3A2024-03-09&src=typed_query", // ISAT 9-11 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-13%20since%3A2024-03-11&src=typed_query", // ISAT 11-13 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-15%20since%3A2024-03-13&src=typed_query", // ISAT 13-15 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-17%20since%3A2024-03-15&src=typed_query", // ISAT 15-17 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-19%20since%3A2024-03-17&src=typed_query", // ISAT 17-19 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-21%20since%3A2024-03-19&src=typed_query", // ISAT 19-21 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-23%20since%3A2024-03-21&src=typed_query", // ISAT 21-23 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-25%20since%3A2024-03-23&src=typed_query", // ISAT 23-25 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-27%20since%3A2024-03-25&src=typed_query", // ISAT 25-27 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-31%20since%3A2024-03-27&src=typed_query", // ISAT 27-31 Maret 2024

    // // april
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-03%20since%3A2024-04-01&src=typed_query", // ISAT 1-3 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-05%20since%3A2024-04-03&src=typed_query", // ISAT 3-5 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-07%20since%3A2024-04-05&src=typed_query", // ISAT 5-7 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-09%20since%3A2024-04-07&src=typed_query", // ISAT 7-9 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-11%20since%3A2024-04-09&src=typed_query", // ISAT 9-11 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-13%20since%3A2024-04-11&src=typed_query", // ISAT 11-13 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-15%20since%3A2024-04-13&src=typed_query", // ISAT 13-15 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-17%20since%3A2024-04-15&src=typed_query", // ISAT 15-17 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-19%20since%3A2024-04-17&src=typed_query", // ISAT 17-19 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-21%20since%3A2024-04-19&src=typed_query", // ISAT 19-21 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-23%20since%3A2024-04-21&src=typed_query", // ISAT 21-23 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-25%20since%3A2024-04-23&src=typed_query", // ISAT 23-25 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-27%20since%3A2024-04-25&src=typed_query", // ISAT 25-27 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-30%20since%3A2024-04-27&src=typed_query", // ISAT 27-30 April 2024

    // // mei
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-03%20since%3A2024-05-01&src=typed_query", // ISAT 1-3 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-05%20since%3A2024-05-03&src=typed_query", // ISAT 3-5 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-07%20since%3A2024-05-05&src=typed_query", // ISAT 5-7 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-09%20since%3A2024-05-07&src=typed_query", // ISAT 7-9 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-11%20since%3A2024-05-09&src=typed_query", // ISAT 9-11 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-13%20since%3A2024-05-11&src=typed_query", // ISAT 11-13 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-15%20since%3A2024-05-13&src=typed_query", // ISAT 13-15 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-17%20since%3A2024-05-15&src=typed_query", // ISAT 15-17 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-19%20since%3A2024-05-17&src=typed_query", // ISAT 17-19 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-21%20since%3A2024-05-19&src=typed_query", // ISAT 19-21 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-23%20since%3A2024-05-21&src=typed_query", // ISAT 21-23 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-25%20since%3A2024-05-23&src=typed_query", // ISAT 23-25 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-27%20since%3A2024-05-25&src=typed_query", // ISAT 25-27 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-31%20since%3A2024-05-27&src=typed_query", // ISAT 27-31 Mei 2024

    // // juni
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-03%20since%3A2024-06-01&src=typed_query", // ISAT 1-3 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-05%20since%3A2024-06-03&src=typed_query", // ISAT 3-5 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-07%20since%3A2024-06-05&src=typed_query", // ISAT 5-7 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-09%20since%3A2024-06-07&src=typed_query", // ISAT 7-9 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-11%20since%3A2024-06-09&src=typed_query", // ISAT 9-11 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-13%20since%3A2024-06-11&src=typed_query", // ISAT 11-13 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-15%20since%3A2024-06-13&src=typed_query", // ISAT 13-15 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-17%20since%3A2024-06-15&src=typed_query", // ISAT 15-17 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-19%20since%3A2024-06-17&src=typed_query", // ISAT 17-19 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-21%20since%3A2024-06-19&src=typed_query", // ISAT 19-21 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-23%20since%3A2024-06-21&src=typed_query", // ISAT 21-23 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-25%20since%3A2024-06-23&src=typed_query", // ISAT 23-25 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-27%20since%3A2024-06-25&src=typed_query", // ISAT 25-27 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-06-27&src=typed_query", // ISAT 27-30 Juni 2024

    // // juli
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-03%20since%3A2024-07-01&src=typed_query", // ISAT 1-3 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-05%20since%3A2024-07-03&src=typed_query", // ISAT 3-5 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-07%20since%3A2024-07-05&src=typed_query", // ISAT 5-7 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-09%20since%3A2024-07-07&src=typed_query", // ISAT 7-9 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-11%20since%3A2024-07-09&src=typed_query", // ISAT 9-11 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-13%20since%3A2024-07-11&src=typed_query", // ISAT 11-13 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-15%20since%3A2024-07-13&src=typed_query", // ISAT 13-15 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-17%20since%3A2024-07-15&src=typed_query", // ISAT 15-17 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-19%20since%3A2024-07-17&src=typed_query", // ISAT 17-19 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-21%20since%3A2024-07-19&src=typed_query", // ISAT 19-21 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-23%20since%3A2024-07-21&src=typed_query", // ISAT 21-23 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-25%20since%3A2024-07-23&src=typed_query", // ISAT 23-25 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-27%20since%3A2024-07-25&src=typed_query", // ISAT 25-27 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-31%20since%3A2024-07-27&src=typed_query", // ISAT 27-31 Juli 2024

    // // agustus
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-03%20since%3A2024-08-01&src=typed_query", // ISAT 1-3 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-05%20since%3A2024-08-03&src=typed_query", // ISAT 3-5 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-07%20since%3A2024-08-05&src=typed_query", // ISAT 5-7 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-09%20since%3A2024-08-07&src=typed_query", // ISAT 7-9 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-11%20since%3A2024-08-09&src=typed_query", // ISAT 9-11 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-13%20since%3A2024-08-11&src=typed_query", // ISAT 11-13 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-15%20since%3A2024-08-13&src=typed_query", // ISAT 13-15 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-17%20since%3A2024-08-15&src=typed_query", // ISAT 15-17 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-19%20since%3A2024-08-17&src=typed_query", // ISAT 17-19 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-21%20since%3A2024-08-19&src=typed_query", // ISAT 19-21 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-23%20since%3A2024-08-21&src=typed_query", // ISAT 21-23 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-25%20since%3A2024-08-23&src=typed_query", // ISAT 23-25 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-27%20since%3A2024-08-25&src=typed_query", // ISAT 25-27 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-31%20since%3A2024-08-27&src=typed_query", // ISAT 27-31 Agustus 2024

    // // september
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-03%20since%3A2024-09-01&src=typed_query", // ISAT 1-3 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-05%20since%3A2024-09-03&src=typed_query", // ISAT 3-5 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-07%20since%3A2024-09-05&src=typed_query", // ISAT 5-7 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-09%20since%3A2024-09-07&src=typed_query", // ISAT 7-9 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-11%20since%3A2024-09-09&src=typed_query", // ISAT 9-11 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-13%20since%3A2024-09-11&src=typed_query", // ISAT 11-13 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-15%20since%3A2024-09-13&src=typed_query", // ISAT 13-15 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-17%20since%3A2024-09-15&src=typed_query", // ISAT 15-17 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-19%20since%3A2024-09-17&src=typed_query", // ISAT 17-19 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-21%20since%3A2024-09-19&src=typed_query", // ISAT 19-21 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-23%20since%3A2024-09-21&src=typed_query", // ISAT 21-23 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-25%20since%3A2024-09-23&src=typed_query", // ISAT 23-25 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-27%20since%3A2024-09-25&src=typed_query", // ISAT 25-27 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-30%20since%3A2024-09-27&src=typed_query", // ISAT 27-30 September 2024

    // // oktober
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-03%20since%3A2024-10-01&src=typed_query", // ISAT 1-3 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-05%20since%3A2024-10-03&src=typed_query", // ISAT 3-5 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-07%20since%3A2024-10-05&src=typed_query", // ISAT 5-7 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-09%20since%3A2024-10-07&src=typed_query", // ISAT 7-9 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-11%20since%3A2024-10-09&src=typed_query", // ISAT 9-11 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-13%20since%3A2024-10-11&src=typed_query", // ISAT 11-13 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-15%20since%3A2024-10-13&src=typed_query", // ISAT 13-15 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-17%20since%3A2024-10-15&src=typed_query", // ISAT 15-17 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-19%20since%3A2024-10-17&src=typed_query", // ISAT 17-19 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-21%20since%3A2024-10-19&src=typed_query", // ISAT 19-21 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-23%20since%3A2024-10-21&src=typed_query", // ISAT 21-23 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-25%20since%3A2024-10-23&src=typed_query", // ISAT 23-25 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-27%20since%3A2024-10-25&src=typed_query", // ISAT 25-27 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-31%20since%3A2024-10-27&src=typed_query", // ISAT 27-31 Oktober 2024

    // // november
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-03%20since%3A2024-11-01&src=typed_query", // ISAT 1-3 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-05%20since%3A2024-11-03&src=typed_query", // ISAT 3-5 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-07%20since%3A2024-11-05&src=typed_query", // ISAT 5-7 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-09%20since%3A2024-11-07&src=typed_query", // ISAT 7-9 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-11%20since%3A2024-11-09&src=typed_query", // ISAT 9-11 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-13%20since%3A2024-11-11&src=typed_query", // ISAT 11-13 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-15%20since%3A2024-11-13&src=typed_query", // ISAT 13-15 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-17%20since%3A2024-11-15&src=typed_query", // ISAT 15-17 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-19%20since%3A2024-11-17&src=typed_query", // ISAT 17-19 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-21%20since%3A2024-11-19&src=typed_query", // ISAT 19-21 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-23%20since%3A2024-11-21&src=typed_query", // ISAT 21-23 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-25%20since%3A2024-11-23&src=typed_query", // ISAT 23-25 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-27%20since%3A2024-11-25&src=typed_query", // ISAT 25-27 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-30%20since%3A2024-11-27&src=typed_query", // ISAT 27-30 November 2024

    // // desember
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-03%20since%3A2024-12-01&src=typed_query", // ISAT 1-3 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-05%20since%3A2024-12-03&src=typed_query", // ISAT 3-5 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-07%20since%3A2024-12-05&src=typed_query", // ISAT 5-7 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-09%20since%3A2024-12-07&src=typed_query", // ISAT 7-9 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-11%20since%3A2024-12-09&src=typed_query", // ISAT 9-11 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-13%20since%3A2024-12-11&src=typed_query", // ISAT 11-13 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-15%20since%3A2024-12-13&src=typed_query", // ISAT 13-15 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-17%20since%3A2024-12-15&src=typed_query", // ISAT 15-17 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-19%20since%3A2024-12-17&src=typed_query", // ISAT 17-19 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-21%20since%3A2024-12-19&src=typed_query", // ISAT 19-21 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-23%20since%3A2024-12-21&src=typed_query", // ISAT 21-23 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-25%20since%3A2024-12-23&src=typed_query", // ISAT 23-25 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-27%20since%3A2024-12-25&src=typed_query", // ISAT 25-27 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-12-27&src=typed_query", // ISAT 27-31 Desember 2024

    // // latest
    // // januari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-03%20since%3A2024-01-01&src=typed_query&f=live", // ISAT 1-3 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-05%20since%3A2024-01-03&src=typed_query&f=live", // ISAT 3-5 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-07%20since%3A2024-01-05&src=typed_query&f=live", // ISAT 5-7 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-09%20since%3A2024-01-07&src=typed_query&f=live", // ISAT 7-9 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-11%20since%3A2024-01-09&src=typed_query&f=live", // ISAT 9-11 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-13%20since%3A2024-01-11&src=typed_query&f=live", // ISAT 11-13 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-15%20since%3A2024-01-13&src=typed_query&f=live", // ISAT 13-15 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-17%20since%3A2024-01-15&src=typed_query&f=live", // ISAT 15-17 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-19%20since%3A2024-01-17&src=typed_query&f=live", // ISAT 17-19 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-21%20since%3A2024-01-19&src=typed_query&f=live", // ISAT 19-21 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-23%20since%3A2024-01-21&src=typed_query&f=live", // ISAT 21-23 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-25%20since%3A2024-01-23&src=typed_query&f=live", // ISAT 23-25 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-27%20since%3A2024-01-25&src=typed_query&f=live", // ISAT 25-27 Januari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-01-31%20since%3A2024-01-27&src=typed_query&f=live", // ISAT 27-31 Januari 2024

    // // februari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-03%20since%3A2024-02-01&src=typed_query&f=live", // ISAT 1-3 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-05%20since%3A2024-02-03&src=typed_query&f=live", // ISAT 3-5 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-07%20since%3A2024-02-05&src=typed_query&f=live", // ISAT 5-7 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-09%20since%3A2024-02-07&src=typed_query&f=live", // ISAT 7-9 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-11%20since%3A2024-02-09&src=typed_query&f=live", // ISAT 9-11 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-13%20since%3A2024-02-11&src=typed_query&f=live", // ISAT 11-13 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-15%20since%3A2024-02-13&src=typed_query&f=live", // ISAT 13-15 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-17%20since%3A2024-02-15&src=typed_query&f=live", // ISAT 15-17 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-19%20since%3A2024-02-17&src=typed_query&f=live", // ISAT 17-19 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-21%20since%3A2024-02-19&src=typed_query&f=live", // ISAT 19-21 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-23%20since%3A2024-02-21&src=typed_query&f=live", // ISAT 21-23 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-25%20since%3A2024-02-23&src=typed_query&f=live", // ISAT 23-25 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-27%20since%3A2024-02-25&src=typed_query&f=live", // ISAT 25-27 Februari 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-02-28%20since%3A2024-02-27&src=typed_query&f=live", // ISAT 27-28 Februari 2024

    // // maret
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-03%20since%3A2024-03-01&src=typed_query&f=live", // ISAT 1-3 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-05%20since%3A2024-03-03&src=typed_query&f=live", // ISAT 3-5 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-07%20since%3A2024-03-05&src=typed_query&f=live", // ISAT 5-7 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-09%20since%3A2024-03-07&src=typed_query&f=live", // ISAT 7-9 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-11%20since%3A2024-03-09&src=typed_query&f=live", // ISAT 9-11 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-13%20since%3A2024-03-11&src=typed_query&f=live", // ISAT 11-13 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-15%20since%3A2024-03-13&src=typed_query&f=live", // ISAT 13-15 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-17%20since%3A2024-03-15&src=typed_query&f=live", // ISAT 15-17 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-19%20since%3A2024-03-17&src=typed_query&f=live", // ISAT 17-19 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-21%20since%3A2024-03-19&src=typed_query&f=live", // ISAT 19-21 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-23%20since%3A2024-03-21&src=typed_query&f=live", // ISAT 21-23 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-25%20since%3A2024-03-23&src=typed_query&f=live", // ISAT 23-25 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-27%20since%3A2024-03-25&src=typed_query&f=live", // ISAT 25-27 Maret 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-03-31%20since%3A2024-03-27&src=typed_query&f=live", // ISAT 27-31 Maret 2024

    // // april
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-03%20since%3A2024-04-01&src=typed_query&f=live", // ISAT 1-3 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-05%20since%3A2024-04-03&src=typed_query&f=live", // ISAT 3-5 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-07%20since%3A2024-04-05&src=typed_query&f=live", // ISAT 5-7 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-09%20since%3A2024-04-07&src=typed_query&f=live", // ISAT 7-9 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-11%20since%3A2024-04-09&src=typed_query&f=live", // ISAT 9-11 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-13%20since%3A2024-04-11&src=typed_query&f=live", // ISAT 11-13 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-15%20since%3A2024-04-13&src=typed_query&f=live", // ISAT 13-15 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-17%20since%3A2024-04-15&src=typed_query&f=live", // ISAT 15-17 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-19%20since%3A2024-04-17&src=typed_query&f=live", // ISAT 17-19 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-21%20since%3A2024-04-19&src=typed_query&f=live", // ISAT 19-21 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-23%20since%3A2024-04-21&src=typed_query&f=live", // ISAT 21-23 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-25%20since%3A2024-04-23&src=typed_query&f=live", // ISAT 23-25 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-27%20since%3A2024-04-25&src=typed_query&f=live", // ISAT 25-27 April 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-04-30%20since%3A2024-04-27&src=typed_query&f=live", // ISAT 27-30 April 2024

    // // mei
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-03%20since%3A2024-05-01&src=typed_query&f=live", // ISAT 1-3 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-05%20since%3A2024-05-03&src=typed_query&f=live", // ISAT 3-5 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-07%20since%3A2024-05-05&src=typed_query&f=live", // ISAT 5-7 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-09%20since%3A2024-05-07&src=typed_query&f=live", // ISAT 7-9 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-11%20since%3A2024-05-09&src=typed_query&f=live", // ISAT 9-11 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-13%20since%3A2024-05-11&src=typed_query&f=live", // ISAT 11-13 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-15%20since%3A2024-05-13&src=typed_query&f=live", // ISAT 13-15 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-17%20since%3A2024-05-15&src=typed_query&f=live", // ISAT 15-17 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-19%20since%3A2024-05-17&src=typed_query&f=live", // ISAT 17-19 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-21%20since%3A2024-05-19&src=typed_query&f=live", // ISAT 19-21 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-23%20since%3A2024-05-21&src=typed_query&f=live", // ISAT 21-23 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-25%20since%3A2024-05-23&src=typed_query&f=live", // ISAT 23-25 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-27%20since%3A2024-05-25&src=typed_query&f=live", // ISAT 25-27 Mei 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-05-31%20since%3A2024-05-27&src=typed_query&f=live", // ISAT 27-31 Mei 2024

    // // juni
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-03%20since%3A2024-06-01&src=typed_query&f=live", // ISAT 1-3 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-05%20since%3A2024-06-03&src=typed_query&f=live", // ISAT 3-5 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-07%20since%3A2024-06-05&src=typed_query&f=live", // ISAT 5-7 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-09%20since%3A2024-06-07&src=typed_query&f=live", // ISAT 7-9 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-11%20since%3A2024-06-09&src=typed_query&f=live", // ISAT 9-11 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-13%20since%3A2024-06-11&src=typed_query&f=live", // ISAT 11-13 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-15%20since%3A2024-06-13&src=typed_query&f=live", // ISAT 13-15 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-17%20since%3A2024-06-15&src=typed_query&f=live", // ISAT 15-17 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-19%20since%3A2024-06-17&src=typed_query&f=live", // ISAT 17-19 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-21%20since%3A2024-06-19&src=typed_query&f=live", // ISAT 19-21 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-23%20since%3A2024-06-21&src=typed_query&f=live", // ISAT 21-23 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-25%20since%3A2024-06-23&src=typed_query&f=live", // ISAT 23-25 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-27%20since%3A2024-06-25&src=typed_query&f=live", // ISAT 25-27 Juni 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-06-27&src=typed_query&f=live", // ISAT 27-30 Juni 2024

    // // juli
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-03%20since%3A2024-07-01&src=typed_query&f=live", // ISAT 1-3 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-05%20since%3A2024-07-03&src=typed_query&f=live", // ISAT 3-5 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-07%20since%3A2024-07-05&src=typed_query&f=live", // ISAT 5-7 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-09%20since%3A2024-07-07&src=typed_query&f=live", // ISAT 7-9 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-11%20since%3A2024-07-09&src=typed_query&f=live", // ISAT 9-11 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-13%20since%3A2024-07-11&src=typed_query&f=live", // ISAT 11-13 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-15%20since%3A2024-07-13&src=typed_query&f=live", // ISAT 13-15 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-17%20since%3A2024-07-15&src=typed_query&f=live", // ISAT 15-17 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-19%20since%3A2024-07-17&src=typed_query&f=live", // ISAT 17-19 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-21%20since%3A2024-07-19&src=typed_query&f=live", // ISAT 19-21 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-23%20since%3A2024-07-21&src=typed_query&f=live", // ISAT 21-23 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-25%20since%3A2024-07-23&src=typed_query&f=live", // ISAT 23-25 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-27%20since%3A2024-07-25&src=typed_query&f=live", // ISAT 25-27 Juli 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-07-31%20since%3A2024-07-27&src=typed_query&f=live", // ISAT 27-31 Juli 2024

    // // agustus
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-03%20since%3A2024-08-01&src=typed_query&f=live", // ISAT 1-3 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-05%20since%3A2024-08-03&src=typed_query&f=live", // ISAT 3-5 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-07%20since%3A2024-08-05&src=typed_query&f=live", // ISAT 5-7 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-09%20since%3A2024-08-07&src=typed_query&f=live", // ISAT 7-9 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-11%20since%3A2024-08-09&src=typed_query&f=live", // ISAT 9-11 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-13%20since%3A2024-08-11&src=typed_query&f=live", // ISAT 11-13 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-15%20since%3A2024-08-13&src=typed_query&f=live", // ISAT 13-15 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-17%20since%3A2024-08-15&src=typed_query&f=live", // ISAT 15-17 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-19%20since%3A2024-08-17&src=typed_query&f=live", // ISAT 17-19 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-21%20since%3A2024-08-19&src=typed_query&f=live", // ISAT 19-21 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-23%20since%3A2024-08-21&src=typed_query&f=live", // ISAT 21-23 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-25%20since%3A2024-08-23&src=typed_query&f=live", // ISAT 23-25 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-27%20since%3A2024-08-25&src=typed_query&f=live", // ISAT 25-27 Agustus 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-08-30%20since%3A2024-08-27&src=typed_query&f=live", // ISAT 27-30 Agustus 2024

    // // september
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-03%20since%3A2024-09-01&src=typed_query&f=live", // ISAT 1-3 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-05%20since%3A2024-09-03&src=typed_query&f=live", // ISAT 3-5 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-07%20since%3A2024-09-05&src=typed_query&f=live", // ISAT 5-7 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-09%20since%3A2024-09-07&src=typed_query&f=live", // ISAT 7-9 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-11%20since%3A2024-09-09&src=typed_query&f=live", // ISAT 9-11 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-13%20since%3A2024-09-11&src=typed_query&f=live", // ISAT 11-13 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-15%20since%3A2024-09-13&src=typed_query&f=live", // ISAT 13-15 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-17%20since%3A2024-09-15&src=typed_query&f=live", // ISAT 15-17 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-19%20since%3A2024-09-17&src=typed_query&f=live", // ISAT 17-19 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-21%20since%3A2024-09-19&src=typed_query&f=live", // ISAT 19-21 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-23%20since%3A2024-09-21&src=typed_query&f=live", // ISAT 21-23 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-25%20since%3A2024-09-23&src=typed_query&f=live", // ISAT 23-25 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-27%20since%3A2024-09-25&src=typed_query&f=live", // ISAT 25-27 September 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-09-30%20since%3A2024-09-27&src=typed_query&f=live", // ISAT 27-30 September 2024

    // // oktober
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-03%20since%3A2024-10-01&src=typed_query&f=live", // ISAT 1-3 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-05%20since%3A2024-10-03&src=typed_query&f=live", // ISAT 3-5 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-07%20since%3A2024-10-05&src=typed_query&f=live", // ISAT 5-7 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-09%20since%3A2024-10-07&src=typed_query&f=live", // ISAT 7-9 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-11%20since%3A2024-10-09&src=typed_query&f=live", // ISAT 9-11 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-13%20since%3A2024-10-11&src=typed_query&f=live", // ISAT 11-13 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-15%20since%3A2024-10-13&src=typed_query&f=live", // ISAT 13-15 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-17%20since%3A2024-10-15&src=typed_query&f=live", // ISAT 15-17 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-19%20since%3A2024-10-17&src=typed_query&f=live", // ISAT 17-19 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-21%20since%3A2024-10-19&src=typed_query&f=live", // ISAT 19-21 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-23%20since%3A2024-10-21&src=typed_query&f=live", // ISAT 21-23 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-25%20since%3A2024-10-23&src=typed_query&f=live", // ISAT 23-25 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-27%20since%3A2024-10-25&src=typed_query&f=live", // ISAT 25-27 Oktober 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-10-31%20since%3A2024-10-27&src=typed_query&f=live", // ISAT 27-31 Oktober 2024

    // // november
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-03%20since%3A2024-11-01&src=typed_query&f=live", // ISAT 1-3 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-05%20since%3A2024-11-03&src=typed_query&f=live", // ISAT 3-5 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-07%20since%3A2024-11-05&src=typed_query&f=live", // ISAT 5-7 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-09%20since%3A2024-11-07&src=typed_query&f=live", // ISAT 7-9 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-11%20since%3A2024-11-09&src=typed_query&f=live", // ISAT 9-11 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-13%20since%3A2024-11-11&src=typed_query&f=live", // ISAT 11-13 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-15%20since%3A2024-11-13&src=typed_query&f=live", // ISAT 13-15 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-17%20since%3A2024-11-15&src=typed_query&f=live", // ISAT 15-17 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-19%20since%3A2024-11-17&src=typed_query&f=live", // ISAT 17-19 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-21%20since%3A2024-11-19&src=typed_query&f=live", // ISAT 19-21 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-23%20since%3A2024-11-21&src=typed_query&f=live", // ISAT 21-23 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-25%20since%3A2024-11-23&src=typed_query&f=live", // ISAT 23-25 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-27%20since%3A2024-11-25&src=typed_query&f=live", // ISAT 25-27 November 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-11-30%20since%3A2024-11-27&src=typed_query&f=live", // ISAT 27-30 November 2024

    // // desember
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-03%20since%3A2024-12-01&src=typed_query&f=live", // ISAT 1-3 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-05%20since%3A2024-12-03&src=typed_query&f=live", // ISAT 3-5 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-07%20since%3A2024-12-05&src=typed_query&f=live", // ISAT 5-7 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-09%20since%3A2024-12-07&src=typed_query&f=live", // ISAT 7-9 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-11%20since%3A2024-12-09&src=typed_query&f=live", // ISAT 9-11 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-13%20since%3A2024-12-11&src=typed_query&f=live", // ISAT 11-13 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-15%20since%3A2024-12-13&src=typed_query&f=live", // ISAT 13-15 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-17%20since%3A2024-12-15&src=typed_query&f=live", // ISAT 15-17 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-19%20since%3A2024-12-17&src=typed_query&f=live", // ISAT 17-19 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-21%20since%3A2024-12-19&src=typed_query&f=live", // ISAT 19-21 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-23%20since%3A2024-12-21&src=typed_query&f=live", // ISAT 21-23 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-25%20since%3A2024-12-23&src=typed_query&f=live", // ISAT 23-25 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-27%20since%3A2024-12-25&src=typed_query&f=live", // ISAT 25-27 Desember 2024
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-12-27&src=typed_query&f=live", // ISAT 27-31 Desember 2024

    // // Kata Kunci: #ISAT
    // // top
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-01-31%20since%3A2024-01-01&src=typed_query", // ISAT Januari 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-02-28%20since%3A2024-02-01&src=typed_query", // ISAT Februari 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-03-31%20since%3A2024-03-01&src=typed_query", // ISAT Maret 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-04-30%20since%3A2024-04-01&src=typed_query", // ISAT April 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-05-31%20since%3A2024-05-01&src=typed_query", // ISAT Mei 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-06-01&src=typed_query", // ISAT Juni 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-07-31%20since%3A2024-07-01&src=typed_query", // ISAT Juli 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-08-31%20since%3A2024-08-01&src=typed_query", // ISAT Agustus 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-09-30%20since%3A2024-09-01&src=typed_query", // ISAT September 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-10-31%20since%3A2024-10-01&src=typed_query", // ISAT Oktober 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-11-30%20since%3A2024-11-01&src=typed_query", // ISAT November 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-12-01&src=typed_query", // ISAT Desember 2024

    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-01-01&src=typed_query", // ISAT sejak Januari 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-02-01&src=typed_query", // ISAT sejak Februari 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-03-01&src=typed_query", // ISAT sejak Maret 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-04-01&src=typed_query", // ISAT sejak April 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-05-01&src=typed_query", // ISAT sejak Mei 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-06-01&src=typed_query", // ISAT sejak Juni 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-07-01&src=typed_query", // ISAT sejak Juli 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-08-01&src=typed_query", // ISAT sejak Agustus 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-09-01&src=typed_query", // ISAT sejak September 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-10-01&src=typed_query", // ISAT sejak Oktober 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-11-01&src=typed_query", // ISAT sejak November 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2024-12-01&src=typed_query", // ISAT sejak Desember 2024

    // // latest
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-01-31%20since%3A2024-01-01&src=typed_query&f=live", // ISAT Januari 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-02-28%20since%3A2024-02-01&src=typed_query&f=live", // ISAT Februari 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-03-31%20since%3A2024-03-01&src=typed_query&f=live", // ISAT Maret 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-04-30%20since%3A2024-04-01&src=typed_query&f=live", // ISAT April 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-05-31%20since%3A2024-05-01&src=typed_query&f=live", // ISAT Mei 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-06-01&src=typed_query&f=live", // ISAT Juni 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-07-31%20since%3A2024-07-01&src=typed_query&f=live", // ISAT Juli 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-08-31%20since%3A2024-08-01&src=typed_query&f=live", // ISAT Agustus 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-09-30%20since%3A2024-09-01&src=typed_query&f=live", // ISAT September 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-10-31%20since%3A2024-10-01&src=typed_query&f=live", // ISAT Oktober 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-11-30%20since%3A2024-11-01&src=typed_query&f=live", // ISAT November 2024
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-12-01&src=typed_query&f=live", // ISAT Desember 2024

    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-02-28%20since%3A2024-02-01&src=typed_query&f=live", // ISAT Februari 2024
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-03-31%20since%3A2024-03-01&src=typed_query&f=live", // ISAT Maret 2024
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-04-30%20since%3A2024-04-01&src=typed_query&f=live", // ISAT April 2024
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-05-31%20since%3A2024-05-01&src=typed_query&f=live", // ISAT Mei 2024
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-06-01&src=typed_query&f=live", // ISAT Juni 2024
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-07-31%20since%3A2024-07-01&src=typed_query&f=live", // ISAT Juli 2024
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-08-31%20since%3A2024-08-01&src=typed_query&f=live", // ISAT Agustus 2024
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-09-30%20since%3A2024-09-01&src=typed_query&f=live", // ISAT September 2024
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-10-31%20since%3A2024-10-01&src=typed_query&f=live", // ISAT Oktober 2024
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-11-30%20since%3A2024-11-01&src=typed_query&f=live", // ISAT November 2024
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-12-01&src=typed_query&f=live", // ISAT Desember 2024

    // UNVR 2019
    // Kata Kunci : UNVR
    // top
    // // januari 
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-03%20since%3A2019-01-01&src=typed_query", // UNVR 1-3 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-05%20since%3A2019-01-03&src=typed_query", // UNVR 3-5 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-07%20since%3A2019-01-05&src=typed_query", // UNVR 5-7 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-09%20since%3A2019-01-07&src=typed_query", // UNVR 7-9 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-11%20since%3A2019-01-09&src=typed_query", // UNVR 9-11 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-13%20since%3A2019-01-11&src=typed_query", // UNVR 11-13 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-15%20since%3A2019-01-13&src=typed_query", // UNVR 13-15 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-17%20since%3A2019-01-15&src=typed_query", // UNVR 15-17 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-19%20since%3A2019-01-17&src=typed_query", // UNVR 17-19Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-21%20since%3A2019-01-19&src=typed_query", // UNVR 19-21 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-23%20since%3A2019-01-21&src=typed_query", // UNVR 21-23 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-25%20since%3A2019-01-23&src=typed_query", // UNVR 23-25 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-27%20since%3A2019-01-25&src=typed_query", // UNVR 25-27 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-31%20since%3A2019-01-27&src=typed_query", // UNVR 27-31 Januari 2019

    // // februari
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-03%20since%3A2019-02-01&src=typed_query", // UNVR 1-3 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-05%20since%3A2019-02-03&src=typed_query", // UNVR 3-5 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-07%20since%3A2019-02-05&src=typed_query", // UNVR 5-7 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-09%20since%3A2019-02-07&src=typed_query", // UNVR 7-9 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-11%20since%3A2019-02-09&src=typed_query", // UNVR 9-11 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-13%20since%3A2019-02-11&src=typed_query", // UNVR 11-13 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-15%20since%3A2019-02-13&src=typed_query", // UNVR 13-15 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-17%20since%3A2019-02-15&src=typed_query", // UNVR 15-17 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-19%20since%3A2019-02-17&src=typed_query", // UNVR 17-19Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-21%20since%3A2019-02-19&src=typed_query", // UNVR 19-21 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-23%20since%3A2019-02-21&src=typed_query", // UNVR 21-23 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-25%20since%3A2019-02-23&src=typed_query", // UNVR 23-25 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-27%20since%3A2019-02-25&src=typed_query", // UNVR 25-27 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-28%20since%3A2019-02-27&src=typed_query", // UNVR 27-28 Januari 2019

    // // maret
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-03%20since%3A2019-03-01&src=typed_query", // UNVR 1-3 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-05%20since%3A2019-03-03&src=typed_query", // UNVR 3-5 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-07%20since%3A2019-03-05&src=typed_query", // UNVR 5-7 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-09%20since%3A2019-03-07&src=typed_query", // UNVR 7-9 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-11%20since%3A2019-03-09&src=typed_query", // UNVR 9-11 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-13%20since%3A2019-03-11&src=typed_query", // UNVR 11-13 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-15%20since%3A2019-03-13&src=typed_query", // UNVR 13-15 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-17%20since%3A2019-03-15&src=typed_query", // UNVR 15-17 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-19%20since%3A2019-03-17&src=typed_query", // UNVR 17-19 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-21%20since%3A2019-03-19&src=typed_query", // UNVR 19-21 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-23%20since%3A2019-03-21&src=typed_query", // UNVR 21-23 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-25%20since%3A2019-03-23&src=typed_query", // UNVR 23-25 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-27%20since%3A2019-03-25&src=typed_query", // UNVR 25-27 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-31%20since%3A2019-03-27&src=typed_query", // UNVR 27-31 Maret 2019

    // // april
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-03%20since%3A2019-04-01&src=typed_query", // UNVR 1-3 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-05%20since%3A2019-04-03&src=typed_query", // UNVR 3-5 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-07%20since%3A2019-04-05&src=typed_query", // UNVR 5-7 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-09%20since%3A2019-04-07&src=typed_query", // UNVR 7-9 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-11%20since%3A2019-04-09&src=typed_query", // UNVR 9-11 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-13%20since%3A2019-04-11&src=typed_query", // UNVR 11-13 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-15%20since%3A2019-04-13&src=typed_query", // UNVR 13-15 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-17%20since%3A2019-04-15&src=typed_query", // UNVR 15-17 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-19%20since%3A2019-04-17&src=typed_query", // UNVR 17-19 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-21%20since%3A2019-04-19&src=typed_query", // UNVR 19-21 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-23%20since%3A2019-04-21&src=typed_query", // UNVR 21-23 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-25%20since%3A2019-04-23&src=typed_query", // UNVR 23-25 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-27%20since%3A2019-04-25&src=typed_query", // UNVR 25-27 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-30%20since%3A2019-04-27&src=typed_query", // UNVR 27-30 April 2019

    // // mei
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-03%20since%3A2019-05-01&src=typed_query", // UNVR 1-3 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-05%20since%3A2019-05-03&src=typed_query", // UNVR 3-5 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-07%20since%3A2019-05-05&src=typed_query", // UNVR 5-7 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-09%20since%3A2019-05-07&src=typed_query", // UNVRT 7-9 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-11%20since%3A2019-05-09&src=typed_query", // UNVR 9-11 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-13%20since%3A2019-05-11&src=typed_query", // UNVR 11-13 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-15%20since%3A2019-05-13&src=typed_query", // UNVR 13-15 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-17%20since%3A2019-05-15&src=typed_query", // UNVR 15-17 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-19%20since%3A2019-05-17&src=typed_query", // UNVR 17-19 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-21%20since%3A2019-05-19&src=typed_query", // UNVR 19-21 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-23%20since%3A2019-05-21&src=typed_query", // UNVR 21-23 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-25%20since%3A2019-05-23&src=typed_query", // UNVR 23-25 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-27%20since%3A2019-05-25&src=typed_query", // UNVR 25-27 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-31%20since%3A2019-05-27&src=typed_query", // UNVR 27-31 Mei 2019

    // // juni
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-03%20since%3A2019-06-01&src=typed_query", // UNVR 1-3 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-05%20since%3A2019-06-03&src=typed_query", // UNVR 3-5 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-07%20since%3A2019-06-05&src=typed_query", // UNVR 5-7 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-09%20since%3A2019-06-07&src=typed_query", // UNVR 7-9 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-11%20since%3A2019-06-09&src=typed_query", // UNVR 9-11 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-13%20since%3A2019-06-11&src=typed_query", // UNVR 11-13 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-15%20since%3A2019-06-13&src=typed_query", // UNVR 13-15 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-17%20since%3A2019-06-15&src=typed_query", // UNVR 15-17 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-19%20since%3A2019-06-17&src=typed_query", // UNVR 17-19 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-21%20since%3A2019-06-19&src=typed_query", // UNVR 19-21 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-23%20since%3A2019-06-21&src=typed_query", // UNVR 21-23 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-25%20since%3A2019-06-23&src=typed_query", // UNVR 23-25 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-27%20since%3A2019-06-25&src=typed_query", // UNVR 25-27 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-06-27&src=typed_query", // UNVR 27-30 Juni 2019

    // // juli
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-03%20since%3A2019-07-01&src=typed_query", // UNVR 1-3 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-05%20since%3A2019-07-03&src=typed_query", // UNVR 3-5 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-07%20since%3A2019-07-05&src=typed_query", // UNVR 5-7 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-09%20since%3A2019-07-07&src=typed_query", // UNVR 7-9 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-11%20since%3A2019-07-09&src=typed_query", // UNVR 9-11 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-13%20since%3A2019-07-11&src=typed_query", // UNVR 11-13 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-15%20since%3A2019-07-13&src=typed_query", // UNVR 13-15 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-17%20since%3A2019-07-15&src=typed_query", // UNVR 15-17 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-19%20since%3A2019-07-17&src=typed_query", // UNVR 17-19 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-21%20since%3A2019-07-19&src=typed_query", // UNVR 19-21 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-23%20since%3A2019-07-21&src=typed_query", // UNVR 21-23 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-25%20since%3A2019-07-23&src=typed_query", // UNVR 23-25 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-27%20since%3A2019-07-25&src=typed_query", // UNVR 25-27 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-31%20since%3A2019-07-27&src=typed_query", // UNVR 27-31 Juli 2019

    // // agustus
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-03%20since%3A2019-08-01&src=typed_query", // UNVR 1-3 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-05%20since%3A2019-08-03&src=typed_query", // UNVR 3-5 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-07%20since%3A2019-08-05&src=typed_query", // UNVR 5-7 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-09%20since%3A2019-08-07&src=typed_query", // UNVR 7-9 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-11%20since%3A2019-08-09&src=typed_query", // UNVR 9-11 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-13%20since%3A2019-08-11&src=typed_query", // UNVR 11-13 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-15%20since%3A2019-08-13&src=typed_query", // UNVR 13-15 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-17%20since%3A2019-08-15&src=typed_query", // UNVR 15-17 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-19%20since%3A2019-08-17&src=typed_query", // UNVR 17-19 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-21%20since%3A2019-08-19&src=typed_query", // UNVR 19-21 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-23%20since%3A2019-08-21&src=typed_query", // UNVR 21-23 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-25%20since%3A2019-08-23&src=typed_query", // UNVR 23-25 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-27%20since%3A2019-08-25&src=typed_query", // UNVR 25-27 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-31%20since%3A2019-08-27&src=typed_query", // UNVR 27-31 Agustus 2019

    // // september
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-03%20since%3A2019-09-01&src=typed_query", // UNVR 1-3 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-05%20since%3A2019-09-03&src=typed_query", // UNVR 3-5 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-07%20since%3A2019-09-05&src=typed_query", // UNVR 5-7 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-09%20since%3A2019-09-07&src=typed_query", // UNVR 7-9 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-11%20since%3A2019-09-09&src=typed_query", // UNVR 9-11 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-13%20since%3A2019-09-11&src=typed_query", // UNVR 11-13 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-15%20since%3A2019-09-13&src=typed_query", // UNVR 13-15 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-17%20since%3A2019-09-15&src=typed_query", // UNVR 15-17 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-19%20since%3A2019-09-17&src=typed_query", // UNVR 17-19 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-21%20since%3A2019-09-19&src=typed_query", // UNVR 19-21 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-23%20since%3A2019-09-21&src=typed_query", // UNVR 21-23 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-25%20since%3A2019-09-23&src=typed_query", // UNVR 23-25 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-27%20since%3A2019-09-25&src=typed_query", // UNVR 25-27 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-30%20since%3A2019-09-27&src=typed_query", // UNVR 27-30 September 2019

    // // oktober
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-03%20since%3A2019-10-01&src=typed_query", // UNVR 1-3 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-05%20since%3A2019-10-03&src=typed_query", // UNVR 3-5 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-07%20since%3A2019-10-05&src=typed_query", // UNVR 5-7 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-09%20since%3A2019-10-07&src=typed_query", // UNVR 7-9 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-11%20since%3A2019-10-09&src=typed_query", // UNVR 9-11 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-13%20since%3A2019-10-11&src=typed_query", // UNVR 11-13 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-15%20since%3A2019-10-13&src=typed_query", // UNVR 13-15 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-17%20since%3A2019-10-15&src=typed_query", // UNVR 15-17 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-19%20since%3A2019-10-17&src=typed_query", // UNVR 17-19 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-21%20since%3A2019-10-19&src=typed_query", // UNVR 19-21 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-23%20since%3A2019-10-21&src=typed_query", // UNVR 21-23 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-25%20since%3A2019-10-23&src=typed_query", // UNVR 23-25 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-27%20since%3A2019-10-25&src=typed_query", // UNVR 25-27 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-31%20since%3A2019-10-27&src=typed_query", // UNVR 27-31 Oktober 2019

    // // november
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-03%20since%3A2019-11-01&src=typed_query", // UNVR 1-3 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-05%20since%3A2019-11-03&src=typed_query", // UNVR 3-5 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-07%20since%3A2019-11-05&src=typed_query", // UNVR 5-7 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-09%20since%3A2019-11-07&src=typed_query", // UNVR 7-9 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-11%20since%3A2019-11-09&src=typed_query", // UNVR 9-11 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-13%20since%3A2019-11-11&src=typed_query", // UNVR 11-13 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-15%20since%3A2019-11-13&src=typed_query", // UNVR 13-15 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-17%20since%3A2019-11-15&src=typed_query", // UNVR 15-17 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-19%20since%3A2019-11-17&src=typed_query", // UNVR 17-19 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-21%20since%3A2019-11-19&src=typed_query", // UNVR 19-21 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-23%20since%3A2019-11-21&src=typed_query", // UNVR 21-23 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-25%20since%3A2019-11-23&src=typed_query", // UNVR 23-25 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-27%20since%3A2019-11-25&src=typed_query", // UNVR 25-27 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-30%20since%3A2019-11-27&src=typed_query", // UNVR 27-30 November 2019

    // // desember
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-03%20since%3A2019-12-01&src=typed_query", // UNVR 1-3 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-05%20since%3A2019-12-03&src=typed_query", // UNVR 3-5 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-07%20since%3A2019-12-05&src=typed_query", // UNVR 5-7 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-09%20since%3A2019-12-07&src=typed_query", // UNVR 7-9 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-11%20since%3A2019-12-09&src=typed_query", // UNVR 9-11 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-13%20since%3A2019-12-11&src=typed_query", // UNVR 11-13 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-15%20since%3A2019-12-13&src=typed_query", // UNVR 13-15 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-17%20since%3A2019-12-15&src=typed_query", // UNVR 15-17 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-19%20since%3A2019-12-17&src=typed_query", // UNVR 17-19 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-21%20since%3A2019-12-19&src=typed_query", // UNVR 19-21 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-23%20since%3A2019-12-21&src=typed_query", // UNVR 21-23 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-25%20since%3A2019-12-23&src=typed_query", // UNVR 23-25 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-27%20since%3A2019-12-25&src=typed_query", // UNVR 25-27 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-12-27&src=typed_query", // UNVR 27-31 Desember 2019

    // latest
    // januari
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-03%20since%3A2019-01-01&src=typed_query&f=live", // UNVR 1-3 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-05%20since%3A2019-01-03&src=typed_query&f=live", // UNVR 3-5 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-07%20since%3A2019-01-05&src=typed_query&f=live", // UNVR 5-7 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-09%20since%3A2019-01-07&src=typed_query&f=live", // UNVR 7-9 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-11%20since%3A2019-01-09&src=typed_query&f=live", // UNVR 9-11 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-13%20since%3A2019-01-11&src=typed_query&f=live", // UNVR 11-13 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-15%20since%3A2019-01-13&src=typed_query&f=live", // UNVR 13-15 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-17%20since%3A2019-01-15&src=typed_query&f=live", // UNVR 15-17 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-19%20since%3A2019-01-17&src=typed_query&f=live", // UNVR 17-19 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-21%20since%3A2019-01-19&src=typed_query&f=live", // UNVR 19-21 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-23%20since%3A2019-01-21&src=typed_query&f=live", // UNVR 21-23 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-25%20since%3A2019-01-23&src=typed_query&f=live", // UNVR 23-25 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-27%20since%3A2019-01-25&src=typed_query&f=live", // UNVR 25-27 Januari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-01-31%20since%3A2019-01-27&src=typed_query&f=live", // UNVR 27-31 Januari 2019

    // // februari
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-03%20since%3A2019-02-01&src=typed_query&f=live", // UNVR 1-3 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-05%20since%3A2019-02-03&src=typed_query&f=live", // UNVR 3-5 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-07%20since%3A2019-02-05&src=typed_query&f=live", // UNVR 5-7 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-09%20since%3A2019-02-07&src=typed_query&f=live", // UNVR 7-9 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-11%20since%3A2019-02-09&src=typed_query&f=live", // UNVR 9-11 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-13%20since%3A2019-02-11&src=typed_query&f=live", // UNVR 11-13 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-15%20since%3A2019-02-13&src=typed_query&f=live", // UNVR 13-15 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-17%20since%3A2019-02-15&src=typed_query&f=live", // UNVR 15-17 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-19%20since%3A2019-02-17&src=typed_query&f=live", // UNVR 17-19 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-21%20since%3A2019-02-19&src=typed_query&f=live", // UNVR 19-21 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-23%20since%3A2019-02-21&src=typed_query&f=live", // UNVR 21-23 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-25%20since%3A2019-02-23&src=typed_query&f=live", // UNVR 23-25 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-27%20since%3A2019-02-25&src=typed_query&f=live", // UNVR 25-27 Februari 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-02-28%20since%3A2019-02-27&src=typed_query&f=live", // UNVR 27-28 Februari 2019

    // // maret
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-03%20since%3A2019-03-01&src=typed_query&f=live", // UNVR 1-3 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-05%20since%3A2019-03-03&src=typed_query&f=live", // UNVR 3-5 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-07%20since%3A2019-03-05&src=typed_query&f=live", // UNVR 5-7 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-09%20since%3A2019-03-07&src=typed_query&f=live", // UNVR 7-9 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-11%20since%3A2019-03-09&src=typed_query&f=live", // UNVR 9-11 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-13%20since%3A2019-03-11&src=typed_query&f=live", // UNVR 11-13 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-15%20since%3A2019-03-13&src=typed_query&f=live", // UNVR 13-15 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-17%20since%3A2019-03-15&src=typed_query&f=live", // UNVR 15-17 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-19%20since%3A2019-03-17&src=typed_query&f=live", // UNVR 17-19 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-21%20since%3A2019-03-19&src=typed_query&f=live", // UNVR 19-21 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-23%20since%3A2019-03-21&src=typed_query&f=live", // UNVR 21-23 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-25%20since%3A2019-03-23&src=typed_query&f=live", // UNVR 23-25 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-27%20since%3A2019-03-25&src=typed_query&f=live", // UNVR 25-27 Maret 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-03-31%20since%3A2019-03-27&src=typed_query&f=live", // UNVR 27-31 Maret 2019

    // // april
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-03%20since%3A2019-04-01&src=typed_query&f=live", // UNVR 1-3 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-05%20since%3A2019-04-03&src=typed_query&f=live", // UNVR 3-5 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-07%20since%3A2019-04-05&src=typed_query&f=live", // UNVR 5-7 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-09%20since%3A2019-04-07&src=typed_query&f=live", // UNVR 7-9 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-11%20since%3A2019-04-09&src=typed_query&f=live", // UNVR 9-11 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-13%20since%3A2019-04-11&src=typed_query&f=live", // UNVR 11-13 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-15%20since%3A2019-04-13&src=typed_query&f=live", // UNVR 13-15 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-17%20since%3A2019-04-15&src=typed_query&f=live", // UNVR 15-17 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-19%20since%3A2019-04-17&src=typed_query&f=live", // UNVR 17-19 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-21%20since%3A2019-04-19&src=typed_query&f=live", // UNVR 19-21 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-23%20since%3A2019-04-21&src=typed_query&f=live", // UNVR 21-23 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-25%20since%3A2019-04-23&src=typed_query&f=live", // UNVR 23-25 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-27%20since%3A2019-04-25&src=typed_query&f=live", // UNVR 25-27 April 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-04-30%20since%3A2019-04-27&src=typed_query&f=live", // UNVR 27-30 April 2019

    // // mei
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-03%20since%3A2019-05-01&src=typed_query&f=live", // UNVR 1-3 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-05%20since%3A2019-05-03&src=typed_query&f=live", // UNVR 3-5 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-07%20since%3A2019-05-05&src=typed_query&f=live", // UNVR 5-7 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-09%20since%3A2019-05-07&src=typed_query&f=live", // UNVR 7-9 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-11%20since%3A2019-05-09&src=typed_query&f=live", // UNVR 9-11 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-13%20since%3A2019-05-11&src=typed_query&f=live", // UNVR 11-13 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-15%20since%3A2019-05-13&src=typed_query&f=live", // UNVR 13-15 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-17%20since%3A2019-05-15&src=typed_query&f=live", // UNVR 15-17 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-19%20since%3A2019-05-17&src=typed_query&f=live", // UNVR 17-19 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-21%20since%3A2019-05-19&src=typed_query&f=live", // UNVR 19-21 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-23%20since%3A2019-05-21&src=typed_query&f=live", // UNVR 21-23 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-25%20since%3A2019-05-23&src=typed_query&f=live", // UNVR 23-25 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-27%20since%3A2019-05-25&src=typed_query&f=live", // UNVR 25-27 Mei 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-05-31%20since%3A2019-05-27&src=typed_query&f=live", // UNVR 27-31 Mei 2019

    // // juni
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-03%20since%3A2019-06-01&src=typed_query&f=live", // UNVR 1-3 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-05%20since%3A2019-06-03&src=typed_query&f=live", // UNVR 3-5 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-07%20since%3A2019-06-05&src=typed_query&f=live", // UNVR 5-7 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-09%20since%3A2019-06-07&src=typed_query&f=live", // UNVR 7-9 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-11%20since%3A2019-06-09&src=typed_query&f=live", // UNVR 9-11 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-13%20since%3A2019-06-11&src=typed_query&f=live", // UNVR 11-13 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-15%20since%3A2019-06-13&src=typed_query&f=live", // UNVR 13-15 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-17%20since%3A2019-06-15&src=typed_query&f=live", // UNVR 15-17 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-19%20since%3A2019-06-17&src=typed_query&f=live", // UNVR 17-19 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-21%20since%3A2019-06-19&src=typed_query&f=live", // UNVR 19-21 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-23%20since%3A2019-06-21&src=typed_query&f=live", // UNVR 21-23 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-25%20since%3A2019-06-23&src=typed_query&f=live", // UNVR 23-25 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-27%20since%3A2019-06-25&src=typed_query&f=live", // UNVR 25-27 Juni 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-06-27&src=typed_query&f=live", // UNVR 27-30 Juni 2019

    // // juli
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-03%20since%3A2019-07-01&src=typed_query&f=live", // UNVR 1-3 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-05%20since%3A2019-07-03&src=typed_query&f=live", // UNVR 3-5 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-07%20since%3A2019-07-05&src=typed_query&f=live", // UNVR 5-7 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-09%20since%3A2019-07-07&src=typed_query&f=live", // UNVR 7-9 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-11%20since%3A2019-07-09&src=typed_query&f=live", // UNVR 9-11 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-13%20since%3A2019-07-11&src=typed_query&f=live", // UNVR 11-13 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-15%20since%3A2019-07-13&src=typed_query&f=live", // UNVR 13-15 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-17%20since%3A2019-07-15&src=typed_query&f=live", // UNVR 15-17 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-19%20since%3A2019-07-17&src=typed_query&f=live", // UNVR 17-19 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-21%20since%3A2019-07-19&src=typed_query&f=live", // UNVR 19-21 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-23%20since%3A2019-07-21&src=typed_query&f=live", // UNVR 21-23 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-25%20since%3A2019-07-23&src=typed_query&f=live", // UNVR 23-25 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-27%20since%3A2019-07-25&src=typed_query&f=live", // UNVR 25-27 Juli 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-07-31%20since%3A2019-07-27&src=typed_query&f=live", // UNVR 27-31 Juli 2019

    // // agustus
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-03%20since%3A2019-08-01&src=typed_query&f=live", // UNVR 1-3 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-05%20since%3A2019-08-03&src=typed_query&f=live", // UNVR 3-5 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-07%20since%3A2019-08-05&src=typed_query&f=live", // UNVR 5-7 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-09%20since%3A2019-08-07&src=typed_query&f=live", // UNVR 7-9 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-11%20since%3A2019-08-09&src=typed_query&f=live", // UNVR 9-11 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-13%20since%3A2019-08-11&src=typed_query&f=live", // UNVR 11-13 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-15%20since%3A2019-08-13&src=typed_query&f=live", // UNVR 13-15 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-17%20since%3A2019-08-15&src=typed_query&f=live", // UNVR 15-17 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-19%20since%3A2019-08-17&src=typed_query&f=live", // UNVR 17-19 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-21%20since%3A2019-08-19&src=typed_query&f=live", // UNVR 19-21 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-23%20since%3A2019-08-21&src=typed_query&f=live", // UNVR 21-23 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-25%20since%3A2019-08-23&src=typed_query&f=live", // UNVR 23-25 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-27%20since%3A2019-08-25&src=typed_query&f=live", // UNVR 25-27 Agustus 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-08-30%20since%3A2019-08-27&src=typed_query&f=live", // UNVR 27-30 Agustus 2019

    // // september
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-03%20since%3A2019-09-01&src=typed_query&f=live", // UNVR 1-3 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-05%20since%3A2019-09-03&src=typed_query&f=live", // UNVR 3-5 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-07%20since%3A2019-09-05&src=typed_query&f=live", // UNVR 5-7 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-09%20since%3A2019-09-07&src=typed_query&f=live", // UNVR 7-9 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-11%20since%3A2019-09-09&src=typed_query&f=live", // UNVR 9-11 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-13%20since%3A2019-09-11&src=typed_query&f=live", // UNVR 11-13 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-15%20since%3A2019-09-13&src=typed_query&f=live", // UNVR 13-15 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-17%20since%3A2019-09-15&src=typed_query&f=live", // UNVR 15-17 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-19%20since%3A2019-09-17&src=typed_query&f=live", // UNVR 17-19 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-21%20since%3A2019-09-19&src=typed_query&f=live", // UNVR 19-21 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-23%20since%3A2019-09-21&src=typed_query&f=live", // UNVR 21-23 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-25%20since%3A2019-09-23&src=typed_query&f=live", // UNVR 23-25 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-27%20since%3A2019-09-25&src=typed_query&f=live", // UNVR 25-27 September 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-09-30%20since%3A2019-09-27&src=typed_query&f=live", // UNVR 27-30 September 2019

    // // oktober
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-03%20since%3A2019-10-01&src=typed_query&f=live", // UNVR 1-3 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-05%20since%3A2019-10-03&src=typed_query&f=live", // UNVR 3-5 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-07%20since%3A2019-10-05&src=typed_query&f=live", // UNVR 5-7 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-09%20since%3A2019-10-07&src=typed_query&f=live", // UNVR 7-9 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-11%20since%3A2019-10-09&src=typed_query&f=live", // UNVR 9-11 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-13%20since%3A2019-10-11&src=typed_query&f=live", // UNVR 11-13 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-15%20since%3A2019-10-13&src=typed_query&f=live", // UNVR 13-15 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-17%20since%3A2019-10-15&src=typed_query&f=live", // UNVR 15-17 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-19%20since%3A2019-10-17&src=typed_query&f=live", // UNVR 17-19 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-21%20since%3A2019-10-19&src=typed_query&f=live", // UNVR 19-21 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-23%20since%3A2019-10-21&src=typed_query&f=live", // UNVR 21-23 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-25%20since%3A2019-10-23&src=typed_query&f=live", // UNVR 23-25 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-27%20since%3A2019-10-25&src=typed_query&f=live", // UNVR 25-27 Oktober 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-10-31%20since%3A2019-10-27&src=typed_query&f=live", // UNVR 27-31 Oktober 2019

    // // november
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-03%20since%3A2019-11-01&src=typed_query&f=live", // UNVR 1-3 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-05%20since%3A2019-11-03&src=typed_query&f=live", // UNVR 3-5 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-07%20since%3A2019-11-05&src=typed_query&f=live", // UNVR 5-7 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-09%20since%3A2019-11-07&src=typed_query&f=live", // UNVR 7-9 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-11%20since%3A2019-11-09&src=typed_query&f=live", // UNVR 9-11 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-13%20since%3A2019-11-11&src=typed_query&f=live", // UNVR 11-13 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-15%20since%3A2019-11-13&src=typed_query&f=live", // UNVR 13-15 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-17%20since%3A2019-11-15&src=typed_query&f=live", // UNVR 15-17 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-19%20since%3A2019-11-17&src=typed_query&f=live", // UNVR 17-19 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-21%20since%3A2019-11-19&src=typed_query&f=live", // UNVR 19-21 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-23%20since%3A2019-11-21&src=typed_query&f=live", // UNVR 21-23 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-25%20since%3A2019-11-23&src=typed_query&f=live", // UNVR 23-25 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-27%20since%3A2019-11-25&src=typed_query&f=live", // UNVR 25-27 November 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-11-30%20since%3A2019-11-27&src=typed_query&f=live", // UNVR 27-30 November 2019

    // // desember
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-03%20since%3A2019-12-01&src=typed_query&f=live", // UNVR 1-3 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-05%20since%3A2019-12-03&src=typed_query&f=live", // UNVR 3-5 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-07%20since%3A2019-12-05&src=typed_query&f=live", // UNVR 5-7 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-09%20since%3A2019-12-07&src=typed_query&f=live", // UNVR 7-9 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-11%20since%3A2019-12-09&src=typed_query&f=live", // UNVR 9-11 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-13%20since%3A2019-12-11&src=typed_query&f=live", // UNVR 11-13 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-15%20since%3A2019-12-13&src=typed_query&f=live", // UNVR 13-15 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-17%20since%3A2019-12-15&src=typed_query&f=live", // UNVR 15-17 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-19%20since%3A2019-12-17&src=typed_query&f=live", // UNVR 17-19 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-21%20since%3A2019-12-19&src=typed_query&f=live", // UNVR 19-21 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-23%20since%3A2019-12-21&src=typed_query&f=live", // UNVR 21-23 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-25%20since%3A2019-12-23&src=typed_query&f=live", // UNVR 23-25 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-27%20since%3A2019-12-25&src=typed_query&f=live", // UNVR 25-27 Desember 2019
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-12-27&src=typed_query&f=live", // UNVR 27-31 Desember 2019

    // Kata Kunci : #UNVR
    // Top
    // // januari 
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-03%20since%3A2019-01-01&src=typed_query", // UNVR 1-3 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-05%20since%3A2019-01-03&src=typed_query", // UNVR 3-5 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-07%20since%3A2019-01-05&src=typed_query", // UNVR 5-7 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-09%20since%3A2019-01-07&src=typed_query", // UNVR 7-9 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-11%20since%3A2019-01-09&src=typed_query", // UNVR 9-11 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-13%20since%3A2019-01-11&src=typed_query", // UNVR 11-13 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-15%20since%3A2019-01-13&src=typed_query", // UNVR 13-15 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-17%20since%3A2019-01-15&src=typed_query", // UNVR 15-17 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-19%20since%3A2019-01-17&src=typed_query", // UNVR 17-19Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-21%20since%3A2019-01-19&src=typed_query", // UNVR 19-21 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-23%20since%3A2019-01-21&src=typed_query", // UNVR 21-23 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-25%20since%3A2019-01-23&src=typed_query", // UNVR 23-25 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-27%20since%3A2019-01-25&src=typed_query", // UNVR 25-27 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-31%20since%3A2019-01-27&src=typed_query", // UNVR 27-31 Januari 2019

    // // februari
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-03%20since%3A2019-02-01&src=typed_query", // UNVR 1-3 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-05%20since%3A2019-02-03&src=typed_query", // UNVR 3-5 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-07%20since%3A2019-02-05&src=typed_query", // UNVR 5-7 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-09%20since%3A2019-02-07&src=typed_query", // UNVR 7-9 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-11%20since%3A2019-02-09&src=typed_query", // UNVR 9-11 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-13%20since%3A2019-02-11&src=typed_query", // UNVR 11-13 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-15%20since%3A2019-02-13&src=typed_query", // UNVR 13-15 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-17%20since%3A2019-02-15&src=typed_query", // UNVR 15-17 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-19%20since%3A2019-02-17&src=typed_query", // UNVR 17-19Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-21%20since%3A2019-02-19&src=typed_query", // UNVR 19-21 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-23%20since%3A2019-02-21&src=typed_query", // UNVR 21-23 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-25%20since%3A2019-02-23&src=typed_query", // UNVR 23-25 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-27%20since%3A2019-02-25&src=typed_query", // UNVR 25-27 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-28%20since%3A2019-02-27&src=typed_query", // UNVR 27-28 Januari 2019

    // // maret
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-03%20since%3A2019-03-01&src=typed_query", // UNVR 1-3 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-05%20since%3A2019-03-03&src=typed_query", // UNVR 3-5 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-07%20since%3A2019-03-05&src=typed_query", // UNVR 5-7 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-09%20since%3A2019-03-07&src=typed_query", // UNVR 7-9 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-11%20since%3A2019-03-09&src=typed_query", // UNVR 9-11 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-13%20since%3A2019-03-11&src=typed_query", // UNVR 11-13 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-15%20since%3A2019-03-13&src=typed_query", // UNVR 13-15 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-17%20since%3A2019-03-15&src=typed_query", // UNVR 15-17 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-19%20since%3A2019-03-17&src=typed_query", // UNVR 17-19 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-21%20since%3A2019-03-19&src=typed_query", // UNVR 19-21 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-23%20since%3A2019-03-21&src=typed_query", // UNVR 21-23 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-25%20since%3A2019-03-23&src=typed_query", // UNVR 23-25 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-27%20since%3A2019-03-25&src=typed_query", // UNVR 25-27 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-31%20since%3A2019-03-27&src=typed_query", // UNVR 27-31 Maret 2019

    // // april
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-03%20since%3A2019-04-01&src=typed_query", // UNVR 1-3 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-05%20since%3A2019-04-03&src=typed_query", // UNVR 3-5 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-07%20since%3A2019-04-05&src=typed_query", // UNVR 5-7 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-09%20since%3A2019-04-07&src=typed_query", // UNVR 7-9 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-11%20since%3A2019-04-09&src=typed_query", // UNVR 9-11 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-13%20since%3A2019-04-11&src=typed_query", // UNVR 11-13 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-15%20since%3A2019-04-13&src=typed_query", // UNVR 13-15 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-17%20since%3A2019-04-15&src=typed_query", // UNVR 15-17 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-19%20since%3A2019-04-17&src=typed_query", // UNVR 17-19 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-21%20since%3A2019-04-19&src=typed_query", // UNVR 19-21 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-23%20since%3A2019-04-21&src=typed_query", // UNVR 21-23 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-25%20since%3A2019-04-23&src=typed_query", // UNVR 23-25 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-27%20since%3A2019-04-25&src=typed_query", // UNVR 25-27 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-30%20since%3A2019-04-27&src=typed_query", // UNVR 27-30 April 2019

    // // mei
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-03%20since%3A2019-05-01&src=typed_query", // UNVR 1-3 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-05%20since%3A2019-05-03&src=typed_query", // UNVR 3-5 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-07%20since%3A2019-05-05&src=typed_query", // UNVR 5-7 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-09%20since%3A2019-05-07&src=typed_query", // UNVRT 7-9 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-11%20since%3A2019-05-09&src=typed_query", // UNVR 9-11 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-13%20since%3A2019-05-11&src=typed_query", // UNVR 11-13 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-15%20since%3A2019-05-13&src=typed_query", // UNVR 13-15 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-17%20since%3A2019-05-15&src=typed_query", // UNVR 15-17 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-19%20since%3A2019-05-17&src=typed_query", // UNVR 17-19 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-21%20since%3A2019-05-19&src=typed_query", // UNVR 19-21 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-23%20since%3A2019-05-21&src=typed_query", // UNVR 21-23 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-25%20since%3A2019-05-23&src=typed_query", // UNVR 23-25 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-27%20since%3A2019-05-25&src=typed_query", // UNVR 25-27 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-31%20since%3A2019-05-27&src=typed_query", // UNVR 27-31 Mei 2019

    // // juni
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-03%20since%3A2019-06-01&src=typed_query", // UNVR 1-3 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-05%20since%3A2019-06-03&src=typed_query", // UNVR 3-5 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-07%20since%3A2019-06-05&src=typed_query", // UNVR 5-7 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-09%20since%3A2019-06-07&src=typed_query", // UNVR 7-9 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-11%20since%3A2019-06-09&src=typed_query", // UNVR 9-11 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-13%20since%3A2019-06-11&src=typed_query", // UNVR 11-13 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-15%20since%3A2019-06-13&src=typed_query", // UNVR 13-15 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-17%20since%3A2019-06-15&src=typed_query", // UNVR 15-17 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-19%20since%3A2019-06-17&src=typed_query", // UNVR 17-19 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-21%20since%3A2019-06-19&src=typed_query", // UNVR 19-21 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-23%20since%3A2019-06-21&src=typed_query", // UNVR 21-23 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-25%20since%3A2019-06-23&src=typed_query", // UNVR 23-25 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-27%20since%3A2019-06-25&src=typed_query", // UNVR 25-27 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-06-27&src=typed_query", // UNVR 27-30 Juni 2019

    // // juli
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-03%20since%3A2019-07-01&src=typed_query", // UNVR 1-3 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-05%20since%3A2019-07-03&src=typed_query", // UNVR 3-5 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-07%20since%3A2019-07-05&src=typed_query", // UNVR 5-7 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-09%20since%3A2019-07-07&src=typed_query", // UNVR 7-9 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-11%20since%3A2019-07-09&src=typed_query", // UNVR 9-11 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-13%20since%3A2019-07-11&src=typed_query", // UNVR 11-13 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-15%20since%3A2019-07-13&src=typed_query", // UNVR 13-15 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-17%20since%3A2019-07-15&src=typed_query", // UNVR 15-17 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-19%20since%3A2019-07-17&src=typed_query", // UNVR 17-19 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-21%20since%3A2019-07-19&src=typed_query", // UNVR 19-21 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-23%20since%3A2019-07-21&src=typed_query", // UNVR 21-23 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-25%20since%3A2019-07-23&src=typed_query", // UNVR 23-25 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-27%20since%3A2019-07-25&src=typed_query", // UNVR 25-27 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-31%20since%3A2019-07-27&src=typed_query", // UNVR 27-31 Juli 2019

    // // agustus
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-03%20since%3A2019-08-01&src=typed_query", // UNVR 1-3 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-05%20since%3A2019-08-03&src=typed_query", // UNVR 3-5 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-07%20since%3A2019-08-05&src=typed_query", // UNVR 5-7 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-09%20since%3A2019-08-07&src=typed_query", // UNVR 7-9 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-11%20since%3A2019-08-09&src=typed_query", // UNVR 9-11 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-13%20since%3A2019-08-11&src=typed_query", // UNVR 11-13 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-15%20since%3A2019-08-13&src=typed_query", // UNVR 13-15 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-17%20since%3A2019-08-15&src=typed_query", // UNVR 15-17 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-19%20since%3A2019-08-17&src=typed_query", // UNVR 17-19 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-21%20since%3A2019-08-19&src=typed_query", // UNVR 19-21 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-23%20since%3A2019-08-21&src=typed_query", // UNVR 21-23 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-25%20since%3A2019-08-23&src=typed_query", // UNVR 23-25 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-27%20since%3A2019-08-25&src=typed_query", // UNVR 25-27 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-31%20since%3A2019-08-27&src=typed_query", // UNVR 27-31 Agustus 2019

    // // september
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-03%20since%3A2019-09-01&src=typed_query", // UNVR 1-3 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-05%20since%3A2019-09-03&src=typed_query", // UNVR 3-5 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-07%20since%3A2019-09-05&src=typed_query", // UNVR 5-7 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-09%20since%3A2019-09-07&src=typed_query", // UNVR 7-9 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-11%20since%3A2019-09-09&src=typed_query", // UNVR 9-11 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-13%20since%3A2019-09-11&src=typed_query", // UNVR 11-13 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-15%20since%3A2019-09-13&src=typed_query", // UNVR 13-15 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-17%20since%3A2019-09-15&src=typed_query", // UNVR 15-17 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-19%20since%3A2019-09-17&src=typed_query", // UNVR 17-19 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-21%20since%3A2019-09-19&src=typed_query", // UNVR 19-21 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-23%20since%3A2019-09-21&src=typed_query", // UNVR 21-23 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-25%20since%3A2019-09-23&src=typed_query", // UNVR 23-25 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-27%20since%3A2019-09-25&src=typed_query", // UNVR 25-27 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-30%20since%3A2019-09-27&src=typed_query", // UNVR 27-30 September 2019

    // // oktober
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-03%20since%3A2019-10-01&src=typed_query", // UNVR 1-3 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-05%20since%3A2019-10-03&src=typed_query", // UNVR 3-5 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-07%20since%3A2019-10-05&src=typed_query", // UNVR 5-7 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-09%20since%3A2019-10-07&src=typed_query", // UNVR 7-9 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-11%20since%3A2019-10-09&src=typed_query", // UNVR 9-11 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-13%20since%3A2019-10-11&src=typed_query", // UNVR 11-13 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-15%20since%3A2019-10-13&src=typed_query", // UNVR 13-15 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-17%20since%3A2019-10-15&src=typed_query", // UNVR 15-17 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-19%20since%3A2019-10-17&src=typed_query", // UNVR 17-19 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-21%20since%3A2019-10-19&src=typed_query", // UNVR 19-21 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-23%20since%3A2019-10-21&src=typed_query", // UNVR 21-23 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-25%20since%3A2019-10-23&src=typed_query", // UNVR 23-25 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-27%20since%3A2019-10-25&src=typed_query", // UNVR 25-27 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-31%20since%3A2019-10-27&src=typed_query", // UNVR 27-31 Oktober 2019

    // // november
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-03%20since%3A2019-11-01&src=typed_query", // UNVR 1-3 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-05%20since%3A2019-11-03&src=typed_query", // UNVR 3-5 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-07%20since%3A2019-11-05&src=typed_query", // UNVR 5-7 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-09%20since%3A2019-11-07&src=typed_query", // UNVR 7-9 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-11%20since%3A2019-11-09&src=typed_query", // UNVR 9-11 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-13%20since%3A2019-11-11&src=typed_query", // UNVR 11-13 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-15%20since%3A2019-11-13&src=typed_query", // UNVR 13-15 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-17%20since%3A2019-11-15&src=typed_query", // UNVR 15-17 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-19%20since%3A2019-11-17&src=typed_query", // UNVR 17-19 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-21%20since%3A2019-11-19&src=typed_query", // UNVR 19-21 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-23%20since%3A2019-11-21&src=typed_query", // UNVR 21-23 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-25%20since%3A2019-11-23&src=typed_query", // UNVR 23-25 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-27%20since%3A2019-11-25&src=typed_query", // UNVR 25-27 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-30%20since%3A2019-11-27&src=typed_query", // UNVR 27-30 November 2019

    // // desember
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-03%20since%3A2019-12-01&src=typed_query", // UNVR 1-3 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-05%20since%3A2019-12-03&src=typed_query", // UNVR 3-5 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-07%20since%3A2019-12-05&src=typed_query", // UNVR 5-7 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-09%20since%3A2019-12-07&src=typed_query", // UNVR 7-9 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-11%20since%3A2019-12-09&src=typed_query", // UNVR 9-11 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-13%20since%3A2019-12-11&src=typed_query", // UNVR 11-13 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-15%20since%3A2019-12-13&src=typed_query", // UNVR 13-15 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-17%20since%3A2019-12-15&src=typed_query", // UNVR 15-17 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-19%20since%3A2019-12-17&src=typed_query", // UNVR 17-19 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-21%20since%3A2019-12-19&src=typed_query", // UNVR 19-21 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-23%20since%3A2019-12-21&src=typed_query", // UNVR 21-23 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-25%20since%3A2019-12-23&src=typed_query", // UNVR 23-25 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-27%20since%3A2019-12-25&src=typed_query", // UNVR 25-27 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-12-27&src=typed_query", // UNVR 27-31 Desember 2019

    // Latest
    // // januari
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-03%20since%3A2019-01-01&f=live&src=typed_query", // UNVR 1-3 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-05%20since%3A2019-01-03&f=live&src=typed_query", // UNVR 3-5 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-07%20since%3A2019-01-05&f=live&src=typed_query", // UNVR 5-7 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-09%20since%3A2019-01-07&f=live&src=typed_query", // UNVR 7-9 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-11%20since%3A2019-01-09&f=live&src=typed_query", // UNVR 9-11 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-13%20since%3A2019-01-11&f=live&src=typed_query", // UNVR 11-13 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-15%20since%3A2019-01-13&f=live&src=typed_query", // UNVR 13-15 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-17%20since%3A2019-01-15&f=live&src=typed_query", // UNVR 15-17 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-19%20since%3A2019-01-17&f=live&src=typed_query", // UNVR 17-19 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-21%20since%3A2019-01-19&f=live&src=typed_query", // UNVR 19-21 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-23%20since%3A2019-01-21&f=live&src=typed_query", // UNVR 21-23 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-25%20since%3A2019-01-23&f=live&src=typed_query", // UNVR 23-25 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-27%20since%3A2019-01-25&f=live&src=typed_query", // UNVR 25-27 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-29%20since%3A2019-01-27&f=live&src=typed_query", // UNVR 27-29 Januari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-01-31%20since%3A2019-01-29&f=live&src=typed_query", // UNVR 29-31 Januari 2019

    // // februari
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-03%20since%3A2019-02-01&src=typed_query&f=live", // UNVR 1-3 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-05%20since%3A2019-02-03&src=typed_query&f=live", // UNVR 3-5 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-07%20since%3A2019-02-05&src=typed_query&f=live", // UNVR 5-7 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-09%20since%3A2019-02-07&src=typed_query&f=live", // UNVR 7-9 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-11%20since%3A2019-02-09&src=typed_query&f=live", // UNVR 9-11 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-13%20since%3A2019-02-11&src=typed_query&f=live", // UNVR 11-13 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-15%20since%3A2019-02-13&src=typed_query&f=live", // UNVR 13-15 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-17%20since%3A2019-02-15&src=typed_query&f=live", // UNVR 15-17 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-19%20since%3A2019-02-17&src=typed_query&f=live", // UNVR 17-19 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-21%20since%3A2019-02-19&src=typed_query&f=live", // UNVR 19-21 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-23%20since%3A2019-02-21&src=typed_query&f=live", // UNVR 21-23 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-25%20since%3A2019-02-23&src=typed_query&f=live", // UNVR 23-25 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-27%20since%3A2019-02-25&src=typed_query&f=live", // UNVR 25-27 Februari 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-02-28%20since%3A2019-02-27&src=typed_query&f=live", // UNVR 27-28 Februari 2019

    // // maret
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-03%20since%3A2019-03-01&src=typed_query&f=live", // UNVR 1-3 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-05%20since%3A2019-03-03&src=typed_query&f=live", // UNVR 3-5 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-07%20since%3A2019-03-05&src=typed_query&f=live", // UNVR 5-7 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-09%20since%3A2019-03-07&src=typed_query&f=live", // UNVR 7-9 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-11%20since%3A2019-03-09&src=typed_query&f=live", // UNVR 9-11 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-13%20since%3A2019-03-11&src=typed_query&f=live", // UNVR 11-13 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-15%20since%3A2019-03-13&src=typed_query&f=live", // UNVR 13-15 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-17%20since%3A2019-03-15&src=typed_query&f=live", // UNVR 15-17 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-19%20since%3A2019-03-17&src=typed_query&f=live", // UNVR 17-19 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-21%20since%3A2019-03-19&src=typed_query&f=live", // UNVR 19-21 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-23%20since%3A2019-03-21&src=typed_query&f=live", // UNVR 21-23 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-25%20since%3A2019-03-23&src=typed_query&f=live", // UNVR 23-25 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-27%20since%3A2019-03-25&src=typed_query&f=live", // UNVR 25-27 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-29%20since%3A2019-03-27&src=typed_query&f=live", // UNVR 27-29 Maret 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-03-31%20since%3A2019-03-29&src=typed_query&f=live", // UNVR 29-31 Maret 2019

    // // april
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-03%20since%3A2019-04-01&src=typed_query&f=live", // UNVR 1-3 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-05%20since%3A2019-04-03&src=typed_query&f=live", // UNVR 3-5 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-07%20since%3A2019-04-05&src=typed_query&f=live", // UNVR 5-7 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-09%20since%3A2019-04-07&src=typed_query&f=live", // UNVR 7-9 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-11%20since%3A2019-04-09&src=typed_query&f=live", // UNVR 9-11 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-13%20since%3A2019-04-11&src=typed_query&f=live", // UNVR 11-13 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-15%20since%3A2019-04-13&src=typed_query&f=live", // UNVR 13-15 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-17%20since%3A2019-04-15&src=typed_query&f=live", // UNVR 15-17 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-19%20since%3A2019-04-17&src=typed_query&f=live", // UNVR 17-19 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-21%20since%3A2019-04-19&src=typed_query&f=live", // UNVR 19-21 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-23%20since%3A2019-04-21&src=typed_query&f=live", // UNVR 21-23 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-25%20since%3A2019-04-23&src=typed_query&f=live", // UNVR 23-25 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-27%20since%3A2019-04-25&src=typed_query&f=live", // UNVR 25-27 April 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-04-30%20since%3A2019-04-27&src=typed_query&f=live", // UNVR 27-30 April 2019

    // // mei
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-03%20since%3A2019-05-01&src=typed_query&f=live", // UNVR 1-3 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-05%20since%3A2019-05-03&src=typed_query&f=live", // UNVR 3-5 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-07%20since%3A2019-05-05&src=typed_query&f=live", // UNVR 5-7 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-09%20since%3A2019-05-07&src=typed_query&f=live", // UNVR 7-9 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-11%20since%3A2019-05-09&src=typed_query&f=live", // UNVR 9-11 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-13%20since%3A2019-05-11&src=typed_query&f=live", // UNVR 11-13 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-15%20since%3A2019-05-13&src=typed_query&f=live", // UNVR 13-15 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-17%20since%3A2019-05-15&src=typed_query&f=live", // UNVR 15-17 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-19%20since%3A2019-05-17&src=typed_query&f=live", // UNVR 17-19 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-21%20since%3A2019-05-19&src=typed_query&f=live", // UNVR 19-21 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-23%20since%3A2019-05-21&src=typed_query&f=live", // UNVR 21-23 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-25%20since%3A2019-05-23&src=typed_query&f=live", // UNVR 23-25 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-27%20since%3A2019-05-25&src=typed_query&f=live", // UNVR 25-27 Mei 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-05-31%20since%3A2019-05-27&src=typed_query&f=live", // UNVR 27-31 Mei 2019

    // // juni
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-03%20since%3A2019-06-01&src=typed_query&f=live", // UNVR 1-3 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-05%20since%3A2019-06-03&src=typed_query&f=live", // UNVR 3-5 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-07%20since%3A2019-06-05&src=typed_query&f=live", // UNVR 5-7 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-09%20since%3A2019-06-07&src=typed_query&f=live", // UNVR 7-9 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-11%20since%3A2019-06-09&src=typed_query&f=live", // UNVR 9-11 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-13%20since%3A2019-06-11&src=typed_query&f=live", // UNVR 11-13 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-15%20since%3A2019-06-13&src=typed_query&f=live", // UNVR 13-15 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-17%20since%3A2019-06-15&src=typed_query&f=live", // UNVR 15-17 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-19%20since%3A2019-06-17&src=typed_query&f=live", // UNVR 17-19 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-21%20since%3A2019-06-19&src=typed_query&f=live", // UNVR 19-21 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-23%20since%3A2019-06-21&src=typed_query&f=live", // UNVR 21-23 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-25%20since%3A2019-06-23&src=typed_query&f=live", // UNVR 23-25 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-27%20since%3A2019-06-25&src=typed_query&f=live", // UNVR 25-27 Juni 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-06-27&src=typed_query&f=live", // UNVR 27-30 Juni 2019

    // // juli
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-03%20since%3A2019-07-01&src=typed_query&f=live", // UNVR 1-3 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-05%20since%3A2019-07-03&src=typed_query&f=live", // UNVR 3-5 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-07%20since%3A2019-07-05&src=typed_query&f=live", // UNVR 5-7 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-09%20since%3A2019-07-07&src=typed_query&f=live", // UNVR 7-9 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-11%20since%3A2019-07-09&src=typed_query&f=live", // UNVR 9-11 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-13%20since%3A2019-07-11&src=typed_query&f=live", // UNVR 11-13 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-15%20since%3A2019-07-13&src=typed_query&f=live", // UNVR 13-15 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-17%20since%3A2019-07-15&src=typed_query&f=live", // UNVR 15-17 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-19%20since%3A2019-07-17&src=typed_query&f=live", // UNVR 17-19 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-21%20since%3A2019-07-19&src=typed_query&f=live", // UNVR 19-21 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-23%20since%3A2019-07-21&src=typed_query&f=live", // UNVR 21-23 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-25%20since%3A2019-07-23&src=typed_query&f=live", // UNVR 23-25 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-27%20since%3A2019-07-25&src=typed_query&f=live", // UNVR 25-27 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-29%20since%3A2019-07-27&src=typed_query&f=live", // UNVR 27-29 Juli 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-07-31%20since%3A2019-07-29&src=typed_query&f=live", // UNVR 29-31 Juli 2019

    // // agustus
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-03%20since%3A2019-08-01&src=typed_query&f=live", // UNVR 1-3 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-05%20since%3A2019-08-03&src=typed_query&f=live", // UNVR 3-5 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-07%20since%3A2019-08-05&src=typed_query&f=live", // UNVR 5-7 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-09%20since%3A2019-08-07&src=typed_query&f=live", // UNVR 7-9 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-11%20since%3A2019-08-09&src=typed_query&f=live", // UNVR 9-11 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-13%20since%3A2019-08-11&src=typed_query&f=live", // UNVR 11-13 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-15%20since%3A2019-08-13&src=typed_query&f=live", // UNVR 13-15 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-17%20since%3A2019-08-15&src=typed_query&f=live", // UNVR 15-17 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-19%20since%3A2019-08-17&src=typed_query&f=live", // UNVR 17-19 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-21%20since%3A2019-08-19&src=typed_query&f=live", // UNVR 19-21 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-23%20since%3A2019-08-21&src=typed_query&f=live", // UNVR 21-23 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-25%20since%3A2019-08-23&src=typed_query&f=live", // UNVR 23-25 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-27%20since%3A2019-08-25&src=typed_query&f=live", // UNVR 25-27 Agustus 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-08-31%20since%3A2019-08-27&src=typed_query&f=live", // UNVR 27-31 Agustus 2019

    // // september
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-03%20since%3A2019-09-01&src=typed_query&f=live", // UNVR 1-3 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-05%20since%3A2019-09-03&src=typed_query&f=live", // UNVR 3-5 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-07%20since%3A2019-09-05&src=typed_query&f=live", // UNVR 5-7 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-09%20since%3A2019-09-07&src=typed_query&f=live", // UNVR 7-9 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-11%20since%3A2019-09-09&src=typed_query&f=live", // UNVR 9-11 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-13%20since%3A2019-09-11&src=typed_query&f=live", // UNVR 11-13 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-15%20since%3A2019-09-13&src=typed_query&f=live", // UNVR 13-15 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-17%20since%3A2019-09-15&src=typed_query&f=live", // UNVR 15-17 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-19%20since%3A2019-09-17&src=typed_query&f=live", // UNVR 17-19 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-21%20since%3A2019-09-19&src=typed_query&f=live", // UNVR 19-21 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-23%20since%3A2019-09-21&src=typed_query&f=live", // UNVR 21-23 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-25%20since%3A2019-09-23&src=typed_query&f=live", // UNVR 23-25 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-27%20since%3A2019-09-25&src=typed_query&f=live", // UNVR 25-27 September 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-09-30%20since%3A2019-09-27&src=typed_query&f=live", // UNVR 27-30 September 2019
    
    // // oktober
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-03%20since%3A2019-10-01&src=typed_query&f=live", // UNVR 1-3 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-05%20since%3A2019-10-03&src=typed_query&f=live", // UNVR 3-5 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-07%20since%3A2019-10-05&src=typed_query&f=live", // UNVR 5-7 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-09%20since%3A2019-10-07&src=typed_query&f=live", // UNVR 7-9 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-11%20since%3A2019-10-09&src=typed_query&f=live", // UNVR 9-11 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-13%20since%3A2019-10-11&src=typed_query&f=live", // UNVR 11-13 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-15%20since%3A2019-10-13&src=typed_query&f=live", // UNVR 13-15 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-17%20since%3A2019-10-15&src=typed_query&f=live", // UNVR 15-17 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-19%20since%3A2019-10-17&src=typed_query&f=live", // UNVR 17-19 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-21%20since%3A2019-10-19&src=typed_query&f=live", // UNVR 19-21 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-23%20since%3A2019-10-21&src=typed_query&f=live", // UNVR 21-23 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-25%20since%3A2019-10-23&src=typed_query&f=live", // UNVR 23-25 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-27%20since%3A2019-10-25&src=typed_query&f=live", // UNVR 25-27 Oktober 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-10-31%20since%3A2019-10-27&src=typed_query&f=live", // UNVR 27-31 Oktober 2019

    // // november
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-03%20since%3A2019-11-01&src=typed_query&f=live", // UNVR 1-3 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-05%20since%3A2019-11-03&src=typed_query&f=live", // UNVR 3-5 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-07%20since%3A2019-11-05&src=typed_query&f=live", // UNVR 5-7 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-09%20since%3A2019-11-07&src=typed_query&f=live", // UNVR 7-9 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-11%20since%3A2019-11-09&src=typed_query&f=live", // UNVR 9-11 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-13%20since%3A2019-11-11&src=typed_query&f=live", // UNVR 11-13 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-15%20since%3A2019-11-13&src=typed_query&f=live", // UNVR 13-15 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-17%20since%3A2019-11-15&src=typed_query&f=live", // UNVR 15-17 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-19%20since%3A2019-11-17&src=typed_query&f=live", // UNVR 17-19 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-21%20since%3A2019-11-19&src=typed_query&f=live", // UNVR 19-21 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-23%20since%3A2019-11-21&src=typed_query&f=live", // UNVR 21-23 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-25%20since%3A2019-11-23&src=typed_query&f=live", // UNVR 23-25 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-27%20since%3A2019-11-25&src=typed_query&f=live", // UNVR 25-27 November 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-11-30%20since%3A2019-11-27&src=typed_query&f=live", // UNVR 27-30 November 2019

    // // desember
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-03%20since%3A2019-12-01&src=typed_query&f=live", // UNVR 1-3 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-05%20since%3A2019-12-03&src=typed_query&f=live", // UNVR 3-5 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-07%20since%3A2019-12-05&src=typed_query&f=live", // UNVR 5-7 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-09%20since%3A2019-12-07&src=typed_query&f=live", // UNVR 7-9 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-11%20since%3A2019-12-09&src=typed_query&f=live", // UNVR 9-11 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-13%20since%3A2019-12-11&src=typed_query&f=live", // UNVR 11-13 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-15%20since%3A2019-12-13&src=typed_query&f=live", // UNVR 13-15 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-17%20since%3A2019-12-15&src=typed_query&f=live", // UNVR 15-17 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-19%20since%3A2019-12-17&src=typed_query&f=live", // UNVR 17-19 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-21%20since%3A2019-12-19&src=typed_query&f=live", // UNVR 19-21 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-23%20since%3A2019-12-21&src=typed_query&f=live", // UNVR 21-23 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-25%20since%3A2019-12-23&src=typed_query&f=live", // UNVR 23-25 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-27%20since%3A2019-12-25&src=typed_query&f=live", // UNVR 25-27 Desember 2019
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-12-27&src=typed_query&f=live", // UNVR 27-31 Desember 2019

    // UNVR 2023
    // Kata Kunci : UNVR
    // top
    // // januari 
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-03%20since%3A2023-01-01&src=typed_query", // UNVR 1-3 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-05%20since%3A2023-01-03&src=typed_query", // UNVR 3-5 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-07%20since%3A2023-01-05&src=typed_query", // UNVR 5-7 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-09%20since%3A2023-01-07&src=typed_query", // UNVR 7-9 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-11%20since%3A2023-01-09&src=typed_query", // UNVR 9-11 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-13%20since%3A2023-01-11&src=typed_query", // UNVR 11-13 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-15%20since%3A2023-01-13&src=typed_query", // UNVR 13-15 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-17%20since%3A2023-01-15&src=typed_query", // UNVR 15-17 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-19%20since%3A2023-01-17&src=typed_query", // UNVR 17-19Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-21%20since%3A2023-01-19&src=typed_query", // UNVR 19-21 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-23%20since%3A2023-01-21&src=typed_query", // UNVR 21-23 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-25%20since%3A2023-01-23&src=typed_query", // UNVR 23-25 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-27%20since%3A2023-01-25&src=typed_query", // UNVR 25-27 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-31%20since%3A2023-01-27&src=typed_query", // UNVR 27-31 Januari 2023

    // // februari
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-03%20since%3A2023-02-01&src=typed_query", // UNVR 1-3 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-05%20since%3A2023-02-03&src=typed_query", // UNVR 3-5 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-07%20since%3A2023-02-05&src=typed_query", // UNVR 5-7 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-09%20since%3A2023-02-07&src=typed_query", // UNVR 7-9 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-11%20since%3A2023-02-09&src=typed_query", // UNVR 9-11 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-13%20since%3A2023-02-11&src=typed_query", // UNVR 11-13 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-15%20since%3A2023-02-13&src=typed_query", // UNVR 13-15 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-17%20since%3A2023-02-15&src=typed_query", // UNVR 15-17 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-19%20since%3A2023-02-17&src=typed_query", // UNVR 17-19Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-21%20since%3A2023-02-19&src=typed_query", // UNVR 19-21 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-23%20since%3A2023-02-21&src=typed_query", // UNVR 21-23 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-25%20since%3A2023-02-23&src=typed_query", // UNVR 23-25 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-27%20since%3A2023-02-25&src=typed_query", // UNVR 25-27 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-27&src=typed_query", // UNVR 27-28 Januari 2023

    // // maret
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-03%20since%3A2023-03-01&src=typed_query", // UNVR 1-3 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-05%20since%3A2023-03-03&src=typed_query", // UNVR 3-5 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-07%20since%3A2023-03-05&src=typed_query", // UNVR 5-7 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-09%20since%3A2023-03-07&src=typed_query", // UNVR 7-9 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-11%20since%3A2023-03-09&src=typed_query", // UNVR 9-11 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-13%20since%3A2023-03-11&src=typed_query", // UNVR 11-13 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-15%20since%3A2023-03-13&src=typed_query", // UNVR 13-15 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-17%20since%3A2023-03-15&src=typed_query", // UNVR 15-17 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-19%20since%3A2023-03-17&src=typed_query", // UNVR 17-19 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-21%20since%3A2023-03-19&src=typed_query", // UNVR 19-21 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-23%20since%3A2023-03-21&src=typed_query", // UNVR 21-23 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-25%20since%3A2023-03-23&src=typed_query", // UNVR 23-25 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-27%20since%3A2023-03-25&src=typed_query", // UNVR 25-27 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-27&src=typed_query", // UNVR 27-31 Maret 2023

    // // april
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-03%20since%3A2023-04-01&src=typed_query", // UNVR 1-3 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-05%20since%3A2023-04-03&src=typed_query", // UNVR 3-5 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-07%20since%3A2023-04-05&src=typed_query", // UNVR 5-7 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-09%20since%3A2023-04-07&src=typed_query", // UNVR 7-9 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-11%20since%3A2023-04-09&src=typed_query", // UNVR 9-11 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-13%20since%3A2023-04-11&src=typed_query", // UNVR 11-13 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-15%20since%3A2023-04-13&src=typed_query", // UNVR 13-15 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-17%20since%3A2023-04-15&src=typed_query", // UNVR 15-17 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-19%20since%3A2023-04-17&src=typed_query", // UNVR 17-19 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-21%20since%3A2023-04-19&src=typed_query", // UNVR 19-21 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-23%20since%3A2023-04-21&src=typed_query", // UNVR 21-23 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-25%20since%3A2023-04-23&src=typed_query", // UNVR 23-25 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-27%20since%3A2023-04-25&src=typed_query", // UNVR 25-27 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-27&src=typed_query", // UNVR 27-30 April 2023

    // // mei
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-03%20since%3A2023-05-01&src=typed_query", // UNVR 1-3 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-05%20since%3A2023-05-03&src=typed_query", // UNVR 3-5 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-07%20since%3A2023-05-05&src=typed_query", // UNVR 5-7 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-09%20since%3A2023-05-07&src=typed_query", // UNVRT 7-9 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-11%20since%3A2023-05-09&src=typed_query", // UNVR 9-11 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-13%20since%3A2023-05-11&src=typed_query", // UNVR 11-13 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-15%20since%3A2023-05-13&src=typed_query", // UNVR 13-15 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-17%20since%3A2023-05-15&src=typed_query", // UNVR 15-17 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-19%20since%3A2023-05-17&src=typed_query", // UNVR 17-19 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-21%20since%3A2023-05-19&src=typed_query", // UNVR 19-21 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-23%20since%3A2023-05-21&src=typed_query", // UNVR 21-23 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-25%20since%3A2023-05-23&src=typed_query", // UNVR 23-25 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-27%20since%3A2023-05-25&src=typed_query", // UNVR 25-27 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-27&src=typed_query", // UNVR 27-31 Mei 2023

    // // juni
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-03%20since%3A2023-06-01&src=typed_query", // UNVR 1-3 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-05%20since%3A2023-06-03&src=typed_query", // UNVR 3-5 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-07%20since%3A2023-06-05&src=typed_query", // UNVR 5-7 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-09%20since%3A2023-06-07&src=typed_query", // UNVR 7-9 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-11%20since%3A2023-06-09&src=typed_query", // UNVR 9-11 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-13%20since%3A2023-06-11&src=typed_query", // UNVR 11-13 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-15%20since%3A2023-06-13&src=typed_query", // UNVR 13-15 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-17%20since%3A2023-06-15&src=typed_query", // UNVR 15-17 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-19%20since%3A2023-06-17&src=typed_query", // UNVR 17-19 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-21%20since%3A2023-06-19&src=typed_query", // UNVR 19-21 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-23%20since%3A2023-06-21&src=typed_query", // UNVR 21-23 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-25%20since%3A2023-06-23&src=typed_query", // UNVR 23-25 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-27%20since%3A2023-06-25&src=typed_query", // UNVR 25-27 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-27&src=typed_query", // UNVR 27-30 Juni 2023

    // // juli
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-03%20since%3A2023-07-01&src=typed_query", // UNVR 1-3 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-05%20since%3A2023-07-03&src=typed_query", // UNVR 3-5 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-07%20since%3A2023-07-05&src=typed_query", // UNVR 5-7 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-09%20since%3A2023-07-07&src=typed_query", // UNVR 7-9 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-11%20since%3A2023-07-09&src=typed_query", // UNVR 9-11 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-13%20since%3A2023-07-11&src=typed_query", // UNVR 11-13 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-15%20since%3A2023-07-13&src=typed_query", // UNVR 13-15 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-17%20since%3A2023-07-15&src=typed_query", // UNVR 15-17 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-19%20since%3A2023-07-17&src=typed_query", // UNVR 17-19 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-21%20since%3A2023-07-19&src=typed_query", // UNVR 19-21 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-23%20since%3A2023-07-21&src=typed_query", // UNVR 21-23 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-25%20since%3A2023-07-23&src=typed_query", // UNVR 23-25 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-27%20since%3A2023-07-25&src=typed_query", // UNVR 25-27 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-27&src=typed_query", // UNVR 27-31 Juli 2023

    // // agustus
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-03%20since%3A2023-08-01&src=typed_query", // UNVR 1-3 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-05%20since%3A2023-08-03&src=typed_query", // UNVR 3-5 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-07%20since%3A2023-08-05&src=typed_query", // UNVR 5-7 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-09%20since%3A2023-08-07&src=typed_query", // UNVR 7-9 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-11%20since%3A2023-08-09&src=typed_query", // UNVR 9-11 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-13%20since%3A2023-08-11&src=typed_query", // UNVR 11-13 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-15%20since%3A2023-08-13&src=typed_query", // UNVR 13-15 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-17%20since%3A2023-08-15&src=typed_query", // UNVR 15-17 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-19%20since%3A2023-08-17&src=typed_query", // UNVR 17-19 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-21%20since%3A2023-08-19&src=typed_query", // UNVR 19-21 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-23%20since%3A2023-08-21&src=typed_query", // UNVR 21-23 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-25%20since%3A2023-08-23&src=typed_query", // UNVR 23-25 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-27%20since%3A2023-08-25&src=typed_query", // UNVR 25-27 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-31%20since%3A2023-08-27&src=typed_query", // UNVR 27-31 Agustus 2023

    // // september
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-03%20since%3A2023-09-01&src=typed_query", // UNVR 1-3 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-05%20since%3A2023-09-03&src=typed_query", // UNVR 3-5 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-07%20since%3A2023-09-05&src=typed_query", // UNVR 5-7 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-09%20since%3A2023-09-07&src=typed_query", // UNVR 7-9 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-11%20since%3A2023-09-09&src=typed_query", // UNVR 9-11 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-13%20since%3A2023-09-11&src=typed_query", // UNVR 11-13 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-15%20since%3A2023-09-13&src=typed_query", // UNVR 13-15 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-17%20since%3A2023-09-15&src=typed_query", // UNVR 15-17 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-19%20since%3A2023-09-17&src=typed_query", // UNVR 17-19 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-21%20since%3A2023-09-19&src=typed_query", // UNVR 19-21 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-23%20since%3A2023-09-21&src=typed_query", // UNVR 21-23 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-25%20since%3A2023-09-23&src=typed_query", // UNVR 23-25 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-27%20since%3A2023-09-25&src=typed_query", // UNVR 25-27 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-27&src=typed_query", // UNVR 27-30 September 2023

    // // oktober
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-03%20since%3A2023-10-01&src=typed_query", // UNVR 1-3 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-05%20since%3A2023-10-03&src=typed_query", // UNVR 3-5 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-07%20since%3A2023-10-05&src=typed_query", // UNVR 5-7 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-09%20since%3A2023-10-07&src=typed_query", // UNVR 7-9 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-11%20since%3A2023-10-09&src=typed_query", // UNVR 9-11 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-13%20since%3A2023-10-11&src=typed_query", // UNVR 11-13 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-15%20since%3A2023-10-13&src=typed_query", // UNVR 13-15 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-17%20since%3A2023-10-15&src=typed_query", // UNVR 15-17 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-19%20since%3A2023-10-17&src=typed_query", // UNVR 17-19 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-21%20since%3A2023-10-19&src=typed_query", // UNVR 19-21 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-23%20since%3A2023-10-21&src=typed_query", // UNVR 21-23 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-25%20since%3A2023-10-23&src=typed_query", // UNVR 23-25 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-27%20since%3A2023-10-25&src=typed_query", // UNVR 25-27 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-27&src=typed_query", // UNVR 27-31 Oktober 2023

    // // november
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-03%20since%3A2023-11-01&src=typed_query", // UNVR 1-3 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-05%20since%3A2023-11-03&src=typed_query", // UNVR 3-5 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-07%20since%3A2023-11-05&src=typed_query", // UNVR 5-7 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-09%20since%3A2023-11-07&src=typed_query", // UNVR 7-9 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-11%20since%3A2023-11-09&src=typed_query", // UNVR 9-11 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-13%20since%3A2023-11-11&src=typed_query", // UNVR 11-13 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-15%20since%3A2023-11-13&src=typed_query", // UNVR 13-15 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-17%20since%3A2023-11-15&src=typed_query", // UNVR 15-17 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-19%20since%3A2023-11-17&src=typed_query", // UNVR 17-19 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-21%20since%3A2023-11-19&src=typed_query", // UNVR 19-21 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-23%20since%3A2023-11-21&src=typed_query", // UNVR 21-23 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-25%20since%3A2023-11-23&src=typed_query", // UNVR 23-25 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-27%20since%3A2023-11-25&src=typed_query", // UNVR 25-27 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-27&src=typed_query", // UNVR 27-30 November 2023

    // // desember
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-03%20since%3A2023-12-01&src=typed_query", // UNVR 1-3 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-05%20since%3A2023-12-03&src=typed_query", // UNVR 3-5 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-07%20since%3A2023-12-05&src=typed_query", // UNVR 5-7 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-09%20since%3A2023-12-07&src=typed_query", // UNVR 7-9 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-11%20since%3A2023-12-09&src=typed_query", // UNVR 9-11 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-13%20since%3A2023-12-11&src=typed_query", // UNVR 11-13 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-15%20since%3A2023-12-13&src=typed_query", // UNVR 13-15 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-17%20since%3A2023-12-15&src=typed_query", // UNVR 15-17 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-19%20since%3A2023-12-17&src=typed_query", // UNVR 17-19 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-21%20since%3A2023-12-19&src=typed_query", // UNVR 19-21 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-23%20since%3A2023-12-21&src=typed_query", // UNVR 21-23 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-25%20since%3A2023-12-23&src=typed_query", // UNVR 23-25 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-27%20since%3A2023-12-25&src=typed_query", // UNVR 25-27 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-27&src=typed_query", // UNVR 27-31 Desember 2023

    // latest
    // // januari
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-03%20since%3A2023-01-01&src=typed_query&f=live", // UNVR 1-3 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-05%20since%3A2023-01-03&src=typed_query&f=live", // UNVR 3-5 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-07%20since%3A2023-01-05&src=typed_query&f=live", // UNVR 5-7 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-09%20since%3A2023-01-07&src=typed_query&f=live", // UNVR 7-9 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-11%20since%3A2023-01-09&src=typed_query&f=live", // UNVR 9-11 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-13%20since%3A2023-01-11&src=typed_query&f=live", // UNVR 11-13 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-15%20since%3A2023-01-13&src=typed_query&f=live", // UNVR 13-15 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-17%20since%3A2023-01-15&src=typed_query&f=live", // UNVR 15-17 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-19%20since%3A2023-01-17&src=typed_query&f=live", // UNVR 17-19 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-21%20since%3A2023-01-19&src=typed_query&f=live", // UNVR 19-21 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-23%20since%3A2023-01-21&src=typed_query&f=live", // UNVR 21-23 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-25%20since%3A2023-01-23&src=typed_query&f=live", // UNVR 23-25 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-27%20since%3A2023-01-25&src=typed_query&f=live", // UNVR 25-27 Januari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-01-31%20since%3A2023-01-27&src=typed_query&f=live", // UNVR 27-31 Januari 2023

    // // februari
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-03%20since%3A2023-02-01&src=typed_query&f=live", // UNVR 1-3 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-05%20since%3A2023-02-03&src=typed_query&f=live", // UNVR 3-5 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-07%20since%3A2023-02-05&src=typed_query&f=live", // UNVR 5-7 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-09%20since%3A2023-02-07&src=typed_query&f=live", // UNVR 7-9 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-11%20since%3A2023-02-09&src=typed_query&f=live", // UNVR 9-11 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-13%20since%3A2023-02-11&src=typed_query&f=live", // UNVR 11-13 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-15%20since%3A2023-02-13&src=typed_query&f=live", // UNVR 13-15 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-17%20since%3A2023-02-15&src=typed_query&f=live", // UNVR 15-17 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-19%20since%3A2023-02-17&src=typed_query&f=live", // UNVR 17-19 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-21%20since%3A2023-02-19&src=typed_query&f=live", // UNVR 19-21 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-23%20since%3A2023-02-21&src=typed_query&f=live", // UNVR 21-23 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-25%20since%3A2023-02-23&src=typed_query&f=live", // UNVR 23-25 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-27%20since%3A2023-02-25&src=typed_query&f=live", // UNVR 25-27 Februari 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-27&src=typed_query&f=live", // UNVR 27-28 Februari 2023

    // // maret
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-03%20since%3A2023-03-01&src=typed_query&f=live", // UNVR 1-3 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-05%20since%3A2023-03-03&src=typed_query&f=live", // UNVR 3-5 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-07%20since%3A2023-03-05&src=typed_query&f=live", // UNVR 5-7 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-09%20since%3A2023-03-07&src=typed_query&f=live", // UNVR 7-9 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-11%20since%3A2023-03-09&src=typed_query&f=live", // UNVR 9-11 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-13%20since%3A2023-03-11&src=typed_query&f=live", // UNVR 11-13 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-15%20since%3A2023-03-13&src=typed_query&f=live", // UNVR 13-15 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-17%20since%3A2023-03-15&src=typed_query&f=live", // UNVR 15-17 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-19%20since%3A2023-03-17&src=typed_query&f=live", // UNVR 17-19 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-21%20since%3A2023-03-19&src=typed_query&f=live", // UNVR 19-21 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-23%20since%3A2023-03-21&src=typed_query&f=live", // UNVR 21-23 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-25%20since%3A2023-03-23&src=typed_query&f=live", // UNVR 23-25 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-27%20since%3A2023-03-25&src=typed_query&f=live", // UNVR 25-27 Maret 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-27&src=typed_query&f=live", // UNVR 27-31 Maret 2023

    // // april
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-03%20since%3A2023-04-01&src=typed_query&f=live", // UNVR 1-3 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-05%20since%3A2023-04-03&src=typed_query&f=live", // UNVR 3-5 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-07%20since%3A2023-04-05&src=typed_query&f=live", // UNVR 5-7 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-09%20since%3A2023-04-07&src=typed_query&f=live", // UNVR 7-9 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-11%20since%3A2023-04-09&src=typed_query&f=live", // UNVR 9-11 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-13%20since%3A2023-04-11&src=typed_query&f=live", // UNVR 11-13 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-15%20since%3A2023-04-13&src=typed_query&f=live", // UNVR 13-15 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-17%20since%3A2023-04-15&src=typed_query&f=live", // UNVR 15-17 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-19%20since%3A2023-04-17&src=typed_query&f=live", // UNVR 17-19 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-21%20since%3A2023-04-19&src=typed_query&f=live", // UNVR 19-21 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-23%20since%3A2023-04-21&src=typed_query&f=live", // UNVR 21-23 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-25%20since%3A2023-04-23&src=typed_query&f=live", // UNVR 23-25 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-27%20since%3A2023-04-25&src=typed_query&f=live", // UNVR 25-27 April 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-27&src=typed_query&f=live", // UNVR 27-30 April 2023

    // // mei
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-03%20since%3A2023-05-01&src=typed_query&f=live", // UNVR 1-3 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-05%20since%3A2023-05-03&src=typed_query&f=live", // UNVR 3-5 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-07%20since%3A2023-05-05&src=typed_query&f=live", // UNVR 5-7 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-09%20since%3A2023-05-07&src=typed_query&f=live", // UNVR 7-9 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-11%20since%3A2023-05-09&src=typed_query&f=live", // UNVR 9-11 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-13%20since%3A2023-05-11&src=typed_query&f=live", // UNVR 11-13 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-15%20since%3A2023-05-13&src=typed_query&f=live", // UNVR 13-15 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-17%20since%3A2023-05-15&src=typed_query&f=live", // UNVR 15-17 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-19%20since%3A2023-05-17&src=typed_query&f=live", // UNVR 17-19 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-21%20since%3A2023-05-19&src=typed_query&f=live", // UNVR 19-21 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-23%20since%3A2023-05-21&src=typed_query&f=live", // UNVR 21-23 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-25%20since%3A2023-05-23&src=typed_query&f=live", // UNVR 23-25 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-27%20since%3A2023-05-25&src=typed_query&f=live", // UNVR 25-27 Mei 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-27&src=typed_query&f=live", // UNVR 27-31 Mei 2023

    // // juni
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-03%20since%3A2023-06-01&src=typed_query&f=live", // UNVR 1-3 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-05%20since%3A2023-06-03&src=typed_query&f=live", // UNVR 3-5 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-07%20since%3A2023-06-05&src=typed_query&f=live", // UNVR 5-7 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-09%20since%3A2023-06-07&src=typed_query&f=live", // UNVR 7-9 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-11%20since%3A2023-06-09&src=typed_query&f=live", // UNVR 9-11 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-13%20since%3A2023-06-11&src=typed_query&f=live", // UNVR 11-13 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-15%20since%3A2023-06-13&src=typed_query&f=live", // UNVR 13-15 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-17%20since%3A2023-06-15&src=typed_query&f=live", // UNVR 15-17 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-19%20since%3A2023-06-17&src=typed_query&f=live", // UNVR 17-19 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-21%20since%3A2023-06-19&src=typed_query&f=live", // UNVR 19-21 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-23%20since%3A2023-06-21&src=typed_query&f=live", // UNVR 21-23 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-25%20since%3A2023-06-23&src=typed_query&f=live", // UNVR 23-25 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-27%20since%3A2023-06-25&src=typed_query&f=live", // UNVR 25-27 Juni 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-27&src=typed_query&f=live", // UNVR 27-30 Juni 2023

    // // juli
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-03%20since%3A2023-07-01&src=typed_query&f=live", // UNVR 1-3 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-05%20since%3A2023-07-03&src=typed_query&f=live", // UNVR 3-5 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-07%20since%3A2023-07-05&src=typed_query&f=live", // UNVR 5-7 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-09%20since%3A2023-07-07&src=typed_query&f=live", // UNVR 7-9 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-11%20since%3A2023-07-09&src=typed_query&f=live", // UNVR 9-11 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-13%20since%3A2023-07-11&src=typed_query&f=live", // UNVR 11-13 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-15%20since%3A2023-07-13&src=typed_query&f=live", // UNVR 13-15 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-17%20since%3A2023-07-15&src=typed_query&f=live", // UNVR 15-17 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-19%20since%3A2023-07-17&src=typed_query&f=live", // UNVR 17-19 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-21%20since%3A2023-07-19&src=typed_query&f=live", // UNVR 19-21 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-23%20since%3A2023-07-21&src=typed_query&f=live", // UNVR 21-23 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-25%20since%3A2023-07-23&src=typed_query&f=live", // UNVR 23-25 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-27%20since%3A2023-07-25&src=typed_query&f=live", // UNVR 25-27 Juli 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-27&src=typed_query&f=live", // UNVR 27-31 Juli 2023

    // // agustus
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-03%20since%3A2023-08-01&src=typed_query&f=live", // UNVR 1-3 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-05%20since%3A2023-08-03&src=typed_query&f=live", // UNVR 3-5 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-07%20since%3A2023-08-05&src=typed_query&f=live", // UNVR 5-7 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-09%20since%3A2023-08-07&src=typed_query&f=live", // UNVR 7-9 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-11%20since%3A2023-08-09&src=typed_query&f=live", // UNVR 9-11 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-13%20since%3A2023-08-11&src=typed_query&f=live", // UNVR 11-13 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-15%20since%3A2023-08-13&src=typed_query&f=live", // UNVR 13-15 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-17%20since%3A2023-08-15&src=typed_query&f=live", // UNVR 15-17 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-19%20since%3A2023-08-17&src=typed_query&f=live", // UNVR 17-19 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-21%20since%3A2023-08-19&src=typed_query&f=live", // UNVR 19-21 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-23%20since%3A2023-08-21&src=typed_query&f=live", // UNVR 21-23 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-25%20since%3A2023-08-23&src=typed_query&f=live", // UNVR 23-25 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-27%20since%3A2023-08-25&src=typed_query&f=live", // UNVR 25-27 Agustus 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-08-30%20since%3A2023-08-27&src=typed_query&f=live", // UNVR 27-30 Agustus 2023

    // // september
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-03%20since%3A2023-09-01&src=typed_query&f=live", // UNVR 1-3 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-05%20since%3A2023-09-03&src=typed_query&f=live", // UNVR 3-5 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-07%20since%3A2023-09-05&src=typed_query&f=live", // UNVR 5-7 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-09%20since%3A2023-09-07&src=typed_query&f=live", // UNVR 7-9 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-11%20since%3A2023-09-09&src=typed_query&f=live", // UNVR 9-11 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-13%20since%3A2023-09-11&src=typed_query&f=live", // UNVR 11-13 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-15%20since%3A2023-09-13&src=typed_query&f=live", // UNVR 13-15 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-17%20since%3A2023-09-15&src=typed_query&f=live", // UNVR 15-17 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-19%20since%3A2023-09-17&src=typed_query&f=live", // UNVR 17-19 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-21%20since%3A2023-09-19&src=typed_query&f=live", // UNVR 19-21 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-23%20since%3A2023-09-21&src=typed_query&f=live", // UNVR 21-23 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-25%20since%3A2023-09-23&src=typed_query&f=live", // UNVR 23-25 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-27%20since%3A2023-09-25&src=typed_query&f=live", // UNVR 25-27 September 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-27&src=typed_query&f=live", // UNVR 27-30 September 2023

    // // oktober
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-03%20since%3A2023-10-01&src=typed_query&f=live", // UNVR 1-3 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-05%20since%3A2023-10-03&src=typed_query&f=live", // UNVR 3-5 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-07%20since%3A2023-10-05&src=typed_query&f=live", // UNVR 5-7 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-09%20since%3A2023-10-07&src=typed_query&f=live", // UNVR 7-9 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-11%20since%3A2023-10-09&src=typed_query&f=live", // UNVR 9-11 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-13%20since%3A2023-10-11&src=typed_query&f=live", // UNVR 11-13 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-15%20since%3A2023-10-13&src=typed_query&f=live", // UNVR 13-15 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-17%20since%3A2023-10-15&src=typed_query&f=live", // UNVR 15-17 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-19%20since%3A2023-10-17&src=typed_query&f=live", // UNVR 17-19 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-21%20since%3A2023-10-19&src=typed_query&f=live", // UNVR 19-21 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-23%20since%3A2023-10-21&src=typed_query&f=live", // UNVR 21-23 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-25%20since%3A2023-10-23&src=typed_query&f=live", // UNVR 23-25 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-27%20since%3A2023-10-25&src=typed_query&f=live", // UNVR 25-27 Oktober 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-27&src=typed_query&f=live", // UNVR 27-31 Oktober 2023

    // // november
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-03%20since%3A2023-11-01&src=typed_query&f=live", // UNVR 1-3 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-05%20since%3A2023-11-03&src=typed_query&f=live", // UNVR 3-5 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-07%20since%3A2023-11-05&src=typed_query&f=live", // UNVR 5-7 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-09%20since%3A2023-11-07&src=typed_query&f=live", // UNVR 7-9 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-11%20since%3A2023-11-09&src=typed_query&f=live", // UNVR 9-11 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-13%20since%3A2023-11-11&src=typed_query&f=live", // UNVR 11-13 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-15%20since%3A2023-11-13&src=typed_query&f=live", // UNVR 13-15 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-17%20since%3A2023-11-15&src=typed_query&f=live", // UNVR 15-17 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-19%20since%3A2023-11-17&src=typed_query&f=live", // UNVR 17-19 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-21%20since%3A2023-11-19&src=typed_query&f=live", // UNVR 19-21 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-23%20since%3A2023-11-21&src=typed_query&f=live", // UNVR 21-23 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-25%20since%3A2023-11-23&src=typed_query&f=live", // UNVR 23-25 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-27%20since%3A2023-11-25&src=typed_query&f=live", // UNVR 25-27 November 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-27&src=typed_query&f=live", // UNVR 27-30 November 2023

    // // desember
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-03%20since%3A2023-12-01&src=typed_query&f=live", // UNVR 1-3 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-05%20since%3A2023-12-03&src=typed_query&f=live", // UNVR 3-5 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-07%20since%3A2023-12-05&src=typed_query&f=live", // UNVR 5-7 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-09%20since%3A2023-12-07&src=typed_query&f=live", // UNVR 7-9 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-11%20since%3A2023-12-09&src=typed_query&f=live", // UNVR 9-11 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-13%20since%3A2023-12-11&src=typed_query&f=live", // UNVR 11-13 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-15%20since%3A2023-12-13&src=typed_query&f=live", // UNVR 13-15 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-17%20since%3A2023-12-15&src=typed_query&f=live", // UNVR 15-17 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-19%20since%3A2023-12-17&src=typed_query&f=live", // UNVR 17-19 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-21%20since%3A2023-12-19&src=typed_query&f=live", // UNVR 19-21 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-23%20since%3A2023-12-21&src=typed_query&f=live", // UNVR 21-23 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-25%20since%3A2023-12-23&src=typed_query&f=live", // UNVR 23-25 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-27%20since%3A2023-12-25&src=typed_query&f=live", // UNVR 25-27 Desember 2023
    // "https://x.com/search?q=UNVR%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-27&src=typed_query&f=live", // UNVR 27-31 Desember 2023

    // Kata Kunci : #UNVR
    // Top
    // // januari 
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-03%20since%3A2023-01-01&src=typed_query", // UNVR 1-3 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-05%20since%3A2023-01-03&src=typed_query", // UNVR 3-5 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-07%20since%3A2023-01-05&src=typed_query", // UNVR 5-7 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-09%20since%3A2023-01-07&src=typed_query", // UNVR 7-9 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-11%20since%3A2023-01-09&src=typed_query", // UNVR 9-11 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-13%20since%3A2023-01-11&src=typed_query", // UNVR 11-13 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-15%20since%3A2023-01-13&src=typed_query", // UNVR 13-15 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-17%20since%3A2023-01-15&src=typed_query", // UNVR 15-17 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-19%20since%3A2023-01-17&src=typed_query", // UNVR 17-19Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-21%20since%3A2023-01-19&src=typed_query", // UNVR 19-21 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-23%20since%3A2023-01-21&src=typed_query", // UNVR 21-23 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-25%20since%3A2023-01-23&src=typed_query", // UNVR 23-25 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-27%20since%3A2023-01-25&src=typed_query", // UNVR 25-27 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-31%20since%3A2023-01-27&src=typed_query", // UNVR 27-31 Januari 2023

    // // februari
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-03%20since%3A2023-02-01&src=typed_query", // UNVR 1-3 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-05%20since%3A2023-02-03&src=typed_query", // UNVR 3-5 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-07%20since%3A2023-02-05&src=typed_query", // UNVR 5-7 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-09%20since%3A2023-02-07&src=typed_query", // UNVR 7-9 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-11%20since%3A2023-02-09&src=typed_query", // UNVR 9-11 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-13%20since%3A2023-02-11&src=typed_query", // UNVR 11-13 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-15%20since%3A2023-02-13&src=typed_query", // UNVR 13-15 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-17%20since%3A2023-02-15&src=typed_query", // UNVR 15-17 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-19%20since%3A2023-02-17&src=typed_query", // UNVR 17-19Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-21%20since%3A2023-02-19&src=typed_query", // UNVR 19-21 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-23%20since%3A2023-02-21&src=typed_query", // UNVR 21-23 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-25%20since%3A2023-02-23&src=typed_query", // UNVR 23-25 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-27%20since%3A2023-02-25&src=typed_query", // UNVR 25-27 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-27&src=typed_query", // UNVR 27-28 Januari 2023

    // // maret
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-03%20since%3A2023-03-01&src=typed_query", // UNVR 1-3 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-05%20since%3A2023-03-03&src=typed_query", // UNVR 3-5 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-07%20since%3A2023-03-05&src=typed_query", // UNVR 5-7 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-09%20since%3A2023-03-07&src=typed_query", // UNVR 7-9 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-11%20since%3A2023-03-09&src=typed_query", // UNVR 9-11 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-13%20since%3A2023-03-11&src=typed_query", // UNVR 11-13 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-15%20since%3A2023-03-13&src=typed_query", // UNVR 13-15 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-17%20since%3A2023-03-15&src=typed_query", // UNVR 15-17 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-19%20since%3A2023-03-17&src=typed_query", // UNVR 17-19 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-21%20since%3A2023-03-19&src=typed_query", // UNVR 19-21 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-23%20since%3A2023-03-21&src=typed_query", // UNVR 21-23 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-25%20since%3A2023-03-23&src=typed_query", // UNVR 23-25 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-27%20since%3A2023-03-25&src=typed_query", // UNVR 25-27 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-27&src=typed_query", // UNVR 27-31 Maret 2023

    // // april
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-03%20since%3A2023-04-01&src=typed_query", // UNVR 1-3 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-05%20since%3A2023-04-03&src=typed_query", // UNVR 3-5 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-07%20since%3A2023-04-05&src=typed_query", // UNVR 5-7 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-09%20since%3A2023-04-07&src=typed_query", // UNVR 7-9 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-11%20since%3A2023-04-09&src=typed_query", // UNVR 9-11 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-13%20since%3A2023-04-11&src=typed_query", // UNVR 11-13 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-15%20since%3A2023-04-13&src=typed_query", // UNVR 13-15 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-17%20since%3A2023-04-15&src=typed_query", // UNVR 15-17 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-19%20since%3A2023-04-17&src=typed_query", // UNVR 17-19 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-21%20since%3A2023-04-19&src=typed_query", // UNVR 19-21 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-23%20since%3A2023-04-21&src=typed_query", // UNVR 21-23 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-25%20since%3A2023-04-23&src=typed_query", // UNVR 23-25 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-27%20since%3A2023-04-25&src=typed_query", // UNVR 25-27 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-27&src=typed_query", // UNVR 27-30 April 2023

    // // mei
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-03%20since%3A2023-05-01&src=typed_query", // UNVR 1-3 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-05%20since%3A2023-05-03&src=typed_query", // UNVR 3-5 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-07%20since%3A2023-05-05&src=typed_query", // UNVR 5-7 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-09%20since%3A2023-05-07&src=typed_query", // UNVRT 7-9 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-11%20since%3A2023-05-09&src=typed_query", // UNVR 9-11 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-13%20since%3A2023-05-11&src=typed_query", // UNVR 11-13 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-15%20since%3A2023-05-13&src=typed_query", // UNVR 13-15 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-17%20since%3A2023-05-15&src=typed_query", // UNVR 15-17 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-19%20since%3A2023-05-17&src=typed_query", // UNVR 17-19 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-21%20since%3A2023-05-19&src=typed_query", // UNVR 19-21 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-23%20since%3A2023-05-21&src=typed_query", // UNVR 21-23 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-25%20since%3A2023-05-23&src=typed_query", // UNVR 23-25 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-27%20since%3A2023-05-25&src=typed_query", // UNVR 25-27 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-27&src=typed_query", // UNVR 27-31 Mei 2023

    // // juni
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-03%20since%3A2023-06-01&src=typed_query", // UNVR 1-3 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-05%20since%3A2023-06-03&src=typed_query", // UNVR 3-5 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-07%20since%3A2023-06-05&src=typed_query", // UNVR 5-7 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-09%20since%3A2023-06-07&src=typed_query", // UNVR 7-9 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-11%20since%3A2023-06-09&src=typed_query", // UNVR 9-11 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-13%20since%3A2023-06-11&src=typed_query", // UNVR 11-13 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-15%20since%3A2023-06-13&src=typed_query", // UNVR 13-15 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-17%20since%3A2023-06-15&src=typed_query", // UNVR 15-17 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-19%20since%3A2023-06-17&src=typed_query", // UNVR 17-19 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-21%20since%3A2023-06-19&src=typed_query", // UNVR 19-21 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-23%20since%3A2023-06-21&src=typed_query", // UNVR 21-23 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-25%20since%3A2023-06-23&src=typed_query", // UNVR 23-25 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-27%20since%3A2023-06-25&src=typed_query", // UNVR 25-27 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-27&src=typed_query", // UNVR 27-30 Juni 2023

    // // juli
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-03%20since%3A2023-07-01&src=typed_query", // UNVR 1-3 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-05%20since%3A2023-07-03&src=typed_query", // UNVR 3-5 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-07%20since%3A2023-07-05&src=typed_query", // UNVR 5-7 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-09%20since%3A2023-07-07&src=typed_query", // UNVR 7-9 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-11%20since%3A2023-07-09&src=typed_query", // UNVR 9-11 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-13%20since%3A2023-07-11&src=typed_query", // UNVR 11-13 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-15%20since%3A2023-07-13&src=typed_query", // UNVR 13-15 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-17%20since%3A2023-07-15&src=typed_query", // UNVR 15-17 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-19%20since%3A2023-07-17&src=typed_query", // UNVR 17-19 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-21%20since%3A2023-07-19&src=typed_query", // UNVR 19-21 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-23%20since%3A2023-07-21&src=typed_query", // UNVR 21-23 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-25%20since%3A2023-07-23&src=typed_query", // UNVR 23-25 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-27%20since%3A2023-07-25&src=typed_query", // UNVR 25-27 Juli 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-27&src=typed_query", // UNVR 27-31 Juli 2023

    // // agustus
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-03%20since%3A2023-08-01&src=typed_query", // UNVR 1-3 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-05%20since%3A2023-08-03&src=typed_query", // UNVR 3-5 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-07%20since%3A2023-08-05&src=typed_query", // UNVR 5-7 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-09%20since%3A2023-08-07&src=typed_query", // UNVR 7-9 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-11%20since%3A2023-08-09&src=typed_query", // UNVR 9-11 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-13%20since%3A2023-08-11&src=typed_query", // UNVR 11-13 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-15%20since%3A2023-08-13&src=typed_query", // UNVR 13-15 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-17%20since%3A2023-08-15&src=typed_query", // UNVR 15-17 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-19%20since%3A2023-08-17&src=typed_query", // UNVR 17-19 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-21%20since%3A2023-08-19&src=typed_query", // UNVR 19-21 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-23%20since%3A2023-08-21&src=typed_query", // UNVR 21-23 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-25%20since%3A2023-08-23&src=typed_query", // UNVR 23-25 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-27%20since%3A2023-08-25&src=typed_query", // UNVR 25-27 Agustus 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-31%20since%3A2023-08-27&src=typed_query", // UNVR 27-31 Agustus 2023

    // // september
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-03%20since%3A2023-09-01&src=typed_query", // UNVR 1-3 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-05%20since%3A2023-09-03&src=typed_query", // UNVR 3-5 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-07%20since%3A2023-09-05&src=typed_query", // UNVR 5-7 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-09%20since%3A2023-09-07&src=typed_query", // UNVR 7-9 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-11%20since%3A2023-09-09&src=typed_query", // UNVR 9-11 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-13%20since%3A2023-09-11&src=typed_query", // UNVR 11-13 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-15%20since%3A2023-09-13&src=typed_query", // UNVR 13-15 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-17%20since%3A2023-09-15&src=typed_query", // UNVR 15-17 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-19%20since%3A2023-09-17&src=typed_query", // UNVR 17-19 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-21%20since%3A2023-09-19&src=typed_query", // UNVR 19-21 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-23%20since%3A2023-09-21&src=typed_query", // UNVR 21-23 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-25%20since%3A2023-09-23&src=typed_query", // UNVR 23-25 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-27%20since%3A2023-09-25&src=typed_query", // UNVR 25-27 September 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-27&src=typed_query", // UNVR 27-30 September 2023

    // // oktober
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-03%20since%3A2023-10-01&src=typed_query", // UNVR 1-3 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-05%20since%3A2023-10-03&src=typed_query", // UNVR 3-5 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-07%20since%3A2023-10-05&src=typed_query", // UNVR 5-7 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-09%20since%3A2023-10-07&src=typed_query", // UNVR 7-9 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-11%20since%3A2023-10-09&src=typed_query", // UNVR 9-11 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-13%20since%3A2023-10-11&src=typed_query", // UNVR 11-13 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-15%20since%3A2023-10-13&src=typed_query", // UNVR 13-15 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-17%20since%3A2023-10-15&src=typed_query", // UNVR 15-17 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-19%20since%3A2023-10-17&src=typed_query", // UNVR 17-19 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-21%20since%3A2023-10-19&src=typed_query", // UNVR 19-21 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-23%20since%3A2023-10-21&src=typed_query", // UNVR 21-23 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-25%20since%3A2023-10-23&src=typed_query", // UNVR 23-25 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-27%20since%3A2023-10-25&src=typed_query", // UNVR 25-27 Oktober 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-27&src=typed_query", // UNVR 27-31 Oktober 2023

    // // november
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-03%20since%3A2023-11-01&src=typed_query", // UNVR 1-3 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-05%20since%3A2023-11-03&src=typed_query", // UNVR 3-5 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-07%20since%3A2023-11-05&src=typed_query", // UNVR 5-7 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-09%20since%3A2023-11-07&src=typed_query", // UNVR 7-9 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-11%20since%3A2023-11-09&src=typed_query", // UNVR 9-11 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-13%20since%3A2023-11-11&src=typed_query", // UNVR 11-13 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-15%20since%3A2023-11-13&src=typed_query", // UNVR 13-15 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-17%20since%3A2023-11-15&src=typed_query", // UNVR 15-17 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-19%20since%3A2023-11-17&src=typed_query", // UNVR 17-19 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-21%20since%3A2023-11-19&src=typed_query", // UNVR 19-21 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-23%20since%3A2023-11-21&src=typed_query", // UNVR 21-23 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-25%20since%3A2023-11-23&src=typed_query", // UNVR 23-25 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-27%20since%3A2023-11-25&src=typed_query", // UNVR 25-27 November 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-27&src=typed_query", // UNVR 27-30 November 2023

    // // desember
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-03%20since%3A2023-12-01&src=typed_query", // UNVR 1-3 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-05%20since%3A2023-12-03&src=typed_query", // UNVR 3-5 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-07%20since%3A2023-12-05&src=typed_query", // UNVR 5-7 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-09%20since%3A2023-12-07&src=typed_query", // UNVR 7-9 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-11%20since%3A2023-12-09&src=typed_query", // UNVR 9-11 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-13%20since%3A2023-12-11&src=typed_query", // UNVR 11-13 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-15%20since%3A2023-12-13&src=typed_query", // UNVR 13-15 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-17%20since%3A2023-12-15&src=typed_query", // UNVR 15-17 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-19%20since%3A2023-12-17&src=typed_query", // UNVR 17-19 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-21%20since%3A2023-12-19&src=typed_query", // UNVR 19-21 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-23%20since%3A2023-12-21&src=typed_query", // UNVR 21-23 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-25%20since%3A2023-12-23&src=typed_query", // UNVR 23-25 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-27%20since%3A2023-12-25&src=typed_query", // UNVR 25-27 Desember 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-27&src=typed_query", // UNVR 27-31 Desember 2023

    // Latest
    // januari
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-03%20since%3A2023-01-01&f=live&src=typed_query", // UNVR 1-3 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-05%20since%3A2023-01-03&f=live&src=typed_query", // UNVR 3-5 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-07%20since%3A2023-01-05&f=live&src=typed_query", // UNVR 5-7 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-09%20since%3A2023-01-07&f=live&src=typed_query", // UNVR 7-9 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-11%20since%3A2023-01-09&f=live&src=typed_query", // UNVR 9-11 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-13%20since%3A2023-01-11&f=live&src=typed_query", // UNVR 11-13 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-15%20since%3A2023-01-13&f=live&src=typed_query", // UNVR 13-15 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-17%20since%3A2023-01-15&f=live&src=typed_query", // UNVR 15-17 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-19%20since%3A2023-01-17&f=live&src=typed_query", // UNVR 17-19 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-21%20since%3A2023-01-19&f=live&src=typed_query", // UNVR 19-21 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-23%20since%3A2023-01-21&f=live&src=typed_query", // UNVR 21-23 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-25%20since%3A2023-01-23&f=live&src=typed_query", // UNVR 23-25 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-27%20since%3A2023-01-25&f=live&src=typed_query", // UNVR 25-27 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-29%20since%3A2023-01-27&f=live&src=typed_query", // UNVR 27-29 Januari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-01-31%20since%3A2023-01-29&f=live&src=typed_query", // UNVR 29-31 Januari 2023

    // // februari
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-03%20since%3A2023-02-01&src=typed_query&f=live", // UNVR 1-3 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-05%20since%3A2023-02-03&src=typed_query&f=live", // UNVR 3-5 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-07%20since%3A2023-02-05&src=typed_query&f=live", // UNVR 5-7 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-09%20since%3A2023-02-07&src=typed_query&f=live", // UNVR 7-9 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-11%20since%3A2023-02-09&src=typed_query&f=live", // UNVR 9-11 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-13%20since%3A2023-02-11&src=typed_query&f=live", // UNVR 11-13 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-15%20since%3A2023-02-13&src=typed_query&f=live", // UNVR 13-15 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-17%20since%3A2023-02-15&src=typed_query&f=live", // UNVR 15-17 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-19%20since%3A2023-02-17&src=typed_query&f=live", // UNVR 17-19 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-21%20since%3A2023-02-19&src=typed_query&f=live", // UNVR 19-21 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-23%20since%3A2023-02-21&src=typed_query&f=live", // UNVR 21-23 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-25%20since%3A2023-02-23&src=typed_query&f=live", // UNVR 23-25 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-27%20since%3A2023-02-25&src=typed_query&f=live", // UNVR 25-27 Februari 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-27&src=typed_query&f=live", // UNVR 27-28 Februari 2023

    // // maret
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-03%20since%3A2023-03-01&src=typed_query&f=live", // UNVR 1-3 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-05%20since%3A2023-03-03&src=typed_query&f=live", // UNVR 3-5 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-07%20since%3A2023-03-05&src=typed_query&f=live", // UNVR 5-7 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-09%20since%3A2023-03-07&src=typed_query&f=live", // UNVR 7-9 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-11%20since%3A2023-03-09&src=typed_query&f=live", // UNVR 9-11 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-13%20since%3A2023-03-11&src=typed_query&f=live", // UNVR 11-13 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-15%20since%3A2023-03-13&src=typed_query&f=live", // UNVR 13-15 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-17%20since%3A2023-03-15&src=typed_query&f=live", // UNVR 15-17 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-19%20since%3A2023-03-17&src=typed_query&f=live", // UNVR 17-19 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-21%20since%3A2023-03-19&src=typed_query&f=live", // UNVR 19-21 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-23%20since%3A2023-03-21&src=typed_query&f=live", // UNVR 21-23 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-25%20since%3A2023-03-23&src=typed_query&f=live", // UNVR 23-25 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-27%20since%3A2023-03-25&src=typed_query&f=live", // UNVR 25-27 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-29%20since%3A2023-03-27&src=typed_query&f=live", // UNVR 27-29 Maret 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-29&src=typed_query&f=live", // UNVR 29-31 Maret 2023

    // // april
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-03%20since%3A2023-04-01&src=typed_query&f=live", // UNVR 1-3 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-05%20since%3A2023-04-03&src=typed_query&f=live", // UNVR 3-5 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-07%20since%3A2023-04-05&src=typed_query&f=live", // UNVR 5-7 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-09%20since%3A2023-04-07&src=typed_query&f=live", // UNVR 7-9 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-11%20since%3A2023-04-09&src=typed_query&f=live", // UNVR 9-11 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-13%20since%3A2023-04-11&src=typed_query&f=live", // UNVR 11-13 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-15%20since%3A2023-04-13&src=typed_query&f=live", // UNVR 13-15 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-17%20since%3A2023-04-15&src=typed_query&f=live", // UNVR 15-17 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-19%20since%3A2023-04-17&src=typed_query&f=live", // UNVR 17-19 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-21%20since%3A2023-04-19&src=typed_query&f=live", // UNVR 19-21 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-23%20since%3A2023-04-21&src=typed_query&f=live", // UNVR 21-23 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-25%20since%3A2023-04-23&src=typed_query&f=live", // UNVR 23-25 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-27%20since%3A2023-04-25&src=typed_query&f=live", // UNVR 25-27 April 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-27&src=typed_query&f=live", // UNVR 27-30 April 2023

    // // mei
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-03%20since%3A2023-05-01&src=typed_query&f=live", // UNVR 1-3 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-05%20since%3A2023-05-03&src=typed_query&f=live", // UNVR 3-5 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-07%20since%3A2023-05-05&src=typed_query&f=live", // UNVR 5-7 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-09%20since%3A2023-05-07&src=typed_query&f=live", // UNVR 7-9 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-11%20since%3A2023-05-09&src=typed_query&f=live", // UNVR 9-11 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-13%20since%3A2023-05-11&src=typed_query&f=live", // UNVR 11-13 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-15%20since%3A2023-05-13&src=typed_query&f=live", // UNVR 13-15 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-17%20since%3A2023-05-15&src=typed_query&f=live", // UNVR 15-17 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-19%20since%3A2023-05-17&src=typed_query&f=live", // UNVR 17-19 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-21%20since%3A2023-05-19&src=typed_query&f=live", // UNVR 19-21 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-23%20since%3A2023-05-21&src=typed_query&f=live", // UNVR 21-23 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-25%20since%3A2023-05-23&src=typed_query&f=live", // UNVR 23-25 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-27%20since%3A2023-05-25&src=typed_query&f=live", // UNVR 25-27 Mei 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-27&src=typed_query&f=live", // UNVR 27-31 Mei 2023

    // // juni
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-03%20since%3A2023-06-01&src=typed_query&f=live", // UNVR 1-3 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-05%20since%3A2023-06-03&src=typed_query&f=live", // UNVR 3-5 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-07%20since%3A2023-06-05&src=typed_query&f=live", // UNVR 5-7 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-09%20since%3A2023-06-07&src=typed_query&f=live", // UNVR 7-9 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-11%20since%3A2023-06-09&src=typed_query&f=live", // UNVR 9-11 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-13%20since%3A2023-06-11&src=typed_query&f=live", // UNVR 11-13 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-15%20since%3A2023-06-13&src=typed_query&f=live", // UNVR 13-15 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-17%20since%3A2023-06-15&src=typed_query&f=live", // UNVR 15-17 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-19%20since%3A2023-06-17&src=typed_query&f=live", // UNVR 17-19 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-21%20since%3A2023-06-19&src=typed_query&f=live", // UNVR 19-21 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-23%20since%3A2023-06-21&src=typed_query&f=live", // UNVR 21-23 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-25%20since%3A2023-06-23&src=typed_query&f=live", // UNVR 23-25 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-27%20since%3A2023-06-25&src=typed_query&f=live", // UNVR 25-27 Juni 2023
    // "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-27&src=typed_query&f=live", // UNVR 27-30 Juni 2023

    // juli
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-03%20since%3A2023-07-01&src=typed_query&f=live", // UNVR 1-3 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-05%20since%3A2023-07-03&src=typed_query&f=live", // UNVR 3-5 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-07%20since%3A2023-07-05&src=typed_query&f=live", // UNVR 5-7 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-09%20since%3A2023-07-07&src=typed_query&f=live", // UNVR 7-9 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-11%20since%3A2023-07-09&src=typed_query&f=live", // UNVR 9-11 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-13%20since%3A2023-07-11&src=typed_query&f=live", // UNVR 11-13 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-15%20since%3A2023-07-13&src=typed_query&f=live", // UNVR 13-15 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-17%20since%3A2023-07-15&src=typed_query&f=live", // UNVR 15-17 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-19%20since%3A2023-07-17&src=typed_query&f=live", // UNVR 17-19 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-21%20since%3A2023-07-19&src=typed_query&f=live", // UNVR 19-21 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-23%20since%3A2023-07-21&src=typed_query&f=live", // UNVR 21-23 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-25%20since%3A2023-07-23&src=typed_query&f=live", // UNVR 23-25 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-27%20since%3A2023-07-25&src=typed_query&f=live", // UNVR 25-27 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-29%20since%3A2023-07-27&src=typed_query&f=live", // UNVR 27-29 Juli 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-29&src=typed_query&f=live", // UNVR 29-31 Juli 2023

    // agustus
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-03%20since%3A2023-08-01&src=typed_query&f=live", // UNVR 1-3 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-05%20since%3A2023-08-03&src=typed_query&f=live", // UNVR 3-5 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-07%20since%3A2023-08-05&src=typed_query&f=live", // UNVR 5-7 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-09%20since%3A2023-08-07&src=typed_query&f=live", // UNVR 7-9 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-11%20since%3A2023-08-09&src=typed_query&f=live", // UNVR 9-11 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-13%20since%3A2023-08-11&src=typed_query&f=live", // UNVR 11-13 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-15%20since%3A2023-08-13&src=typed_query&f=live", // UNVR 13-15 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-17%20since%3A2023-08-15&src=typed_query&f=live", // UNVR 15-17 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-19%20since%3A2023-08-17&src=typed_query&f=live", // UNVR 17-19 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-21%20since%3A2023-08-19&src=typed_query&f=live", // UNVR 19-21 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-23%20since%3A2023-08-21&src=typed_query&f=live", // UNVR 21-23 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-25%20since%3A2023-08-23&src=typed_query&f=live", // UNVR 23-25 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-27%20since%3A2023-08-25&src=typed_query&f=live", // UNVR 25-27 Agustus 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-08-31%20since%3A2023-08-27&src=typed_query&f=live", // UNVR 27-31 Agustus 2023

    // september
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-03%20since%3A2023-09-01&src=typed_query&f=live", // UNVR 1-3 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-05%20since%3A2023-09-03&src=typed_query&f=live", // UNVR 3-5 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-07%20since%3A2023-09-05&src=typed_query&f=live", // UNVR 5-7 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-09%20since%3A2023-09-07&src=typed_query&f=live", // UNVR 7-9 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-11%20since%3A2023-09-09&src=typed_query&f=live", // UNVR 9-11 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-13%20since%3A2023-09-11&src=typed_query&f=live", // UNVR 11-13 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-15%20since%3A2023-09-13&src=typed_query&f=live", // UNVR 13-15 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-17%20since%3A2023-09-15&src=typed_query&f=live", // UNVR 15-17 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-19%20since%3A2023-09-17&src=typed_query&f=live", // UNVR 17-19 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-21%20since%3A2023-09-19&src=typed_query&f=live", // UNVR 19-21 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-23%20since%3A2023-09-21&src=typed_query&f=live", // UNVR 21-23 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-25%20since%3A2023-09-23&src=typed_query&f=live", // UNVR 23-25 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-27%20since%3A2023-09-25&src=typed_query&f=live", // UNVR 25-27 September 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-27&src=typed_query&f=live", // UNVR 27-30 September 2023
    
    // oktober
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-03%20since%3A2023-10-01&src=typed_query&f=live", // UNVR 1-3 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-05%20since%3A2023-10-03&src=typed_query&f=live", // UNVR 3-5 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-07%20since%3A2023-10-05&src=typed_query&f=live", // UNVR 5-7 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-09%20since%3A2023-10-07&src=typed_query&f=live", // UNVR 7-9 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-11%20since%3A2023-10-09&src=typed_query&f=live", // UNVR 9-11 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-13%20since%3A2023-10-11&src=typed_query&f=live", // UNVR 11-13 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-15%20since%3A2023-10-13&src=typed_query&f=live", // UNVR 13-15 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-17%20since%3A2023-10-15&src=typed_query&f=live", // UNVR 15-17 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-19%20since%3A2023-10-17&src=typed_query&f=live", // UNVR 17-19 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-21%20since%3A2023-10-19&src=typed_query&f=live", // UNVR 19-21 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-23%20since%3A2023-10-21&src=typed_query&f=live", // UNVR 21-23 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-25%20since%3A2023-10-23&src=typed_query&f=live", // UNVR 23-25 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-27%20since%3A2023-10-25&src=typed_query&f=live", // UNVR 25-27 Oktober 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-27&src=typed_query&f=live", // UNVR 27-31 Oktober 2023

    // november
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-03%20since%3A2023-11-01&src=typed_query&f=live", // UNVR 1-3 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-05%20since%3A2023-11-03&src=typed_query&f=live", // UNVR 3-5 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-07%20since%3A2023-11-05&src=typed_query&f=live", // UNVR 5-7 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-09%20since%3A2023-11-07&src=typed_query&f=live", // UNVR 7-9 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-11%20since%3A2023-11-09&src=typed_query&f=live", // UNVR 9-11 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-13%20since%3A2023-11-11&src=typed_query&f=live", // UNVR 11-13 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-15%20since%3A2023-11-13&src=typed_query&f=live", // UNVR 13-15 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-17%20since%3A2023-11-15&src=typed_query&f=live", // UNVR 15-17 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-19%20since%3A2023-11-17&src=typed_query&f=live", // UNVR 17-19 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-21%20since%3A2023-11-19&src=typed_query&f=live", // UNVR 19-21 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-23%20since%3A2023-11-21&src=typed_query&f=live", // UNVR 21-23 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-25%20since%3A2023-11-23&src=typed_query&f=live", // UNVR 23-25 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-27%20since%3A2023-11-25&src=typed_query&f=live", // UNVR 25-27 November 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-27&src=typed_query&f=live", // UNVR 27-30 November 2023

    // desember
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-03%20since%3A2023-12-01&src=typed_query&f=live", // UNVR 1-3 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-05%20since%3A2023-12-03&src=typed_query&f=live", // UNVR 3-5 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-07%20since%3A2023-12-05&src=typed_query&f=live", // UNVR 5-7 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-09%20since%3A2023-12-07&src=typed_query&f=live", // UNVR 7-9 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-11%20since%3A2023-12-09&src=typed_query&f=live", // UNVR 9-11 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-13%20since%3A2023-12-11&src=typed_query&f=live", // UNVR 11-13 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-15%20since%3A2023-12-13&src=typed_query&f=live", // UNVR 13-15 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-17%20since%3A2023-12-15&src=typed_query&f=live", // UNVR 15-17 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-19%20since%3A2023-12-17&src=typed_query&f=live", // UNVR 17-19 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-21%20since%3A2023-12-19&src=typed_query&f=live", // UNVR 19-21 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-23%20since%3A2023-12-21&src=typed_query&f=live", // UNVR 21-23 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-25%20since%3A2023-12-23&src=typed_query&f=live", // UNVR 23-25 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-27%20since%3A2023-12-25&src=typed_query&f=live", // UNVR 25-27 Desember 2023
    "https://x.com/search?q=%23UNVR%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-27&src=typed_query&f=live", // UNVR 27-31 Desember 2023

];

const SCRAPING_TIME = 6 * 60 * 60 * 1000; // 6 jam
const COOKIES_FILE = "cookies_twitter1.json";
const COOKIES_MAX_AGE = 12 * 60 * 60 * 1000; // 12 jam

// Variabel global untuk menyimpan tweets yang sedang dikumpulkan (agar bisa diakses oleh handler SIGINT)
let globalCollectedTweets = null;

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
    // Simpan referensi ke global agar bisa diakses oleh handler SIGINT
    globalCollectedTweets = tweets;

    if (fs.existsSync("tweets_unvr_2023.json")) {
        const existing = JSON.parse(fs.readFileSync("tweets_unvr_2023.json", "utf-8"));
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
    fs.writeFileSync("tweets_unvr_2023.json", JSON.stringify(tweetArray, null, 2));
    console.log(`✅ Selesai! Total tweet terkumpul: ${tweetArray.length}`);

    await browser.close();
}

/* -------------------------------------------------------------------------- */
/*                               Graceful Exit                                */
/* -------------------------------------------------------------------------- */

// Handler untuk Ctrl+C (SIGINT) yang menyimpan data terlebih dahulu
process.on("SIGINT", async () => {
    console.log("\n🛑 Dihentikan oleh user. Menyimpan data yang sudah terkumpul...");
    if (globalCollectedTweets && globalCollectedTweets.size > 0) {
        try {
            const tweetArray = Array.from(globalCollectedTweets).map((t) => JSON.parse(t));
            fs.writeFileSync("tweets_unvr_2023.json", JSON.stringify(tweetArray, null, 2));
            console.log(`✅ Data berhasil disimpan. Total tweet tersimpan: ${tweetArray.length}`);
        } catch (err) {
            console.error("❌ Gagal menyimpan data:", err.message);
        }
    } else {
        console.log("ℹ️ Belum ada data yang terkumpul.");
    }
    process.exit();
});

scrapeTweets().catch(console.error);