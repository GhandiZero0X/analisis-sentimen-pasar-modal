const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const Sentiment = require("sentiment");

// list akun twitter 
// 1. hgr.allphantom22@gmail.com
// 2. paladintrinity01@gmail.com
// 3. phantom.zero2022@gmail.com
// 4. hgrphantom01@gmail.com

// akun file google: hgrphantom01@gmail.com

puppeteer.use(StealthPlugin());
const sentiment = new Sentiment();

require("dotenv").config();

const twitterURLs = [
    //  BBRI 2019
    // Kata Kunci: #BBRI
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query", // #BBRI top januari - juni 2019
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query", // #BBRI top juli - desember 2019
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&f=live&src=typed_query", // #BBRI latest januari - juni 2019
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query&f=live", // #BBRI latest juli - desember 2019

    // Kata Kunci: BBRI
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query&f=top", // BBRI top januari - juni 2019
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query&f=live", // BBRI latest januari - juni 2019
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&f=top&src=typed_query", // BBRI top juli - desember 2019
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query&f=live", // BBRI latest juli - desember 2019

    // BBRI 2020
    // Kata Kunci: #BBRI
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&f=top&src=typed_query", // #BBRI top januari - juni 2020
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&f=top&src=typed_query", // #BBRI top juli - desember 2020
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&f=live&src=typed_query", // #BBRI latest januari - juni 2020
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query&f=live", // #BBRI latest juli - desember 2020

    // Kata Kunci: BBRI
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query", // BBRI top januari - juni 2020
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query&f=live", // BBRI latest januari - juni 2020
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query", // BBRI top juli - desember 2020
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-12-01&src=typed_query&f=live", // BBRI latest juli - desember 2020

    // BBRI 2021
    // Kata Kunci: #BBRI
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query", // #BBRI top januari - juni 2021
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query", // #BBRI top juli - desember 2021
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query&f=live", // #BBRI latest januari - juni 2021
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query&f=liveclear", // #BBRI latest juli - desember 2021

    // Kata Kunci: BBRI
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query", // BBRI top januari - juni 2021
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query", // BBRI top juli - desember 2021
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query&f=live", // BBRI latest januari - juni 2021
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query&f=live", // BBRI latest juli - desember 2021 (november 17 2021)

    // BBRI 2022
    // Kata Kunci: #BBRI
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query", // #BBRI top januari - juni 2022
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query", // #BBRI top juli - desember 2022
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query&f=live", // #BBRI latest januari - juni 2022
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query&f=live", // #BBRI latest juli - desember 2022

    // Kata Kunci: BBRI
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query", // BBRI top januari - juni 2022
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query", // BBRI top juli - desember 2022
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query&f=live", // BBRI latest januari - juni 2022
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2022-03-06%20since%3A2022-01-01&src=typed_query&f=live", // masih tgl 5 november kurang tgl 4 - 1 novermbar
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query&f=live", // BBRI latest juli - desember 2022

    // BBRI 2023
    // Kata Kunci: #BBRI
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query", // #BBRI top januari - juni 2023
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query", // #BBRI top juli - desember 2023
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query&f=live", // #BBRI latest januari - juni 2023
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query&f=live", // #BBRI latest juli - desember 2023

    // Kata Kunci: BBRI
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query", // BBRI top januari - juni 2023
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query", // BBRI top juli - desember 2023
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query&f=live", // BBRI latest januari - juni 2023
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query&f=live", // BBRI latest juli - desember 2023

    // BBRI 2024
    // Kata Kunci: #BBRI
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query", // BBRI top januari - juni 2024
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query", // BBRI top juli - desember 2024
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query&f=live", // BBRI latest januari - juni 2024
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query&f=live", // BBRI latest juli - desember 2024

    // Kata Kunci: BBRI
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query", // BBRI top januari - juni 2024
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query", // BBRI top juli - desember 2024
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2024-01-14%20since%3A2024-01-01&src=typed_query&f=live", // BBRI latest januari - juni 2024
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2024-10-10%20since%3A2024-07-01&src=typed_query&f=live", // BBRI latest juli - desember 2024

    // BBRI 2025
    // Kata Kunci: #BBRI
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query", // #BBRI top januari - oktober 2025
    // "https://x.com/search?q=%23BBRI%20lang%3Aid%20until%3A2025-04-23%20since%3A2025-01-01&src=typed_query&f=live", // #BBRI latest januari - oktober 2025

    // Kata Kunci: BBRI
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2025-10-09%20since%3A2025-01-01&src=typed_query", // BBRI top januari - oktober 2025
    // "https://x.com/search?q=BBRI%20lang%3Aid%20until%3A2025-01-07%20since%3A2025-01-01&src=typed_query&f=live", // BBRI latest januari - oktober 2025

    // TLKM 2019
    // Kata Kunci: #TLKM
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query", // #TLKM Top Januari - Juni 2019
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query", // #TLKM Top Juli - Desember 2019
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query&f=live", // #TLKM Terbaru Januari - Juni 2019
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query&f=live", // #TLKM Terbaru Juli - Desember 2019

    // Kata Kunci: TLKM
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query", // TLKM Top Januari - Juni 2019
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query", // TLKM Top Juli - Desember 2019
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2019-01-02%20since%3A2019-01-01&src=typed_query&f=live", // TLKM Terbaru Januari - Juni 2019
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query&f=live", // TLKM Terbaru Juli - Desember 2019

    // TLKM 2020
    // Kata Kunci: #TLKM
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query", // #TLKM Top Januari - Juni 2020
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query", // #TLKM Top Juli - Desember 2020
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query&f=live", // #TLKM Terbaru Januari - Juni 2020
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query&f=live", // #TLKM Terbaru Juli - Desember 2020

    // Kata Kunci: TLKM
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query", // TLKM Top Januari - Juni 2020
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query", // TLKM Top Juli - Desember 2020
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query&f=live", // TLKM Terbaru Januari - Juni 2020
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2020-11-18%20since%3A2020-07-01&src=typed_query&f=live", // TLKM Terbaru Juli - Desember 2020

    // TLKM 2021
    // Kata Kunci: #TLKM
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2021-06-30%20since%3A2021-01-01&src=typed_query", // #TLKM Top Januari - Juni 2021
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query", // #TLKM Top Juli - Desember 2021
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2021-06-30%20since%3A2021-01-01&src=typed_query&f=live", // #TLKM Terbaru Januari - Juni 2021
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query&f=live", // #TLKM Terbaru Juli - Desember 2021

    // Kata Kunci: TLKM
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2021-06-30%20since%3A2021-01-01&src=typed_query", // TLKM Top Januari - Juni 2021
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query", // TLKM Top Juli - Desember 2021
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2021-01-08%20since%3A2021-01-01&src=typed_query&f=live", // TLKM Terbaru Januari - Juni 2021
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query&f=live", // TLKM Terbaru Juli - Desember 2021

    // TLKM 2022
    // Kata Kunci: #TLKM
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query", // #TLKM Top Januari - Juni 2022
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query", // #TLKM Top Juli - Desember 2022
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query&f=live", // #TLKM Terbaru Januari - Juni 2022
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query&f=live", // #TLKM Terbaru Juli - Desember 2022

    // Kata Kunci: TLKM
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query", // TLKM Top Januari - Juni 2022
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query", // TLKM Top Juli - Desember 2022
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2022-05-20%20since%3A2022-01-01&src=typed_query&f=live", // TLKM Terbaru Januari - Juni 2022
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2022-11-26%20since%3A2022-07-01&src=typed_query&f=live", // TLKM Terbaru Juli - Desember 2022

    // TLKM 2023
    // Kata Kunci: #TLKM
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query", // #TLKM Top Januari - Juni 2023
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query", // #TLKM Top Juli - Desember 2023
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query&f=live", // #TLKM Terbaru Januari - Juni 2023
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query&f=live", // #TLKM Terbaru Juli - Desember 2023

    // Kata Kunci: TLKM
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query", // TLKM Top Januari - Juni 2023
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query", // TLKM Top Juli - Desember 2023
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query&f=live", // TLKM Terbaru Januari - Juni 2023
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2023-09-27%20since%3A2023-07-01&src=typed_query&f=live", // TLKM Terbaru Juli - Desember 2023

    // TLKM 2024
    // Kata Kunci: #TLKM
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query", // #TLKM Top Januari - Juni 2024
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query", // #TLKM Top Juli - Desember 2024
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query&f=live", // #TLKM Terbaru Januari - Juni 2024
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query&f=live", // #TLKM Terbaru Juli - Desember 2024

    // Kata Kunci: TLKM
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query", // TLKM Top Januari - Juni 2024
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query", // TLKM Top Juli - Desember 2024
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2024-01-11%20since%3A2024-01-01&src=typed_query&f=live", // TLKM Terbaru Januari - Juni 2024
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query&f=live", // TLKM Terbaru Juli - Desember 2024

    // TLKM 2025
    // Kata Kunci: #TLKM
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query", // #TLKM Top Januari - Oktober 2025
    // "https://x.com/search?q=%23TLKM%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query&f=live", // #TLKM Terbaru Januari - Oktober 2025

    // Kata Kunci: TLKM
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query", // TLKM Top Januari - Oktober 2025
    // "https://x.com/search?q=TLKM%20lang%3Aid%20until%3A2025-03-11%20since%3A2025-01-01&src=typed_query&f=live", // TLKM Terbaru Januari - Oktober 2025

    // ICBP 2019
    // Kata Kunci: #ICBP
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query", // #ICBP Top Januari - Juni 2019
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query", // #ICBP Top Juli - Desember 2019
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query&f=live", // #ICBP Terbaru Januari - Juni 2019
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query&f=live", // #ICBP Terbaru Juli - Desember 2019

    // Kata Kunci: ICBP
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query", // ICBP Top Januari - Juni 2019
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query", // ICBP Top Juli - Desember 2019
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-01-01&src=typed_query&f=live", // ICBP Terbaru Januari - Juni 2019
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-07-01&src=typed_query&f=live", // ICBP Terbaru Juli - Desember 2019

    // ICBP 2020
    // Kata Kunci: #ICBP
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query&f=live",

    // Kata Kunci: ICBP
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2020-12-31%20since%3A2020-07-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2020-06-30%20since%3A2020-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2020-11-11%20since%3A2020-07-01&src=typed_query&f=live",

    // ICBP 2021
    // Kata Kunci: #ICBP
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2021-06-30%20since%3A2021-01-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2021-06-30%20since%3A2021-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query&f=live",

    // Kata Kunci: ICBP
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2021-06-30%20since%3A2021-01-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2021-06-30%20since%3A2021-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2021-12-31%20since%3A2021-07-01&src=typed_query&f=live",

    // ICBP 2022
    // Kata Kunci: #ICBP
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query&f=live",

    // Kata Kunci: ICBP
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2022-10-27%20since%3A2022-07-01&src=typed_query&f=live",

    // ICBP 2023
    // Kata Kunci: #ICBP
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query&f=live",

    // Kata Kunci: ICBP
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-07-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2023-07-03%20since%3A2023-07-01&src=typed_query&f=live",

    // ICBP 2024
    // Kata Kunci: #ICBP
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query&f=live",

    // Kata Kunci: ICBP
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2024-06-30%20since%3A2024-01-01&src=typed_query&f=live",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2024-12-31%20since%3A2024-07-01&src=typed_query&f=live",

    // ICBP 2025
    // Kata Kunci: #ICBP
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query",
    // "https://x.com/search?q=%23ICBP%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query&f=live",

    // Kata Kunci: ICBP
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query",
    // "https://x.com/search?q=ICBP%20lang%3Aid%20until%3A2025-10-31%20since%3A2025-01-01&src=typed_query&f=live",

    // BMRI 2018
    // Kata Kunci: BMRI
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query", // BMRI Top Januari - Juni 2018
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query", // BMRI Top Juli - Desember 2018
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query&f=live", // BMRI Terbaru Januari - Juni 2018
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query&f=live", // BMRI Terbaru Juli - Desember 2018

    // Kata Kunci: #BMRI
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query", // #BMRI Top Januari - Juni 2018
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query", // #BMRI Top Juli - Desember 2018
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2018-06-30%20since%3A2018-01-01&src=typed_query&f=live", // #BMRI Terbaru Januari - Juni 2018
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2018-12-31%20since%3A2018-07-01&src=typed_query&f=live", // #BMRI Terbaru Juli - Desember 2018

    // BMRI 2022
    // Kata Kunci: BMRI
    // top
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query", // BMRI Top Januari - Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query", // #BMRI Top Juli - Desember 2022

    // // januari
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-03%20since%3A2022-01-01&f=live&src=typed_query", // BMRI 1-3 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-05%20since%3A2022-01-03&f=live&src=typed_query", // BMRI 3-5 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-07%20since%3A2022-01-05&f=live&src=typed_query", // BMRI 5-7 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-09%20since%3A2022-01-07&f=live&src=typed_query", // BMRI 7-9 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-11%20since%3A2022-01-09&f=live&src=typed_query", // BMRI 9-11 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-13%20since%3A2022-01-11&f=live&src=typed_query", // BMRI 11-13 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-15%20since%3A2022-01-13&f=live&src=typed_query", // BMRI 13-15 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-17%20since%3A2022-01-15&f=live&src=typed_query", // BMRI 15-17 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-19%20since%3A2022-01-17&f=live&src=typed_query", // BMRI 17-19 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-21%20since%3A2022-01-19&f=live&src=typed_query", // BMRI 19-21 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-23%20since%3A2022-01-21&f=live&src=typed_query", // BMRI 21-23 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-25%20since%3A2022-01-23&f=live&src=typed_query", // BMRI 23-25 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-27%20since%3A2022-01-25&f=live&src=typed_query", // BMRI 25-27 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-29%20since%3A2022-01-27&f=live&src=typed_query", // BMRI 27-29 Januari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-01-31%20since%3A2022-01-29&f=live&src=typed_query", // BMRI 29-31 Januari 2022

    // // februari
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-03%20since%3A2022-02-01&src=typed_query&f=live", // BMRI 1-3 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-05%20since%3A2022-02-03&src=typed_query&f=live", // BMRI 3-5 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-07%20since%3A2022-02-05&src=typed_query&f=live", // BMRI 5-7 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-09%20since%3A2022-02-07&src=typed_query&f=live", // BMRI 7-9 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-11%20since%3A2022-02-09&src=typed_query&f=live", // BMRI 9-11 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-13%20since%3A2022-02-11&src=typed_query&f=live", // BMRI 11-13 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-15%20since%3A2022-02-13&src=typed_query&f=live", // BMRI 13-15 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-17%20since%3A2022-02-15&src=typed_query&f=live", // BMRI 15-17 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-19%20since%3A2022-02-17&src=typed_query&f=live", // BMRI 17-19 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-21%20since%3A2022-02-19&src=typed_query&f=live", // BMRI 19-21 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-23%20since%3A2022-02-21&src=typed_query&f=live", // BMRI 21-23 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-25%20since%3A2022-02-23&src=typed_query&f=live", // BMRI 23-25 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-27%20since%3A2022-02-25&src=typed_query&f=live", // BMRI 25-27 Februari 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-02-28%20since%3A2022-02-27&src=typed_query&f=live", // BMRI 27-28 Februari 2022

    // // maret
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-03%20since%3A2022-03-01&src=typed_query&f=live", // BMRI 1-3 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-05%20since%3A2022-03-03&src=typed_query&f=live", // BMRI 3-5 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-07%20since%3A2022-03-05&src=typed_query&f=live", // BMRI 5-7 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-09%20since%3A2022-03-07&src=typed_query&f=live", // BMRI 7-9 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-11%20since%3A2022-03-09&src=typed_query&f=live", // BMRI 9-11 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-13%20since%3A2022-03-11&src=typed_query&f=live", // BMRI 11-13 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-15%20since%3A2022-03-13&src=typed_query&f=live", // BMRI 13-15 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-17%20since%3A2022-03-15&src=typed_query&f=live", // BMRI 15-17 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-19%20since%3A2022-03-17&src=typed_query&f=live", // BMRI 17-19 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-21%20since%3A2022-03-19&src=typed_query&f=live", // BMRI 19-21 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-23%20since%3A2022-03-21&src=typed_query&f=live", // BMRI 21-23 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-25%20since%3A2022-03-23&src=typed_query&f=live", // BMRI 23-25 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-27%20since%3A2022-03-25&src=typed_query&f=live", // BMRI 25-27 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-29%20since%3A2022-03-27&src=typed_query&f=live", // BMRI 27-29 Maret 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-03-31%20since%3A2022-03-29&src=typed_query&f=live", // BMRI 29-31 Maret 2022

    // // april
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-03%20since%3A2022-04-01&src=typed_query&f=live", // BMRI 1-3 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-05%20since%3A2022-04-03&src=typed_query&f=live", // BMRI 3-5 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-07%20since%3A2022-04-05&src=typed_query&f=live", // BMRI 5-7 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-09%20since%3A2022-04-07&src=typed_query&f=live", // BMRI 7-9 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-11%20since%3A2022-04-09&src=typed_query&f=live", // BMRI 9-11 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-13%20since%3A2022-04-11&src=typed_query&f=live", // BMRI 11-13 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-15%20since%3A2022-04-13&src=typed_query&f=live", // BMRI 13-15 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-17%20since%3A2022-04-15&src=typed_query&f=live", // BMRI 15-17 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-19%20since%3A2022-04-17&src=typed_query&f=live", // BMRI 17-19 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-21%20since%3A2022-04-19&src=typed_query&f=live", // BMRI 19-21 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-23%20since%3A2022-04-21&src=typed_query&f=live", // BMRI 21-23 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-25%20since%3A2022-04-23&src=typed_query&f=live", // BMRI 23-25 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-27%20since%3A2022-04-25&src=typed_query&f=live", // BMRI 25-27 April 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-04-30%20since%3A2022-04-27&src=typed_query&f=live", // BMRI 27-30 April 2022

    // // mei
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-03%20since%3A2022-05-01&src=typed_query&f=live", // BMRI 1-3 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-05%20since%3A2022-05-03&src=typed_query&f=live", // BMRI 3-5 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-07%20since%3A2022-05-05&src=typed_query&f=live", // BMRI 5-7 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-09%20since%3A2022-05-07&src=typed_query&f=live", // BMRI 7-9 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-11%20since%3A2022-05-09&src=typed_query&f=live", // BMRI 9-11 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-13%20since%3A2022-05-11&src=typed_query&f=live", // BMRI 11-13 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-15%20since%3A2022-05-13&src=typed_query&f=live", // BMRI 13-15 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-17%20since%3A2022-05-15&src=typed_query&f=live", // BMRI 15-17 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-19%20since%3A2022-05-17&src=typed_query&f=live", // BMRI 17-19 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-21%20since%3A2022-05-19&src=typed_query&f=live", // BMRI 19-21 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-23%20since%3A2022-05-21&src=typed_query&f=live", // BMRI 21-23 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-25%20since%3A2022-05-23&src=typed_query&f=live", // BMRI 23-25 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-27%20since%3A2022-05-25&src=typed_query&f=live", // BMRI 25-27 Mei 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-05-31%20since%3A2022-05-27&src=typed_query&f=live", // BMRI 27-31 Mei 2022

    // // juni
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-03%20since%3A2022-06-01&src=typed_query&f=live", // BMRI 1-3 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-05%20since%3A2022-06-03&src=typed_query&f=live", // BMRI 3-5 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-07%20since%3A2022-06-05&src=typed_query&f=live", // BMRI 5-7 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-09%20since%3A2022-06-07&src=typed_query&f=live", // BMRI 7-9 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-11%20since%3A2022-06-09&src=typed_query&f=live", // BMRI 9-11 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-13%20since%3A2022-06-11&src=typed_query&f=live", // BMRI 11-13 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-15%20since%3A2022-06-13&src=typed_query&f=live", // BMRI 13-15 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-17%20since%3A2022-06-15&src=typed_query&f=live", // BMRI 15-17 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-19%20since%3A2022-06-17&src=typed_query&f=live", // BMRI 17-19 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-21%20since%3A2022-06-19&src=typed_query&f=live", // BMRI 19-21 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-23%20since%3A2022-06-21&src=typed_query&f=live", // BMRI 21-23 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-25%20since%3A2022-06-23&src=typed_query&f=live", // BMRI 23-25 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-27%20since%3A2022-06-25&src=typed_query&f=live", // BMRI 25-27 Juni 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-06-27&src=typed_query&f=live", // BMRI 27-30 Juni 2022

    // // juli
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-03%20since%3A2022-07-01&src=typed_query&f=live", // BMRI 1-3 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-05%20since%3A2022-07-03&src=typed_query&f=live", // BMRI 3-5 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-07%20since%3A2022-07-05&src=typed_query&f=live", // BMRI 5-7 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-09%20since%3A2022-07-07&src=typed_query&f=live", // BMRI 7-9 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-11%20since%3A2022-07-09&src=typed_query&f=live", // BMRI 9-11 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-13%20since%3A2022-07-11&src=typed_query&f=live", // BMRI 11-13 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-15%20since%3A2022-07-13&src=typed_query&f=live", // BMRI 13-15 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-17%20since%3A2022-07-15&src=typed_query&f=live", // BMRI 15-17 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-19%20since%3A2022-07-17&src=typed_query&f=live", // BMRI 17-19 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-21%20since%3A2022-07-19&src=typed_query&f=live", // BMRI 19-21 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-23%20since%3A2022-07-21&src=typed_query&f=live", // BMRI 21-23 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-25%20since%3A2022-07-23&src=typed_query&f=live", // BMRI 23-25 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-27%20since%3A2022-07-25&src=typed_query&f=live", // BMRI 25-27 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-29%20since%3A2022-07-27&src=typed_query&f=live", // BMRI 27-29 Juli 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-07-31%20since%3A2022-07-29&src=typed_query&f=live", // BMRI 29-31 Juli 2022

    // // agustus
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-03%20since%3A2022-08-01&src=typed_query&f=live", // BMRI 1-3 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-05%20since%3A2022-08-03&src=typed_query&f=live", // BMRI 3-5 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-07%20since%3A2022-08-05&src=typed_query&f=live", // BMRI 5-7 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-09%20since%3A2022-08-07&src=typed_query&f=live", // BMRI 7-9 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-11%20since%3A2022-08-09&src=typed_query&f=live", // BMRI 9-11 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-13%20since%3A2022-08-11&src=typed_query&f=live", // BMRI 11-13 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-15%20since%3A2022-08-13&src=typed_query&f=live", // BMRI 13-15 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-17%20since%3A2022-08-15&src=typed_query&f=live", // BMRI 15-17 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-19%20since%3A2022-08-17&src=typed_query&f=live", // BMRI 17-19 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-21%20since%3A2022-08-19&src=typed_query&f=live", // BMRI 19-21 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-23%20since%3A2022-08-21&src=typed_query&f=live", // BMRI 21-23 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-25%20since%3A2022-08-23&src=typed_query&f=live", // BMRI 23-25 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-27%20since%3A2022-08-25&src=typed_query&f=live", // BMRI 25-27 Agustus 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-08-31%20since%3A2022-08-27&src=typed_query&f=live", // BMRI 27-31 Agustus 2022

    // // september
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-03%20since%3A2022-09-01&src=typed_query&f=live", // BMRI 1-3 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-05%20since%3A2022-09-03&src=typed_query&f=live", // BMRI 3-5 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-07%20since%3A2022-09-05&src=typed_query&f=live", // BMRI 5-7 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-09%20since%3A2022-09-07&src=typed_query&f=live", // BMRI 7-9 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-11%20since%3A2022-09-09&src=typed_query&f=live", // BMRI 9-11 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-13%20since%3A2022-09-11&src=typed_query&f=live", // BMRI 11-13 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-15%20since%3A2022-09-13&src=typed_query&f=live", // BMRI 13-15 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-17%20since%3A2022-09-15&src=typed_query&f=live", // BMRI 15-17 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-19%20since%3A2022-09-17&src=typed_query&f=live", // BMRI 17-19 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-21%20since%3A2022-09-19&src=typed_query&f=live", // BMRI 19-21 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-23%20since%3A2022-09-21&src=typed_query&f=live", // BMRI 21-23 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-25%20since%3A2022-09-23&src=typed_query&f=live", // BMRI 23-25 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-27%20since%3A2022-09-25&src=typed_query&f=live", // BMRI 25-27 September 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-09-30%20since%3A2022-09-27&src=typed_query&f=live", // BMRI 27-30 September 2022
    
    // // oktober
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-03%20since%3A2022-10-01&src=typed_query&f=live", // BMRI 1-3 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-05%20since%3A2022-10-03&src=typed_query&f=live", // BMRI 3-5 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-07%20since%3A2022-10-05&src=typed_query&f=live", // BMRI 5-7 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-09%20since%3A2022-10-07&src=typed_query&f=live", // BMRI 7-9 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-11%20since%3A2022-10-09&src=typed_query&f=live", // BMRI 9-11 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-13%20since%3A2022-10-11&src=typed_query&f=live", // BMRI 11-13 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-15%20since%3A2022-10-13&src=typed_query&f=live", // BMRI 13-15 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-17%20since%3A2022-10-15&src=typed_query&f=live", // BMRI 15-17 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-19%20since%3A2022-10-17&src=typed_query&f=live", // BMRI 17-19 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-21%20since%3A2022-10-19&src=typed_query&f=live", // BMRI 19-21 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-23%20since%3A2022-10-21&src=typed_query&f=live", // BMRI 21-23 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-25%20since%3A2022-10-23&src=typed_query&f=live", // BMRI 23-25 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-27%20since%3A2022-10-25&src=typed_query&f=live", // BMRI 25-27 Oktober 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-10-31%20since%3A2022-10-27&src=typed_query&f=live", // BMRI 27-31 Oktober 2022

    // // november
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-03%20since%3A2022-11-01&src=typed_query&f=live", // BMRI 1-3 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-05%20since%3A2022-11-03&src=typed_query&f=live", // BMRI 3-5 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-07%20since%3A2022-11-05&src=typed_query&f=live", // BMRI 5-7 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-09%20since%3A2022-11-07&src=typed_query&f=live", // BMRI 7-9 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-11%20since%3A2022-11-09&src=typed_query&f=live", // BMRI 9-11 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-13%20since%3A2022-11-11&src=typed_query&f=live", // BMRI 11-13 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-15%20since%3A2022-11-13&src=typed_query&f=live", // BMRI 13-15 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-17%20since%3A2022-11-15&src=typed_query&f=live", // BMRI 15-17 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-19%20since%3A2022-11-17&src=typed_query&f=live", // BMRI 17-19 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-21%20since%3A2022-11-19&src=typed_query&f=live", // BMRI 19-21 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-23%20since%3A2022-11-21&src=typed_query&f=live", // BMRI 21-23 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-25%20since%3A2022-11-23&src=typed_query&f=live", // BMRI 23-25 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-27%20since%3A2022-11-25&src=typed_query&f=live", // BMRI 25-27 November 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-11-30%20since%3A2022-11-27&src=typed_query&f=live", // BMRI 27-30 November 2022

    // // desember
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-03%20since%3A2022-12-01&src=typed_query&f=live", // BMRI 1-3 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-05%20since%3A2022-12-03&src=typed_query&f=live", // BMRI 3-5 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-07%20since%3A2022-12-05&src=typed_query&f=live", // BMRI 5-7 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-09%20since%3A2022-12-07&src=typed_query&f=live", // BMRI 7-9 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-11%20since%3A2022-12-09&src=typed_query&f=live", // BMRI 9-11 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-13%20since%3A2022-12-11&src=typed_query&f=live", // BMRI 11-13 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-15%20since%3A2022-12-13&src=typed_query&f=live", // BMRI 13-15 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-17%20since%3A2022-12-15&src=typed_query&f=live", // BMRI 15-17 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-19%20since%3A2022-12-17&src=typed_query&f=live", // BMRI 17-19 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-21%20since%3A2022-12-19&src=typed_query&f=live", // BMRI 19-21 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-23%20since%3A2022-12-21&src=typed_query&f=live", // BMRI 21-23 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-25%20since%3A2022-12-23&src=typed_query&f=live", // BMRI 23-25 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-27%20since%3A2022-12-25&src=typed_query&f=live", // BMRI 25-27 Desember 2022
    // "https://x.com/search?q=BMRI%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-12-27&src=typed_query&f=live", // BMRI 27-31 Desember 2022
    
    // Kata Kunci: #BMRI
    // top 
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-01-01&src=typed_query", // #BMRI januari - juni top 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-07-01&src=typed_query", // #BMRI juli - desember top 2022

    // // januari
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-03%20since%3A2022-01-01&f=live&src=typed_query", // BMRI 1-3 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-05%20since%3A2022-01-03&f=live&src=typed_query", // BMRI 3-5 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-07%20since%3A2022-01-05&f=live&src=typed_query", // BMRI 5-7 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-09%20since%3A2022-01-07&f=live&src=typed_query", // BMRI 7-9 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-11%20since%3A2022-01-09&f=live&src=typed_query", // BMRI 9-11 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-13%20since%3A2022-01-11&f=live&src=typed_query", // BMRI 11-13 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-15%20since%3A2022-01-13&f=live&src=typed_query", // BMRI 13-15 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-17%20since%3A2022-01-15&f=live&src=typed_query", // BMRI 15-17 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-19%20since%3A2022-01-17&f=live&src=typed_query", // BMRI 17-19 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-21%20since%3A2022-01-19&f=live&src=typed_query", // BMRI 19-21 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-23%20since%3A2022-01-21&f=live&src=typed_query", // BMRI 21-23 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-25%20since%3A2022-01-23&f=live&src=typed_query", // BMRI 23-25 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-27%20since%3A2022-01-25&f=live&src=typed_query", // BMRI 25-27 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-29%20since%3A2022-01-27&f=live&src=typed_query", // BMRI 27-29 Januari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-01-31%20since%3A2022-01-29&f=live&src=typed_query", // BMRI 29-31 Januari 2022

    // // februari
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-03%20since%3A2022-02-01&src=typed_query&f=live", // BMRI 1-3 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-05%20since%3A2022-02-03&src=typed_query&f=live", // BMRI 3-5 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-07%20since%3A2022-02-05&src=typed_query&f=live", // BMRI 5-7 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-09%20since%3A2022-02-07&src=typed_query&f=live", // BMRI 7-9 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-11%20since%3A2022-02-09&src=typed_query&f=live", // BMRI 9-11 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-13%20since%3A2022-02-11&src=typed_query&f=live", // BMRI 11-13 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-15%20since%3A2022-02-13&src=typed_query&f=live", // BMRI 13-15 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-17%20since%3A2022-02-15&src=typed_query&f=live", // BMRI 15-17 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-19%20since%3A2022-02-17&src=typed_query&f=live", // BMRI 17-19 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-21%20since%3A2022-02-19&src=typed_query&f=live", // BMRI 19-21 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-23%20since%3A2022-02-21&src=typed_query&f=live", // BMRI 21-23 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-25%20since%3A2022-02-23&src=typed_query&f=live", // BMRI 23-25 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-27%20since%3A2022-02-25&src=typed_query&f=live", // BMRI 25-27 Februari 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-02-28%20since%3A2022-02-27&src=typed_query&f=live", // BMRI 27-28 Februari 2022

    // // maret
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-03%20since%3A2022-03-01&src=typed_query&f=live", // BMRI 1-3 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-05%20since%3A2022-03-03&src=typed_query&f=live", // BMRI 3-5 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-07%20since%3A2022-03-05&src=typed_query&f=live", // BMRI 5-7 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-09%20since%3A2022-03-07&src=typed_query&f=live", // BMRI 7-9 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-11%20since%3A2022-03-09&src=typed_query&f=live", // BMRI 9-11 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-13%20since%3A2022-03-11&src=typed_query&f=live", // BMRI 11-13 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-15%20since%3A2022-03-13&src=typed_query&f=live", // BMRI 13-15 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-17%20since%3A2022-03-15&src=typed_query&f=live", // BMRI 15-17 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-19%20since%3A2022-03-17&src=typed_query&f=live", // BMRI 17-19 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-21%20since%3A2022-03-19&src=typed_query&f=live", // BMRI 19-21 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-23%20since%3A2022-03-21&src=typed_query&f=live", // BMRI 21-23 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-25%20since%3A2022-03-23&src=typed_query&f=live", // BMRI 23-25 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-27%20since%3A2022-03-25&src=typed_query&f=live", // BMRI 25-27 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-29%20since%3A2022-03-27&src=typed_query&f=live", // BMRI 27-29 Maret 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-03-31%20since%3A2022-03-29&src=typed_query&f=live", // BMRI 29-31 Maret 2022

    // // april
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-03%20since%3A2022-04-01&src=typed_query&f=live", // BMRI 1-3 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-05%20since%3A2022-04-03&src=typed_query&f=live", // BMRI 3-5 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-07%20since%3A2022-04-05&src=typed_query&f=live", // BMRI 5-7 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-09%20since%3A2022-04-07&src=typed_query&f=live", // BMRI 7-9 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-11%20since%3A2022-04-09&src=typed_query&f=live", // BMRI 9-11 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-13%20since%3A2022-04-11&src=typed_query&f=live", // BMRI 11-13 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-15%20since%3A2022-04-13&src=typed_query&f=live", // BMRI 13-15 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-17%20since%3A2022-04-15&src=typed_query&f=live", // BMRI 15-17 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-19%20since%3A2022-04-17&src=typed_query&f=live", // BMRI 17-19 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-21%20since%3A2022-04-19&src=typed_query&f=live", // BMRI 19-21 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-23%20since%3A2022-04-21&src=typed_query&f=live", // BMRI 21-23 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-25%20since%3A2022-04-23&src=typed_query&f=live", // BMRI 23-25 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-27%20since%3A2022-04-25&src=typed_query&f=live", // BMRI 25-27 April 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-04-30%20since%3A2022-04-27&src=typed_query&f=live", // BMRI 27-30 April 2022

    // // mei
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-03%20since%3A2022-05-01&src=typed_query&f=live", // BMRI 1-3 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-05%20since%3A2022-05-03&src=typed_query&f=live", // BMRI 3-5 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-07%20since%3A2022-05-05&src=typed_query&f=live", // BMRI 5-7 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-09%20since%3A2022-05-07&src=typed_query&f=live", // BMRI 7-9 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-11%20since%3A2022-05-09&src=typed_query&f=live", // BMRI 9-11 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-13%20since%3A2022-05-11&src=typed_query&f=live", // BMRI 11-13 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-15%20since%3A2022-05-13&src=typed_query&f=live", // BMRI 13-15 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-17%20since%3A2022-05-15&src=typed_query&f=live", // BMRI 15-17 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-19%20since%3A2022-05-17&src=typed_query&f=live", // BMRI 17-19 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-21%20since%3A2022-05-19&src=typed_query&f=live", // BMRI 19-21 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-23%20since%3A2022-05-21&src=typed_query&f=live", // BMRI 21-23 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-25%20since%3A2022-05-23&src=typed_query&f=live", // BMRI 23-25 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-27%20since%3A2022-05-25&src=typed_query&f=live", // BMRI 25-27 Mei 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-05-31%20since%3A2022-05-27&src=typed_query&f=live", // BMRI 27-31 Mei 2022

    // // juni
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-03%20since%3A2022-06-01&src=typed_query&f=live", // BMRI 1-3 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-05%20since%3A2022-06-03&src=typed_query&f=live", // BMRI 3-5 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-07%20since%3A2022-06-05&src=typed_query&f=live", // BMRI 5-7 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-09%20since%3A2022-06-07&src=typed_query&f=live", // BMRI 7-9 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-11%20since%3A2022-06-09&src=typed_query&f=live", // BMRI 9-11 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-13%20since%3A2022-06-11&src=typed_query&f=live", // BMRI 11-13 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-15%20since%3A2022-06-13&src=typed_query&f=live", // BMRI 13-15 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-17%20since%3A2022-06-15&src=typed_query&f=live", // BMRI 15-17 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-19%20since%3A2022-06-17&src=typed_query&f=live", // BMRI 17-19 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-21%20since%3A2022-06-19&src=typed_query&f=live", // BMRI 19-21 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-23%20since%3A2022-06-21&src=typed_query&f=live", // BMRI 21-23 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-25%20since%3A2022-06-23&src=typed_query&f=live", // BMRI 23-25 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-27%20since%3A2022-06-25&src=typed_query&f=live", // BMRI 25-27 Juni 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-06-30%20since%3A2022-06-27&src=typed_query&f=live", // BMRI 27-30 Juni 2022

    // // juli
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-03%20since%3A2022-07-01&src=typed_query&f=live", // BMRI 1-3 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-05%20since%3A2022-07-03&src=typed_query&f=live", // BMRI 3-5 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-07%20since%3A2022-07-05&src=typed_query&f=live", // BMRI 5-7 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-09%20since%3A2022-07-07&src=typed_query&f=live", // BMRI 7-9 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-11%20since%3A2022-07-09&src=typed_query&f=live", // BMRI 9-11 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-13%20since%3A2022-07-11&src=typed_query&f=live", // BMRI 11-13 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-15%20since%3A2022-07-13&src=typed_query&f=live", // BMRI 13-15 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-17%20since%3A2022-07-15&src=typed_query&f=live", // BMRI 15-17 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-19%20since%3A2022-07-17&src=typed_query&f=live", // BMRI 17-19 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-21%20since%3A2022-07-19&src=typed_query&f=live", // BMRI 19-21 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-23%20since%3A2022-07-21&src=typed_query&f=live", // BMRI 21-23 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-25%20since%3A2022-07-23&src=typed_query&f=live", // BMRI 23-25 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-27%20since%3A2022-07-25&src=typed_query&f=live", // BMRI 25-27 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-29%20since%3A2022-07-27&src=typed_query&f=live", // BMRI 27-29 Juli 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-07-31%20since%3A2022-07-29&src=typed_query&f=live", // BMRI 29-31 Juli 2022

    // // agustus
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-03%20since%3A2022-08-01&src=typed_query&f=live", // BMRI 1-3 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-05%20since%3A2022-08-03&src=typed_query&f=live", // BMRI 3-5 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-07%20since%3A2022-08-05&src=typed_query&f=live", // BMRI 5-7 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-09%20since%3A2022-08-07&src=typed_query&f=live", // BMRI 7-9 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-11%20since%3A2022-08-09&src=typed_query&f=live", // BMRI 9-11 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-13%20since%3A2022-08-11&src=typed_query&f=live", // BMRI 11-13 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-15%20since%3A2022-08-13&src=typed_query&f=live", // BMRI 13-15 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-17%20since%3A2022-08-15&src=typed_query&f=live", // BMRI 15-17 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-19%20since%3A2022-08-17&src=typed_query&f=live", // BMRI 17-19 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-21%20since%3A2022-08-19&src=typed_query&f=live", // BMRI 19-21 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-23%20since%3A2022-08-21&src=typed_query&f=live", // BMRI 21-23 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-25%20since%3A2022-08-23&src=typed_query&f=live", // BMRI 23-25 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-27%20since%3A2022-08-25&src=typed_query&f=live", // BMRI 25-27 Agustus 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-08-31%20since%3A2022-08-27&src=typed_query&f=live", // BMRI 27-31 Agustus 2022

    // // september
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-03%20since%3A2022-09-01&src=typed_query&f=live", // BMRI 1-3 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-05%20since%3A2022-09-03&src=typed_query&f=live", // BMRI 3-5 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-07%20since%3A2022-09-05&src=typed_query&f=live", // BMRI 5-7 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-09%20since%3A2022-09-07&src=typed_query&f=live", // BMRI 7-9 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-11%20since%3A2022-09-09&src=typed_query&f=live", // BMRI 9-11 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-13%20since%3A2022-09-11&src=typed_query&f=live", // BMRI 11-13 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-15%20since%3A2022-09-13&src=typed_query&f=live", // BMRI 13-15 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-17%20since%3A2022-09-15&src=typed_query&f=live", // BMRI 15-17 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-19%20since%3A2022-09-17&src=typed_query&f=live", // BMRI 17-19 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-21%20since%3A2022-09-19&src=typed_query&f=live", // BMRI 19-21 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-23%20since%3A2022-09-21&src=typed_query&f=live", // BMRI 21-23 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-25%20since%3A2022-09-23&src=typed_query&f=live", // BMRI 23-25 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-27%20since%3A2022-09-25&src=typed_query&f=live", // BMRI 25-27 September 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-09-30%20since%3A2022-09-27&src=typed_query&f=live", // BMRI 27-30 September 2022
    
    // // oktober
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-03%20since%3A2022-10-01&src=typed_query&f=live", // BMRI 1-3 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-05%20since%3A2022-10-03&src=typed_query&f=live", // BMRI 3-5 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-07%20since%3A2022-10-05&src=typed_query&f=live", // BMRI 5-7 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-09%20since%3A2022-10-07&src=typed_query&f=live", // BMRI 7-9 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-11%20since%3A2022-10-09&src=typed_query&f=live", // BMRI 9-11 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-13%20since%3A2022-10-11&src=typed_query&f=live", // BMRI 11-13 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-15%20since%3A2022-10-13&src=typed_query&f=live", // BMRI 13-15 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-17%20since%3A2022-10-15&src=typed_query&f=live", // BMRI 15-17 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-19%20since%3A2022-10-17&src=typed_query&f=live", // BMRI 17-19 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-21%20since%3A2022-10-19&src=typed_query&f=live", // BMRI 19-21 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-23%20since%3A2022-10-21&src=typed_query&f=live", // BMRI 21-23 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-25%20since%3A2022-10-23&src=typed_query&f=live", // BMRI 23-25 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-27%20since%3A2022-10-25&src=typed_query&f=live", // BMRI 25-27 Oktober 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-10-31%20since%3A2022-10-27&src=typed_query&f=live", // BMRI 27-31 Oktober 2022

    // // november
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-03%20since%3A2022-11-01&src=typed_query&f=live", // BMRI 1-3 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-05%20since%3A2022-11-03&src=typed_query&f=live", // BMRI 3-5 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-07%20since%3A2022-11-05&src=typed_query&f=live", // BMRI 5-7 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-09%20since%3A2022-11-07&src=typed_query&f=live", // BMRI 7-9 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-11%20since%3A2022-11-09&src=typed_query&f=live", // BMRI 9-11 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-13%20since%3A2022-11-11&src=typed_query&f=live", // BMRI 11-13 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-15%20since%3A2022-11-13&src=typed_query&f=live", // BMRI 13-15 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-17%20since%3A2022-11-15&src=typed_query&f=live", // BMRI 15-17 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-19%20since%3A2022-11-17&src=typed_query&f=live", // BMRI 17-19 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-21%20since%3A2022-11-19&src=typed_query&f=live", // BMRI 19-21 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-23%20since%3A2022-11-21&src=typed_query&f=live", // BMRI 21-23 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-25%20since%3A2022-11-23&src=typed_query&f=live", // BMRI 23-25 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-27%20since%3A2022-11-25&src=typed_query&f=live", // BMRI 25-27 November 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-11-30%20since%3A2022-11-27&src=typed_query&f=live", // BMRI 27-30 November 2022

    // // desember
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-03%20since%3A2022-12-01&src=typed_query&f=live", // BMRI 1-3 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-05%20since%3A2022-12-03&src=typed_query&f=live", // BMRI 3-5 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-07%20since%3A2022-12-05&src=typed_query&f=live", // BMRI 5-7 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-09%20since%3A2022-12-07&src=typed_query&f=live", // BMRI 7-9 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-11%20since%3A2022-12-09&src=typed_query&f=live", // BMRI 9-11 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-13%20since%3A2022-12-11&src=typed_query&f=live", // BMRI 11-13 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-15%20since%3A2022-12-13&src=typed_query&f=live", // BMRI 13-15 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-17%20since%3A2022-12-15&src=typed_query&f=live", // BMRI 15-17 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-19%20since%3A2022-12-17&src=typed_query&f=live", // BMRI 17-19 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-21%20since%3A2022-12-19&src=typed_query&f=live", // BMRI 19-21 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-23%20since%3A2022-12-21&src=typed_query&f=live", // BMRI 21-23 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-25%20since%3A2022-12-23&src=typed_query&f=live", // BMRI 23-25 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-27%20since%3A2022-12-25&src=typed_query&f=live", // BMRI 25-27 Desember 2022
    // "https://x.com/search?q=%23BMRI%20lang%3Aid%20until%3A2022-12-31%20since%3A2022-12-27&src=typed_query&f=live", // BMRI 27-31 Desember 2022

    // ISAT 2019
    // Kata Kunci: ISAT
    // top
    // // januari 
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-03%20since%3A2019-01-01&src=typed_query", // ISAT 1-3 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-05%20since%3A2019-01-03&src=typed_query", // ISAT 3-5 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-07%20since%3A2019-01-05&src=typed_query", // ISAT 5-7 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-09%20since%3A2019-01-07&src=typed_query", // ISAT 7-9 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-11%20since%3A2019-01-09&src=typed_query", // ISAT 9-11 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-13%20since%3A2019-01-11&src=typed_query", // ISAT 11-13 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-15%20since%3A2019-01-13&src=typed_query", // ISAT 13-15 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-17%20since%3A2019-01-15&src=typed_query", // ISAT 15-17 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-19%20since%3A2019-01-17&src=typed_query", // ISAT 17-19Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-21%20since%3A2019-01-19&src=typed_query", // ISAT 19-21 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-23%20since%3A2019-01-21&src=typed_query", // ISAT 21-23 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-25%20since%3A2019-01-23&src=typed_query", // ISAT 23-25 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-27%20since%3A2019-01-25&src=typed_query", // ISAT 25-27 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-31%20since%3A2019-01-27&src=typed_query", // ISAT 27-31 Januari 2019

    // // februari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-03%20since%3A2019-02-01&src=typed_query", // ISAT 1-3 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-05%20since%3A2019-02-03&src=typed_query", // ISAT 3-5 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-07%20since%3A2019-02-05&src=typed_query", // ISAT 5-7 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-09%20since%3A2019-02-07&src=typed_query", // ISAT 7-9 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-11%20since%3A2019-02-09&src=typed_query", // ISAT 9-11 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-13%20since%3A2019-02-11&src=typed_query", // ISAT 11-13 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-15%20since%3A2019-02-13&src=typed_query", // ISAT 13-15 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-17%20since%3A2019-02-15&src=typed_query", // ISAT 15-17 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-19%20since%3A2019-02-17&src=typed_query", // ISAT 17-19Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-21%20since%3A2019-02-19&src=typed_query", // ISAT 19-21 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-23%20since%3A2019-02-21&src=typed_query", // ISAT 21-23 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-25%20since%3A2019-02-23&src=typed_query", // ISAT 23-25 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-27%20since%3A2019-02-25&src=typed_query", // ISAT 25-27 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-28%20since%3A2019-02-27&src=typed_query", // ISAT 27-28 Januari 2019

    // // maret
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-03%20since%3A2019-03-01&src=typed_query", // ISAT 1-3 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-05%20since%3A2019-03-03&src=typed_query", // ISAT 3-5 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-07%20since%3A2019-03-05&src=typed_query", // ISAT 5-7 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-09%20since%3A2019-03-07&src=typed_query", // ISAT 7-9 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-11%20since%3A2019-03-09&src=typed_query", // ISAT 9-11 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-13%20since%3A2019-03-11&src=typed_query", // ISAT 11-13 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-15%20since%3A2019-03-13&src=typed_query", // ISAT 13-15 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-17%20since%3A2019-03-15&src=typed_query", // ISAT 15-17 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-19%20since%3A2019-03-17&src=typed_query", // ISAT 17-19 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-21%20since%3A2019-03-19&src=typed_query", // ISAT 19-21 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-23%20since%3A2019-03-21&src=typed_query", // ISAT 21-23 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-25%20since%3A2019-03-23&src=typed_query", // ISAT 23-25 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-27%20since%3A2019-03-25&src=typed_query", // ISAT 25-27 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-31%20since%3A2019-03-27&src=typed_query", // ISAT 27-31 Maret 2019

    // // april
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-03%20since%3A2019-04-01&src=typed_query", // ISAT 1-3 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-05%20since%3A2019-04-03&src=typed_query", // ISAT 3-5 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-07%20since%3A2019-04-05&src=typed_query", // ISAT 5-7 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-09%20since%3A2019-04-07&src=typed_query", // ISAT 7-9 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-11%20since%3A2019-04-09&src=typed_query", // ISAT 9-11 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-13%20since%3A2019-04-11&src=typed_query", // ISAT 11-13 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-15%20since%3A2019-04-13&src=typed_query", // ISAT 13-15 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-17%20since%3A2019-04-15&src=typed_query", // ISAT 15-17 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-19%20since%3A2019-04-17&src=typed_query", // ISAT 17-19 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-21%20since%3A2019-04-19&src=typed_query", // ISAT 19-21 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-23%20since%3A2019-04-21&src=typed_query", // ISAT 21-23 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-25%20since%3A2019-04-23&src=typed_query", // ISAT 23-25 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-27%20since%3A2019-04-25&src=typed_query", // ISAT 25-27 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-30%20since%3A2019-04-27&src=typed_query", // ISAT 27-30 April 2019

    // // mei
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-03%20since%3A2019-05-01&src=typed_query", // ISAT 1-3 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-05%20since%3A2019-05-03&src=typed_query", // ISAT 3-5 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-07%20since%3A2019-05-05&src=typed_query", // ISAT 5-7 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-09%20since%3A2019-05-07&src=typed_query", // ISAT 7-9 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-11%20since%3A2019-05-09&src=typed_query", // ISAT 9-11 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-13%20since%3A2019-05-11&src=typed_query", // ISAT 11-13 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-15%20since%3A2019-05-13&src=typed_query", // ISAT 13-15 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-17%20since%3A2019-05-15&src=typed_query", // ISAT 15-17 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-19%20since%3A2019-05-17&src=typed_query", // ISAT 17-19 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-21%20since%3A2019-05-19&src=typed_query", // ISAT 19-21 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-23%20since%3A2019-05-21&src=typed_query", // ISAT 21-23 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-25%20since%3A2019-05-23&src=typed_query", // ISAT 23-25 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-27%20since%3A2019-05-25&src=typed_query", // ISAT 25-27 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-31%20since%3A2019-05-27&src=typed_query", // ISAT 27-31 Mei 2019

    // // juni
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-03%20since%3A2019-06-01&src=typed_query", // ISAT 1-3 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-05%20since%3A2019-06-03&src=typed_query", // ISAT 3-5 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-07%20since%3A2019-06-05&src=typed_query", // ISAT 5-7 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-09%20since%3A2019-06-07&src=typed_query", // ISAT 7-9 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-11%20since%3A2019-06-09&src=typed_query", // ISAT 9-11 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-13%20since%3A2019-06-11&src=typed_query", // ISAT 11-13 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-15%20since%3A2019-06-13&src=typed_query", // ISAT 13-15 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-17%20since%3A2019-06-15&src=typed_query", // ISAT 15-17 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-19%20since%3A2019-06-17&src=typed_query", // ISAT 17-19 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-21%20since%3A2019-06-19&src=typed_query", // ISAT 19-21 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-23%20since%3A2019-06-21&src=typed_query", // ISAT 21-23 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-25%20since%3A2019-06-23&src=typed_query", // ISAT 23-25 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-27%20since%3A2019-06-25&src=typed_query", // ISAT 25-27 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-06-27&src=typed_query", // ISAT 27-30 Juni 2019

    // // juli
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-03%20since%3A2019-07-01&src=typed_query", // ISAT 1-3 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-05%20since%3A2019-07-03&src=typed_query", // ISAT 3-5 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-07%20since%3A2019-07-05&src=typed_query", // ISAT 5-7 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-09%20since%3A2019-07-07&src=typed_query", // ISAT 7-9 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-11%20since%3A2019-07-09&src=typed_query", // ISAT 9-11 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-13%20since%3A2019-07-11&src=typed_query", // ISAT 11-13 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-15%20since%3A2019-07-13&src=typed_query", // ISAT 13-15 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-17%20since%3A2019-07-15&src=typed_query", // ISAT 15-17 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-19%20since%3A2019-07-17&src=typed_query", // ISAT 17-19 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-21%20since%3A2019-07-19&src=typed_query", // ISAT 19-21 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-23%20since%3A2019-07-21&src=typed_query", // ISAT 21-23 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-25%20since%3A2019-07-23&src=typed_query", // ISAT 23-25 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-27%20since%3A2019-07-25&src=typed_query", // ISAT 25-27 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-31%20since%3A2019-07-27&src=typed_query", // ISAT 27-31 Juli 2019

    // // agustus
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-03%20since%3A2019-08-01&src=typed_query", // ISAT 1-3 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-05%20since%3A2019-08-03&src=typed_query", // ISAT 3-5 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-07%20since%3A2019-08-05&src=typed_query", // ISAT 5-7 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-09%20since%3A2019-08-07&src=typed_query", // ISAT 7-9 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-11%20since%3A2019-08-09&src=typed_query", // ISAT 9-11 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-13%20since%3A2019-08-11&src=typed_query", // ISAT 11-13 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-15%20since%3A2019-08-13&src=typed_query", // ISAT 13-15 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-17%20since%3A2019-08-15&src=typed_query", // ISAT 15-17 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-19%20since%3A2019-08-17&src=typed_query", // ISAT 17-19 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-21%20since%3A2019-08-19&src=typed_query", // ISAT 19-21 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-23%20since%3A2019-08-21&src=typed_query", // ISAT 21-23 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-25%20since%3A2019-08-23&src=typed_query", // ISAT 23-25 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-27%20since%3A2019-08-25&src=typed_query", // ISAT 25-27 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-31%20since%3A2019-08-27&src=typed_query", // ISAT 27-31 Agustus 2019

    // // september
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-03%20since%3A2019-09-01&src=typed_query", // ISAT 1-3 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-05%20since%3A2019-09-03&src=typed_query", // ISAT 3-5 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-07%20since%3A2019-09-05&src=typed_query", // ISAT 5-7 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-09%20since%3A2019-09-07&src=typed_query", // ISAT 7-9 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-11%20since%3A2019-09-09&src=typed_query", // ISAT 9-11 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-13%20since%3A2019-09-11&src=typed_query", // ISAT 11-13 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-15%20since%3A2019-09-13&src=typed_query", // ISAT 13-15 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-17%20since%3A2019-09-15&src=typed_query", // ISAT 15-17 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-19%20since%3A2019-09-17&src=typed_query", // ISAT 17-19 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-21%20since%3A2019-09-19&src=typed_query", // ISAT 19-21 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-23%20since%3A2019-09-21&src=typed_query", // ISAT 21-23 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-25%20since%3A2019-09-23&src=typed_query", // ISAT 23-25 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-27%20since%3A2019-09-25&src=typed_query", // ISAT 25-27 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-30%20since%3A2019-09-27&src=typed_query", // ISAT 27-30 September 2019

    // // oktober
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-03%20since%3A2019-10-01&src=typed_query", // ISAT 1-3 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-05%20since%3A2019-10-03&src=typed_query", // ISAT 3-5 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-07%20since%3A2019-10-05&src=typed_query", // ISAT 5-7 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-09%20since%3A2019-10-07&src=typed_query", // ISAT 7-9 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-11%20since%3A2019-10-09&src=typed_query", // ISAT 9-11 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-13%20since%3A2019-10-11&src=typed_query", // ISAT 11-13 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-15%20since%3A2019-10-13&src=typed_query", // ISAT 13-15 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-17%20since%3A2019-10-15&src=typed_query", // ISAT 15-17 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-19%20since%3A2019-10-17&src=typed_query", // ISAT 17-19 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-21%20since%3A2019-10-19&src=typed_query", // ISAT 19-21 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-23%20since%3A2019-10-21&src=typed_query", // ISAT 21-23 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-25%20since%3A2019-10-23&src=typed_query", // ISAT 23-25 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-27%20since%3A2019-10-25&src=typed_query", // ISAT 25-27 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-31%20since%3A2019-10-27&src=typed_query", // ISAT 27-31 Oktober 2019

    // // november
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-03%20since%3A2019-11-01&src=typed_query", // ISAT 1-3 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-05%20since%3A2019-11-03&src=typed_query", // ISAT 3-5 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-07%20since%3A2019-11-05&src=typed_query", // ISAT 5-7 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-09%20since%3A2019-11-07&src=typed_query", // ISAT 7-9 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-11%20since%3A2019-11-09&src=typed_query", // ISAT 9-11 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-13%20since%3A2019-11-11&src=typed_query", // ISAT 11-13 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-15%20since%3A2019-11-13&src=typed_query", // ISAT 13-15 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-17%20since%3A2019-11-15&src=typed_query", // ISAT 15-17 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-19%20since%3A2019-11-17&src=typed_query", // ISAT 17-19 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-21%20since%3A2019-11-19&src=typed_query", // ISAT 19-21 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-23%20since%3A2019-11-21&src=typed_query", // ISAT 21-23 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-25%20since%3A2019-11-23&src=typed_query", // ISAT 23-25 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-27%20since%3A2019-11-25&src=typed_query", // ISAT 25-27 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-30%20since%3A2019-11-27&src=typed_query", // ISAT 27-30 November 2019

    // // desember
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-03%20since%3A2019-12-01&src=typed_query", // ISAT 1-3 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-05%20since%3A2019-12-03&src=typed_query", // ISAT 3-5 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-07%20since%3A2019-12-05&src=typed_query", // ISAT 5-7 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-09%20since%3A2019-12-07&src=typed_query", // ISAT 7-9 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-11%20since%3A2019-12-09&src=typed_query", // ISAT 9-11 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-13%20since%3A2019-12-11&src=typed_query", // ISAT 11-13 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-15%20since%3A2019-12-13&src=typed_query", // ISAT 13-15 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-17%20since%3A2019-12-15&src=typed_query", // ISAT 15-17 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-19%20since%3A2019-12-17&src=typed_query", // ISAT 17-19 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-21%20since%3A2019-12-19&src=typed_query", // ISAT 19-21 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-23%20since%3A2019-12-21&src=typed_query", // ISAT 21-23 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-25%20since%3A2019-12-23&src=typed_query", // ISAT 23-25 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-27%20since%3A2019-12-25&src=typed_query", // ISAT 25-27 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-12-27&src=typed_query", // ISAT 27-31 Desember 2019

    // // latest
    // // januari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-03%20since%3A2019-01-01&src=typed_query&f=live", // ISAT 1-3 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-05%20since%3A2019-01-03&src=typed_query&f=live", // ISAT 3-5 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-07%20since%3A2019-01-05&src=typed_query&f=live", // ISAT 5-7 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-09%20since%3A2019-01-07&src=typed_query&f=live", // ISAT 7-9 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-11%20since%3A2019-01-09&src=typed_query&f=live", // ISAT 9-11 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-13%20since%3A2019-01-11&src=typed_query&f=live", // ISAT 11-13 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-15%20since%3A2019-01-13&src=typed_query&f=live", // ISAT 13-15 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-17%20since%3A2019-01-15&src=typed_query&f=live", // ISAT 15-17 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-19%20since%3A2019-01-17&src=typed_query&f=live", // ISAT 17-19 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-21%20since%3A2019-01-19&src=typed_query&f=live", // ISAT 19-21 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-23%20since%3A2019-01-21&src=typed_query&f=live", // ISAT 21-23 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-25%20since%3A2019-01-23&src=typed_query&f=live", // ISAT 23-25 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-27%20since%3A2019-01-25&src=typed_query&f=live", // ISAT 25-27 Januari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-01-31%20since%3A2019-01-27&src=typed_query&f=live", // ISAT 27-31 Januari 2019

    // // februari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-03%20since%3A2019-02-01&src=typed_query&f=live", // ISAT 1-3 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-05%20since%3A2019-02-03&src=typed_query&f=live", // ISAT 3-5 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-07%20since%3A2019-02-05&src=typed_query&f=live", // ISAT 5-7 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-09%20since%3A2019-02-07&src=typed_query&f=live", // ISAT 7-9 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-11%20since%3A2019-02-09&src=typed_query&f=live", // ISAT 9-11 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-13%20since%3A2019-02-11&src=typed_query&f=live", // ISAT 11-13 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-15%20since%3A2019-02-13&src=typed_query&f=live", // ISAT 13-15 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-17%20since%3A2019-02-15&src=typed_query&f=live", // ISAT 15-17 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-19%20since%3A2019-02-17&src=typed_query&f=live", // ISAT 17-19 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-21%20since%3A2019-02-19&src=typed_query&f=live", // ISAT 19-21 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-23%20since%3A2019-02-21&src=typed_query&f=live", // ISAT 21-23 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-25%20since%3A2019-02-23&src=typed_query&f=live", // ISAT 23-25 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-27%20since%3A2019-02-25&src=typed_query&f=live", // ISAT 25-27 Februari 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-02-28%20since%3A2019-02-27&src=typed_query&f=live", // ISAT 27-28 Februari 2019

    // // maret
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-03%20since%3A2019-03-01&src=typed_query&f=live", // ISAT 1-3 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-05%20since%3A2019-03-03&src=typed_query&f=live", // ISAT 3-5 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-07%20since%3A2019-03-05&src=typed_query&f=live", // ISAT 5-7 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-09%20since%3A2019-03-07&src=typed_query&f=live", // ISAT 7-9 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-11%20since%3A2019-03-09&src=typed_query&f=live", // ISAT 9-11 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-13%20since%3A2019-03-11&src=typed_query&f=live", // ISAT 11-13 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-15%20since%3A2019-03-13&src=typed_query&f=live", // ISAT 13-15 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-17%20since%3A2019-03-15&src=typed_query&f=live", // ISAT 15-17 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-19%20since%3A2019-03-17&src=typed_query&f=live", // ISAT 17-19 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-21%20since%3A2019-03-19&src=typed_query&f=live", // ISAT 19-21 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-23%20since%3A2019-03-21&src=typed_query&f=live", // ISAT 21-23 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-25%20since%3A2019-03-23&src=typed_query&f=live", // ISAT 23-25 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-27%20since%3A2019-03-25&src=typed_query&f=live", // ISAT 25-27 Maret 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-03-31%20since%3A2019-03-27&src=typed_query&f=live", // ISAT 27-31 Maret 2019

    // // april
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-03%20since%3A2019-04-01&src=typed_query&f=live", // ISAT 1-3 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-05%20since%3A2019-04-03&src=typed_query&f=live", // ISAT 3-5 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-07%20since%3A2019-04-05&src=typed_query&f=live", // ISAT 5-7 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-09%20since%3A2019-04-07&src=typed_query&f=live", // ISAT 7-9 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-11%20since%3A2019-04-09&src=typed_query&f=live", // ISAT 9-11 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-13%20since%3A2019-04-11&src=typed_query&f=live", // ISAT 11-13 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-15%20since%3A2019-04-13&src=typed_query&f=live", // ISAT 13-15 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-17%20since%3A2019-04-15&src=typed_query&f=live", // ISAT 15-17 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-19%20since%3A2019-04-17&src=typed_query&f=live", // ISAT 17-19 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-21%20since%3A2019-04-19&src=typed_query&f=live", // ISAT 19-21 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-23%20since%3A2019-04-21&src=typed_query&f=live", // ISAT 21-23 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-25%20since%3A2019-04-23&src=typed_query&f=live", // ISAT 23-25 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-27%20since%3A2019-04-25&src=typed_query&f=live", // ISAT 25-27 April 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-04-30%20since%3A2019-04-27&src=typed_query&f=live", // ISAT 27-30 April 2019

    // // mei
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-03%20since%3A2019-05-01&src=typed_query&f=live", // ISAT 1-3 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-05%20since%3A2019-05-03&src=typed_query&f=live", // ISAT 3-5 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-07%20since%3A2019-05-05&src=typed_query&f=live", // ISAT 5-7 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-09%20since%3A2019-05-07&src=typed_query&f=live", // ISAT 7-9 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-11%20since%3A2019-05-09&src=typed_query&f=live", // ISAT 9-11 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-13%20since%3A2019-05-11&src=typed_query&f=live", // ISAT 11-13 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-15%20since%3A2019-05-13&src=typed_query&f=live", // ISAT 13-15 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-17%20since%3A2019-05-15&src=typed_query&f=live", // ISAT 15-17 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-19%20since%3A2019-05-17&src=typed_query&f=live", // ISAT 17-19 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-21%20since%3A2019-05-19&src=typed_query&f=live", // ISAT 19-21 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-23%20since%3A2019-05-21&src=typed_query&f=live", // ISAT 21-23 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-25%20since%3A2019-05-23&src=typed_query&f=live", // ISAT 23-25 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-27%20since%3A2019-05-25&src=typed_query&f=live", // ISAT 25-27 Mei 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-05-31%20since%3A2019-05-27&src=typed_query&f=live", // ISAT 27-31 Mei 2019

    // // juni
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-03%20since%3A2019-06-01&src=typed_query&f=live", // ISAT 1-3 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-05%20since%3A2019-06-03&src=typed_query&f=live", // ISAT 3-5 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-07%20since%3A2019-06-05&src=typed_query&f=live", // ISAT 5-7 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-09%20since%3A2019-06-07&src=typed_query&f=live", // ISAT 7-9 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-11%20since%3A2019-06-09&src=typed_query&f=live", // ISAT 9-11 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-13%20since%3A2019-06-11&src=typed_query&f=live", // ISAT 11-13 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-15%20since%3A2019-06-13&src=typed_query&f=live", // ISAT 13-15 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-17%20since%3A2019-06-15&src=typed_query&f=live", // ISAT 15-17 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-19%20since%3A2019-06-17&src=typed_query&f=live", // ISAT 17-19 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-21%20since%3A2019-06-19&src=typed_query&f=live", // ISAT 19-21 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-23%20since%3A2019-06-21&src=typed_query&f=live", // ISAT 21-23 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-25%20since%3A2019-06-23&src=typed_query&f=live", // ISAT 23-25 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-27%20since%3A2019-06-25&src=typed_query&f=live", // ISAT 25-27 Juni 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-06-27&src=typed_query&f=live", // ISAT 27-30 Juni 2019

    // // juli
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-03%20since%3A2019-07-01&src=typed_query&f=live", // ISAT 1-3 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-05%20since%3A2019-07-03&src=typed_query&f=live", // ISAT 3-5 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-07%20since%3A2019-07-05&src=typed_query&f=live", // ISAT 5-7 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-09%20since%3A2019-07-07&src=typed_query&f=live", // ISAT 7-9 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-11%20since%3A2019-07-09&src=typed_query&f=live", // ISAT 9-11 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-13%20since%3A2019-07-11&src=typed_query&f=live", // ISAT 11-13 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-15%20since%3A2019-07-13&src=typed_query&f=live", // ISAT 13-15 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-17%20since%3A2019-07-15&src=typed_query&f=live", // ISAT 15-17 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-19%20since%3A2019-07-17&src=typed_query&f=live", // ISAT 17-19 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-21%20since%3A2019-07-19&src=typed_query&f=live", // ISAT 19-21 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-23%20since%3A2019-07-21&src=typed_query&f=live", // ISAT 21-23 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-25%20since%3A2019-07-23&src=typed_query&f=live", // ISAT 23-25 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-27%20since%3A2019-07-25&src=typed_query&f=live", // ISAT 25-27 Juli 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-07-31%20since%3A2019-07-27&src=typed_query&f=live", // ISAT 27-31 Juli 2019

    // // agustus
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-03%20since%3A2019-08-01&src=typed_query&f=live", // ISAT 1-3 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-05%20since%3A2019-08-03&src=typed_query&f=live", // ISAT 3-5 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-07%20since%3A2019-08-05&src=typed_query&f=live", // ISAT 5-7 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-09%20since%3A2019-08-07&src=typed_query&f=live", // ISAT 7-9 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-11%20since%3A2019-08-09&src=typed_query&f=live", // ISAT 9-11 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-13%20since%3A2019-08-11&src=typed_query&f=live", // ISAT 11-13 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-15%20since%3A2019-08-13&src=typed_query&f=live", // ISAT 13-15 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-17%20since%3A2019-08-15&src=typed_query&f=live", // ISAT 15-17 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-19%20since%3A2019-08-17&src=typed_query&f=live", // ISAT 17-19 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-21%20since%3A2019-08-19&src=typed_query&f=live", // ISAT 19-21 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-23%20since%3A2019-08-21&src=typed_query&f=live", // ISAT 21-23 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-25%20since%3A2019-08-23&src=typed_query&f=live", // ISAT 23-25 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-27%20since%3A2019-08-25&src=typed_query&f=live", // ISAT 25-27 Agustus 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-08-30%20since%3A2019-08-27&src=typed_query&f=live", // ISAT 27-30 Agustus 2019

    // // september
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-03%20since%3A2019-09-01&src=typed_query&f=live", // ISAT 1-3 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-05%20since%3A2019-09-03&src=typed_query&f=live", // ISAT 3-5 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-07%20since%3A2019-09-05&src=typed_query&f=live", // ISAT 5-7 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-09%20since%3A2019-09-07&src=typed_query&f=live", // ISAT 7-9 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-11%20since%3A2019-09-09&src=typed_query&f=live", // ISAT 9-11 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-13%20since%3A2019-09-11&src=typed_query&f=live", // ISAT 11-13 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-15%20since%3A2019-09-13&src=typed_query&f=live", // ISAT 13-15 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-17%20since%3A2019-09-15&src=typed_query&f=live", // ISAT 15-17 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-19%20since%3A2019-09-17&src=typed_query&f=live", // ISAT 17-19 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-21%20since%3A2019-09-19&src=typed_query&f=live", // ISAT 19-21 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-23%20since%3A2019-09-21&src=typed_query&f=live", // ISAT 21-23 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-25%20since%3A2019-09-23&src=typed_query&f=live", // ISAT 23-25 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-27%20since%3A2019-09-25&src=typed_query&f=live", // ISAT 25-27 September 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-09-30%20since%3A2019-09-27&src=typed_query&f=live", // ISAT 27-30 September 2019

    // // oktober
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-03%20since%3A2019-10-01&src=typed_query&f=live", // ISAT 1-3 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-05%20since%3A2019-10-03&src=typed_query&f=live", // ISAT 3-5 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-07%20since%3A2019-10-05&src=typed_query&f=live", // ISAT 5-7 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-09%20since%3A2019-10-07&src=typed_query&f=live", // ISAT 7-9 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-11%20since%3A2019-10-09&src=typed_query&f=live", // ISAT 9-11 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-13%20since%3A2019-10-11&src=typed_query&f=live", // ISAT 11-13 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-15%20since%3A2019-10-13&src=typed_query&f=live", // ISAT 13-15 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-17%20since%3A2019-10-15&src=typed_query&f=live", // ISAT 15-17 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-19%20since%3A2019-10-17&src=typed_query&f=live", // ISAT 17-19 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-21%20since%3A2019-10-19&src=typed_query&f=live", // ISAT 19-21 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-23%20since%3A2019-10-21&src=typed_query&f=live", // ISAT 21-23 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-25%20since%3A2019-10-23&src=typed_query&f=live", // ISAT 23-25 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-27%20since%3A2019-10-25&src=typed_query&f=live", // ISAT 25-27 Oktober 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-10-31%20since%3A2019-10-27&src=typed_query&f=live", // ISAT 27-31 Oktober 2019

    // // november
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-03%20since%3A2019-11-01&src=typed_query&f=live", // ISAT 1-3 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-05%20since%3A2019-11-03&src=typed_query&f=live", // ISAT 3-5 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-07%20since%3A2019-11-05&src=typed_query&f=live", // ISAT 5-7 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-09%20since%3A2019-11-07&src=typed_query&f=live", // ISAT 7-9 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-11%20since%3A2019-11-09&src=typed_query&f=live", // ISAT 9-11 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-13%20since%3A2019-11-11&src=typed_query&f=live", // ISAT 11-13 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-15%20since%3A2019-11-13&src=typed_query&f=live", // ISAT 13-15 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-17%20since%3A2019-11-15&src=typed_query&f=live", // ISAT 15-17 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-19%20since%3A2019-11-17&src=typed_query&f=live", // ISAT 17-19 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-21%20since%3A2019-11-19&src=typed_query&f=live", // ISAT 19-21 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-23%20since%3A2019-11-21&src=typed_query&f=live", // ISAT 21-23 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-25%20since%3A2019-11-23&src=typed_query&f=live", // ISAT 23-25 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-27%20since%3A2019-11-25&src=typed_query&f=live", // ISAT 25-27 November 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-11-30%20since%3A2019-11-27&src=typed_query&f=live", // ISAT 27-30 November 2019

    // // desember
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-03%20since%3A2019-12-01&src=typed_query&f=live", // ISAT 1-3 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-05%20since%3A2019-12-03&src=typed_query&f=live", // ISAT 3-5 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-07%20since%3A2019-12-05&src=typed_query&f=live", // ISAT 5-7 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-09%20since%3A2019-12-07&src=typed_query&f=live", // ISAT 7-9 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-11%20since%3A2019-12-09&src=typed_query&f=live", // ISAT 9-11 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-13%20since%3A2019-12-11&src=typed_query&f=live", // ISAT 11-13 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-15%20since%3A2019-12-13&src=typed_query&f=live", // ISAT 13-15 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-17%20since%3A2019-12-15&src=typed_query&f=live", // ISAT 15-17 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-19%20since%3A2019-12-17&src=typed_query&f=live", // ISAT 17-19 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-21%20since%3A2019-12-19&src=typed_query&f=live", // ISAT 19-21 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-23%20since%3A2019-12-21&src=typed_query&f=live", // ISAT 21-23 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-25%20since%3A2019-12-23&src=typed_query&f=live", // ISAT 23-25 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-27%20since%3A2019-12-25&src=typed_query&f=live", // ISAT 25-27 Desember 2019
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-12-27&src=typed_query&f=live", // ISAT 27-31 Desember 2019

    // // Kata Kunci: #ISAT
    // // top
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-01-31%20since%3A2019-01-01&src=typed_query", // ISAT Januari 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-02-28%20since%3A2019-02-01&src=typed_query", // ISAT Februari 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-03-31%20since%3A2019-03-01&src=typed_query", // ISAT Maret 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-04-30%20since%3A2019-04-01&src=typed_query", // ISAT April 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-05-31%20since%3A2019-05-01&src=typed_query", // ISAT Mei 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-06-01&src=typed_query", // ISAT Juni 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-07-31%20since%3A2019-07-01&src=typed_query", // ISAT Juli 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-08-31%20since%3A2019-08-01&src=typed_query", // ISAT Agustus 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-09-30%20since%3A2019-09-01&src=typed_query", // ISAT September 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-10-31%20since%3A2019-10-01&src=typed_query", // ISAT Oktober 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-11-30%20since%3A2019-11-01&src=typed_query", // ISAT November 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-12-01&src=typed_query", // ISAT Desember 2019

    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-01-01&src=typed_query", // ISAT sejak Januari 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-02-01&src=typed_query", // ISAT sejak Februari 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-03-01&src=typed_query", // ISAT sejak Maret 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-04-01&src=typed_query", // ISAT sejak April 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-05-01&src=typed_query", // ISAT sejak Mei 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-06-01&src=typed_query", // ISAT sejak Juni 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-07-01&src=typed_query", // ISAT sejak Juli 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-08-01&src=typed_query", // ISAT sejak Agustus 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-09-01&src=typed_query", // ISAT sejak September 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-10-01&src=typed_query", // ISAT sejak Oktober 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-11-01&src=typed_query", // ISAT sejak November 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2019-12-01&src=typed_query", // ISAT sejak Desember 2019

    // // latest
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-01-31%20since%3A2019-01-01&src=typed_query&f=live", // ISAT Januari 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-02-28%20since%3A2019-02-01&src=typed_query&f=live", // ISAT Februari 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-03-31%20since%3A2019-03-01&src=typed_query&f=live", // ISAT Maret 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-04-30%20since%3A2019-04-01&src=typed_query&f=live", // ISAT April 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-05-31%20since%3A2019-05-01&src=typed_query&f=live", // ISAT Mei 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-06-01&src=typed_query&f=live", // ISAT Juni 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-07-31%20since%3A2019-07-01&src=typed_query&f=live", // ISAT Juli 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-08-31%20since%3A2019-08-01&src=typed_query&f=live", // ISAT Agustus 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-09-30%20since%3A2019-09-01&src=typed_query&f=live", // ISAT September 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-10-31%20since%3A2019-10-01&src=typed_query&f=live", // ISAT Oktober 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-11-30%20since%3A2019-11-01&src=typed_query&f=live", // ISAT November 2019
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-12-01&src=typed_query&f=live", // ISAT Desember 2019

    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-02-28%20since%3A2019-02-01&src=typed_query&f=live", // ISAT Februari 2019
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-03-31%20since%3A2019-03-01&src=typed_query&f=live", // ISAT Maret 2019
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-04-30%20since%3A2019-04-01&src=typed_query&f=live", // ISAT April 2019
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-05-31%20since%3A2019-05-01&src=typed_query&f=live", // ISAT Mei 2019
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-06-30%20since%3A2019-06-01&src=typed_query&f=live", // ISAT Juni 2019
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-07-31%20since%3A2019-07-01&src=typed_query&f=live", // ISAT Juli 2019
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-08-31%20since%3A2019-08-01&src=typed_query&f=live", // ISAT Agustus 2019
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-09-30%20since%3A2019-09-01&src=typed_query&f=live", // ISAT September 2019
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-10-31%20since%3A2019-10-01&src=typed_query&f=live", // ISAT Oktober 2019
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-11-30%20since%3A2019-11-01&src=typed_query&f=live", // ISAT November 2019
    // "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2019-12-31%20since%3A2019-12-01&src=typed_query&f=live", // ISAT Desember 2019

    // ISAT 2023
    // Kata Kunci: ISAT
    // top
    // januari 
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-03%20since%3A2023-01-01&src=typed_query", // ISAT 1-3 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-05%20since%3A2023-01-03&src=typed_query", // ISAT 3-5 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-07%20since%3A2023-01-05&src=typed_query", // ISAT 5-7 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-09%20since%3A2023-01-07&src=typed_query", // ISAT 7-9 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-11%20since%3A2023-01-09&src=typed_query", // ISAT 9-11 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-13%20since%3A2023-01-11&src=typed_query", // ISAT 11-13 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-15%20since%3A2023-01-13&src=typed_query", // ISAT 13-15 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-17%20since%3A2023-01-15&src=typed_query", // ISAT 15-17 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-19%20since%3A2023-01-17&src=typed_query", // ISAT 17-19Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-21%20since%3A2023-01-19&src=typed_query", // ISAT 19-21 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-23%20since%3A2023-01-21&src=typed_query", // ISAT 21-23 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-25%20since%3A2023-01-23&src=typed_query", // ISAT 23-25 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-27%20since%3A2023-01-25&src=typed_query", // ISAT 25-27 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-31%20since%3A2023-01-27&src=typed_query", // ISAT 27-31 Januari 2023

    // // februari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-03%20since%3A2023-02-01&src=typed_query", // ISAT 1-3 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-05%20since%3A2023-02-03&src=typed_query", // ISAT 3-5 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-07%20since%3A2023-02-05&src=typed_query", // ISAT 5-7 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-09%20since%3A2023-02-07&src=typed_query", // ISAT 7-9 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-11%20since%3A2023-02-09&src=typed_query", // ISAT 9-11 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-13%20since%3A2023-02-11&src=typed_query", // ISAT 11-13 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-15%20since%3A2023-02-13&src=typed_query", // ISAT 13-15 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-17%20since%3A2023-02-15&src=typed_query", // ISAT 15-17 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-19%20since%3A2023-02-17&src=typed_query", // ISAT 17-19Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-21%20since%3A2023-02-19&src=typed_query", // ISAT 19-21 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-23%20since%3A2023-02-21&src=typed_query", // ISAT 21-23 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-25%20since%3A2023-02-23&src=typed_query", // ISAT 23-25 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-27%20since%3A2023-02-25&src=typed_query", // ISAT 25-27 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-27&src=typed_query", // ISAT 27-28 Januari 2023

    // // maret
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-03%20since%3A2023-03-01&src=typed_query", // ISAT 1-3 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-05%20since%3A2023-03-03&src=typed_query", // ISAT 3-5 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-07%20since%3A2023-03-05&src=typed_query", // ISAT 5-7 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-09%20since%3A2023-03-07&src=typed_query", // ISAT 7-9 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-11%20since%3A2023-03-09&src=typed_query", // ISAT 9-11 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-13%20since%3A2023-03-11&src=typed_query", // ISAT 11-13 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-15%20since%3A2023-03-13&src=typed_query", // ISAT 13-15 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-17%20since%3A2023-03-15&src=typed_query", // ISAT 15-17 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-19%20since%3A2023-03-17&src=typed_query", // ISAT 17-19 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-21%20since%3A2023-03-19&src=typed_query", // ISAT 19-21 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-23%20since%3A2023-03-21&src=typed_query", // ISAT 21-23 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-25%20since%3A2023-03-23&src=typed_query", // ISAT 23-25 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-27%20since%3A2023-03-25&src=typed_query", // ISAT 25-27 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-27&src=typed_query", // ISAT 27-31 Maret 2023

    // // april
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-03%20since%3A2023-04-01&src=typed_query", // ISAT 1-3 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-05%20since%3A2023-04-03&src=typed_query", // ISAT 3-5 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-07%20since%3A2023-04-05&src=typed_query", // ISAT 5-7 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-09%20since%3A2023-04-07&src=typed_query", // ISAT 7-9 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-11%20since%3A2023-04-09&src=typed_query", // ISAT 9-11 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-13%20since%3A2023-04-11&src=typed_query", // ISAT 11-13 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-15%20since%3A2023-04-13&src=typed_query", // ISAT 13-15 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-17%20since%3A2023-04-15&src=typed_query", // ISAT 15-17 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-19%20since%3A2023-04-17&src=typed_query", // ISAT 17-19 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-21%20since%3A2023-04-19&src=typed_query", // ISAT 19-21 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-23%20since%3A2023-04-21&src=typed_query", // ISAT 21-23 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-25%20since%3A2023-04-23&src=typed_query", // ISAT 23-25 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-27%20since%3A2023-04-25&src=typed_query", // ISAT 25-27 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-27&src=typed_query", // ISAT 27-30 April 2023

    // // mei
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-03%20since%3A2023-05-01&src=typed_query", // ISAT 1-3 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-05%20since%3A2023-05-03&src=typed_query", // ISAT 3-5 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-07%20since%3A2023-05-05&src=typed_query", // ISAT 5-7 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-09%20since%3A2023-05-07&src=typed_query", // IS AT 7-9 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-11%20since%3A2023-05-09&src=typed_query", // ISAT 9-11 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-13%20since%3A2023-05-11&src=typed_query", // ISAT 11-13 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-15%20since%3A2023-05-13&src=typed_query", // ISAT 13-15 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-17%20since%3A2023-05-15&src=typed_query", // ISAT 15-17 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-19%20since%3A2023-05-17&src=typed_query", // ISAT 17-19 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-21%20since%3A2023-05-19&src=typed_query", // ISAT 19-21 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-23%20since%3A2023-05-21&src=typed_query", // ISAT 21-23 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-25%20since%3A2023-05-23&src=typed_query", // ISAT 23-25 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-27%20since%3A2023-05-25&src=typed_query", // ISAT 25-27 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-27&src=typed_query", // ISAT 27-31 Mei 2023

    // // juni
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-03%20since%3A2023-06-01&src=typed_query", // ISAT 1-3 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-05%20since%3A2023-06-03&src=typed_query", // ISAT 3-5 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-07%20since%3A2023-06-05&src=typed_query", // ISAT 5-7 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-09%20since%3A2023-06-07&src=typed_query", // ISAT 7-9 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-11%20since%3A2023-06-09&src=typed_query", // ISAT 9-11 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-13%20since%3A2023-06-11&src=typed_query", // ISAT 11-13 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-15%20since%3A2023-06-13&src=typed_query", // ISAT 13-15 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-17%20since%3A2023-06-15&src=typed_query", // ISAT 15-17 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-19%20since%3A2023-06-17&src=typed_query", // ISAT 17-19 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-21%20since%3A2023-06-19&src=typed_query", // ISAT 19-21 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-23%20since%3A2023-06-21&src=typed_query", // ISAT 21-23 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-25%20since%3A2023-06-23&src=typed_query", // ISAT 23-25 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-27%20since%3A2023-06-25&src=typed_query", // ISAT 25-27 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-27&src=typed_query", // ISAT 27-30 Juni 2023

    // // juli
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-03%20since%3A2023-07-01&src=typed_query", // ISAT 1-3 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-05%20since%3A2023-07-03&src=typed_query", // ISAT 3-5 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-07%20since%3A2023-07-05&src=typed_query", // ISAT 5-7 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-09%20since%3A2023-07-07&src=typed_query", // ISAT 7-9 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-11%20since%3A2023-07-09&src=typed_query", // ISAT 9-11 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-13%20since%3A2023-07-11&src=typed_query", // ISAT 11-13 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-15%20since%3A2023-07-13&src=typed_query", // ISAT 13-15 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-17%20since%3A2023-07-15&src=typed_query", // ISAT 15-17 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-19%20since%3A2023-07-17&src=typed_query", // ISAT 17-19 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-21%20since%3A2023-07-19&src=typed_query", // ISAT 19-21 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-23%20since%3A2023-07-21&src=typed_query", // ISAT 21-23 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-25%20since%3A2023-07-23&src=typed_query", // ISAT 23-25 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-27%20since%3A2023-07-25&src=typed_query", // ISAT 25-27 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-27&src=typed_query", // ISAT 27-31 Juli 2023

    // // agustus
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-03%20since%3A2023-08-01&src=typed_query", // ISAT 1-3 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-05%20since%3A2023-08-03&src=typed_query", // ISAT 3-5 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-07%20since%3A2023-08-05&src=typed_query", // ISAT 5-7 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-09%20since%3A2023-08-07&src=typed_query", // ISAT 7-9 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-11%20since%3A2023-08-09&src=typed_query", // ISAT 9-11 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-13%20since%3A2023-08-11&src=typed_query", // ISAT 11-13 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-15%20since%3A2023-08-13&src=typed_query", // ISAT 13-15 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-17%20since%3A2023-08-15&src=typed_query", // ISAT 15-17 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-19%20since%3A2023-08-17&src=typed_query", // ISAT 17-19 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-21%20since%3A2023-08-19&src=typed_query", // ISAT 19-21 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-23%20since%3A2023-08-21&src=typed_query", // ISAT 21-23 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-25%20since%3A2023-08-23&src=typed_query", // ISAT 23-25 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-27%20since%3A2023-08-25&src=typed_query", // ISAT 25-27 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-31%20since%3A2023-08-27&src=typed_query", // ISAT 27-31 Agustus 2023

    // // september
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-03%20since%3A2023-09-01&src=typed_query", // ISAT 1-3 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-05%20since%3A2023-09-03&src=typed_query", // ISAT 3-5 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-07%20since%3A2023-09-05&src=typed_query", // ISAT 5-7 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-09%20since%3A2023-09-07&src=typed_query", // ISAT 7-9 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-11%20since%3A2023-09-09&src=typed_query", // ISAT 9-11 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-13%20since%3A2023-09-11&src=typed_query", // ISAT 11-13 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-15%20since%3A2023-09-13&src=typed_query", // ISAT 13-15 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-17%20since%3A2023-09-15&src=typed_query", // ISAT 15-17 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-19%20since%3A2023-09-17&src=typed_query", // ISAT 17-19 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-21%20since%3A2023-09-19&src=typed_query", // ISAT 19-21 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-23%20since%3A2023-09-21&src=typed_query", // ISAT 21-23 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-25%20since%3A2023-09-23&src=typed_query", // ISAT 23-25 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-27%20since%3A2023-09-25&src=typed_query", // ISAT 25-27 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-27&src=typed_query", // ISAT 27-30 September 2023

    // // oktober
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-03%20since%3A2023-10-01&src=typed_query", // ISAT 1-3 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-05%20since%3A2023-10-03&src=typed_query", // ISAT 3-5 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-07%20since%3A2023-10-05&src=typed_query", // ISAT 5-7 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-09%20since%3A2023-10-07&src=typed_query", // ISAT 7-9 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-11%20since%3A2023-10-09&src=typed_query", // ISAT 9-11 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-13%20since%3A2023-10-11&src=typed_query", // ISAT 11-13 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-15%20since%3A2023-10-13&src=typed_query", // ISAT 13-15 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-17%20since%3A2023-10-15&src=typed_query", // ISAT 15-17 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-19%20since%3A2023-10-17&src=typed_query", // ISAT 17-19 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-21%20since%3A2023-10-19&src=typed_query", // ISAT 19-21 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-23%20since%3A2023-10-21&src=typed_query", // ISAT 21-23 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-25%20since%3A2023-10-23&src=typed_query", // ISAT 23-25 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-27%20since%3A2023-10-25&src=typed_query", // ISAT 25-27 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-27&src=typed_query", // ISAT 27-31 Oktober 2023

    // // november
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-03%20since%3A2023-11-01&src=typed_query", // ISAT 1-3 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-05%20since%3A2023-11-03&src=typed_query", // ISAT 3-5 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-07%20since%3A2023-11-05&src=typed_query", // ISAT 5-7 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-09%20since%3A2023-11-07&src=typed_query", // ISAT 7-9 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-11%20since%3A2023-11-09&src=typed_query", // ISAT 9-11 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-13%20since%3A2023-11-11&src=typed_query", // ISAT 11-13 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-15%20since%3A2023-11-13&src=typed_query", // ISAT 13-15 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-17%20since%3A2023-11-15&src=typed_query", // ISAT 15-17 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-19%20since%3A2023-11-17&src=typed_query", // ISAT 17-19 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-21%20since%3A2023-11-19&src=typed_query", // ISAT 19-21 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-23%20since%3A2023-11-21&src=typed_query", // ISAT 21-23 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-25%20since%3A2023-11-23&src=typed_query", // ISAT 23-25 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-27%20since%3A2023-11-25&src=typed_query", // ISAT 25-27 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-27&src=typed_query", // ISAT 27-30 November 2023

    // // desember
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-03%20since%3A2023-12-01&src=typed_query", // ISAT 1-3 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-05%20since%3A2023-12-03&src=typed_query", // ISAT 3-5 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-07%20since%3A2023-12-05&src=typed_query", // ISAT 5-7 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-09%20since%3A2023-12-07&src=typed_query", // ISAT 7-9 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-11%20since%3A2023-12-09&src=typed_query", // ISAT 9-11 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-13%20since%3A2023-12-11&src=typed_query", // ISAT 11-13 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-15%20since%3A2023-12-13&src=typed_query", // ISAT 13-15 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-17%20since%3A2023-12-15&src=typed_query", // ISAT 15-17 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-19%20since%3A2023-12-17&src=typed_query", // ISAT 17-19 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-21%20since%3A2023-12-19&src=typed_query", // ISAT 19-21 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-23%20since%3A2023-12-21&src=typed_query", // ISAT 21-23 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-25%20since%3A2023-12-23&src=typed_query", // ISAT 23-25 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-27%20since%3A2023-12-25&src=typed_query", // ISAT 25-27 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-27&src=typed_query", // ISAT 27-31 Desember 2023

    // latest
    // januari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-03%20since%3A2023-01-01&src=typed_query&f=live", // ISAT 1-3 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-05%20since%3A2023-01-03&src=typed_query&f=live", // ISAT 3-5 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-07%20since%3A2023-01-05&src=typed_query&f=live", // ISAT 5-7 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-09%20since%3A2023-01-07&src=typed_query&f=live", // ISAT 7-9 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-11%20since%3A2023-01-09&src=typed_query&f=live", // ISAT 9-11 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-13%20since%3A2023-01-11&src=typed_query&f=live", // ISAT 11-13 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-15%20since%3A2023-01-13&src=typed_query&f=live", // ISAT 13-15 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-17%20since%3A2023-01-15&src=typed_query&f=live", // ISAT 15-17 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-19%20since%3A2023-01-17&src=typed_query&f=live", // ISAT 17-19 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-21%20since%3A2023-01-19&src=typed_query&f=live", // ISAT 19-21 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-23%20since%3A2023-01-21&src=typed_query&f=live", // ISAT 21-23 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-25%20since%3A2023-01-23&src=typed_query&f=live", // ISAT 23-25 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-27%20since%3A2023-01-25&src=typed_query&f=live", // ISAT 25-27 Januari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-01-31%20since%3A2023-01-27&src=typed_query&f=live", // ISAT 27-31 Januari 2023

    // // februari
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-03%20since%3A2023-02-01&src=typed_query&f=live", // ISAT 1-3 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-05%20since%3A2023-02-03&src=typed_query&f=live", // ISAT 3-5 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-07%20since%3A2023-02-05&src=typed_query&f=live", // ISAT 5-7 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-09%20since%3A2023-02-07&src=typed_query&f=live", // ISAT 7-9 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-11%20since%3A2023-02-09&src=typed_query&f=live", // ISAT 9-11 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-13%20since%3A2023-02-11&src=typed_query&f=live", // ISAT 11-13 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-15%20since%3A2023-02-13&src=typed_query&f=live", // ISAT 13-15 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-17%20since%3A2023-02-15&src=typed_query&f=live", // ISAT 15-17 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-19%20since%3A2023-02-17&src=typed_query&f=live", // ISAT 17-19 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-21%20since%3A2023-02-19&src=typed_query&f=live", // ISAT 19-21 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-23%20since%3A2023-02-21&src=typed_query&f=live", // ISAT 21-23 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-25%20since%3A2023-02-23&src=typed_query&f=live", // ISAT 23-25 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-27%20since%3A2023-02-25&src=typed_query&f=live", // ISAT 25-27 Februari 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-27&src=typed_query&f=live", // ISAT 27-28 Februari 2023

    // // maret
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-03%20since%3A2023-03-01&src=typed_query&f=live", // ISAT 1-3 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-05%20since%3A2023-03-03&src=typed_query&f=live", // ISAT 3-5 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-07%20since%3A2023-03-05&src=typed_query&f=live", // ISAT 5-7 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-09%20since%3A2023-03-07&src=typed_query&f=live", // ISAT 7-9 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-11%20since%3A2023-03-09&src=typed_query&f=live", // ISAT 9-11 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-13%20since%3A2023-03-11&src=typed_query&f=live", // ISAT 11-13 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-15%20since%3A2023-03-13&src=typed_query&f=live", // ISAT 13-15 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-17%20since%3A2023-03-15&src=typed_query&f=live", // ISAT 15-17 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-19%20since%3A2023-03-17&src=typed_query&f=live", // ISAT 17-19 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-21%20since%3A2023-03-19&src=typed_query&f=live", // ISAT 19-21 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-23%20since%3A2023-03-21&src=typed_query&f=live", // ISAT 21-23 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-25%20since%3A2023-03-23&src=typed_query&f=live", // ISAT 23-25 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-27%20since%3A2023-03-25&src=typed_query&f=live", // ISAT 25-27 Maret 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-27&src=typed_query&f=live", // ISAT 27-31 Maret 2023

    // // april
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-03%20since%3A2023-04-01&src=typed_query&f=live", // ISAT 1-3 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-05%20since%3A2023-04-03&src=typed_query&f=live", // ISAT 3-5 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-07%20since%3A2023-04-05&src=typed_query&f=live", // ISAT 5-7 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-09%20since%3A2023-04-07&src=typed_query&f=live", // ISAT 7-9 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-11%20since%3A2023-04-09&src=typed_query&f=live", // ISAT 9-11 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-13%20since%3A2023-04-11&src=typed_query&f=live", // ISAT 11-13 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-15%20since%3A2023-04-13&src=typed_query&f=live", // ISAT 13-15 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-17%20since%3A2023-04-15&src=typed_query&f=live", // ISAT 15-17 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-19%20since%3A2023-04-17&src=typed_query&f=live", // ISAT 17-19 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-21%20since%3A2023-04-19&src=typed_query&f=live", // ISAT 19-21 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-23%20since%3A2023-04-21&src=typed_query&f=live", // ISAT 21-23 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-25%20since%3A2023-04-23&src=typed_query&f=live", // ISAT 23-25 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-27%20since%3A2023-04-25&src=typed_query&f=live", // ISAT 25-27 April 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-27&src=typed_query&f=live", // ISAT 27-30 April 2023

    // // mei
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-03%20since%3A2023-05-01&src=typed_query&f=live", // ISAT 1-3 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-05%20since%3A2023-05-03&src=typed_query&f=live", // ISAT 3-5 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-07%20since%3A2023-05-05&src=typed_query&f=live", // ISAT 5-7 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-09%20since%3A2023-05-07&src=typed_query&f=live", // ISAT 7-9 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-11%20since%3A2023-05-09&src=typed_query&f=live", // ISAT 9-11 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-13%20since%3A2023-05-11&src=typed_query&f=live", // ISAT 11-13 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-15%20since%3A2023-05-13&src=typed_query&f=live", // ISAT 13-15 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-17%20since%3A2023-05-15&src=typed_query&f=live", // ISAT 15-17 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-19%20since%3A2023-05-17&src=typed_query&f=live", // ISAT 17-19 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-21%20since%3A2023-05-19&src=typed_query&f=live", // ISAT 19-21 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-23%20since%3A2023-05-21&src=typed_query&f=live", // ISAT 21-23 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-25%20since%3A2023-05-23&src=typed_query&f=live", // ISAT 23-25 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-27%20since%3A2023-05-25&src=typed_query&f=live", // ISAT 25-27 Mei 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-27&src=typed_query&f=live", // ISAT 27-31 Mei 2023

    // // juni
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-03%20since%3A2023-06-01&src=typed_query&f=live", // ISAT 1-3 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-05%20since%3A2023-06-03&src=typed_query&f=live", // ISAT 3-5 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-07%20since%3A2023-06-05&src=typed_query&f=live", // ISAT 5-7 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-09%20since%3A2023-06-07&src=typed_query&f=live", // ISAT 7-9 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-11%20since%3A2023-06-09&src=typed_query&f=live", // ISAT 9-11 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-13%20since%3A2023-06-11&src=typed_query&f=live", // ISAT 11-13 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-15%20since%3A2023-06-13&src=typed_query&f=live", // ISAT 13-15 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-17%20since%3A2023-06-15&src=typed_query&f=live", // ISAT 15-17 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-19%20since%3A2023-06-17&src=typed_query&f=live", // ISAT 17-19 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-21%20since%3A2023-06-19&src=typed_query&f=live", // ISAT 19-21 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-23%20since%3A2023-06-21&src=typed_query&f=live", // ISAT 21-23 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-25%20since%3A2023-06-23&src=typed_query&f=live", // ISAT 23-25 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-27%20since%3A2023-06-25&src=typed_query&f=live", // ISAT 25-27 Juni 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-27&src=typed_query&f=live", // ISAT 27-30 Juni 2023

    // // juli
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-03%20since%3A2023-07-01&src=typed_query&f=live", // ISAT 1-3 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-05%20since%3A2023-07-03&src=typed_query&f=live", // ISAT 3-5 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-07%20since%3A2023-07-05&src=typed_query&f=live", // ISAT 5-7 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-09%20since%3A2023-07-07&src=typed_query&f=live", // ISAT 7-9 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-11%20since%3A2023-07-09&src=typed_query&f=live", // ISAT 9-11 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-13%20since%3A2023-07-11&src=typed_query&f=live", // ISAT 11-13 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-15%20since%3A2023-07-13&src=typed_query&f=live", // ISAT 13-15 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-17%20since%3A2023-07-15&src=typed_query&f=live", // ISAT 15-17 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-19%20since%3A2023-07-17&src=typed_query&f=live", // ISAT 17-19 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-21%20since%3A2023-07-19&src=typed_query&f=live", // ISAT 19-21 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-23%20since%3A2023-07-21&src=typed_query&f=live", // ISAT 21-23 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-25%20since%3A2023-07-23&src=typed_query&f=live", // ISAT 23-25 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-27%20since%3A2023-07-25&src=typed_query&f=live", // ISAT 25-27 Juli 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-27&src=typed_query&f=live", // ISAT 27-31 Juli 2023

    // // agustus
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-03%20since%3A2023-08-01&src=typed_query&f=live", // ISAT 1-3 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-05%20since%3A2023-08-03&src=typed_query&f=live", // ISAT 3-5 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-07%20since%3A2023-08-05&src=typed_query&f=live", // ISAT 5-7 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-09%20since%3A2023-08-07&src=typed_query&f=live", // ISAT 7-9 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-11%20since%3A2023-08-09&src=typed_query&f=live", // ISAT 9-11 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-13%20since%3A2023-08-11&src=typed_query&f=live", // ISAT 11-13 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-15%20since%3A2023-08-13&src=typed_query&f=live", // ISAT 13-15 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-17%20since%3A2023-08-15&src=typed_query&f=live", // ISAT 15-17 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-19%20since%3A2023-08-17&src=typed_query&f=live", // ISAT 17-19 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-21%20since%3A2023-08-19&src=typed_query&f=live", // ISAT 19-21 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-23%20since%3A2023-08-21&src=typed_query&f=live", // ISAT 21-23 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-25%20since%3A2023-08-23&src=typed_query&f=live", // ISAT 23-25 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-27%20since%3A2023-08-25&src=typed_query&f=live", // ISAT 25-27 Agustus 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-08-30%20since%3A2023-08-27&src=typed_query&f=live", // ISAT 27-30 Agustus 2023

    // // september
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-03%20since%3A2023-09-01&src=typed_query&f=live", // ISAT 1-3 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-05%20since%3A2023-09-03&src=typed_query&f=live", // ISAT 3-5 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-07%20since%3A2023-09-05&src=typed_query&f=live", // ISAT 5-7 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-09%20since%3A2023-09-07&src=typed_query&f=live", // ISAT 7-9 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-11%20since%3A2023-09-09&src=typed_query&f=live", // ISAT 9-11 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-13%20since%3A2023-09-11&src=typed_query&f=live", // ISAT 11-13 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-15%20since%3A2023-09-13&src=typed_query&f=live", // ISAT 13-15 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-17%20since%3A2023-09-15&src=typed_query&f=live", // ISAT 15-17 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-19%20since%3A2023-09-17&src=typed_query&f=live", // ISAT 17-19 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-21%20since%3A2023-09-19&src=typed_query&f=live", // ISAT 19-21 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-23%20since%3A2023-09-21&src=typed_query&f=live", // ISAT 21-23 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-25%20since%3A2023-09-23&src=typed_query&f=live", // ISAT 23-25 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-27%20since%3A2023-09-25&src=typed_query&f=live", // ISAT 25-27 September 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-27&src=typed_query&f=live", // ISAT 27-30 September 2023

    // // oktober
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-03%20since%3A2023-10-01&src=typed_query&f=live", // ISAT 1-3 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-05%20since%3A2023-10-03&src=typed_query&f=live", // ISAT 3-5 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-07%20since%3A2023-10-05&src=typed_query&f=live", // ISAT 5-7 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-09%20since%3A2023-10-07&src=typed_query&f=live", // ISAT 7-9 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-11%20since%3A2023-10-09&src=typed_query&f=live", // ISAT 9-11 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-13%20since%3A2023-10-11&src=typed_query&f=live", // ISAT 11-13 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-15%20since%3A2023-10-13&src=typed_query&f=live", // ISAT 13-15 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-17%20since%3A2023-10-15&src=typed_query&f=live", // ISAT 15-17 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-19%20since%3A2023-10-17&src=typed_query&f=live", // ISAT 17-19 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-21%20since%3A2023-10-19&src=typed_query&f=live", // ISAT 19-21 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-23%20since%3A2023-10-21&src=typed_query&f=live", // ISAT 21-23 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-25%20since%3A2023-10-23&src=typed_query&f=live", // ISAT 23-25 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-27%20since%3A2023-10-25&src=typed_query&f=live", // ISAT 25-27 Oktober 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-27&src=typed_query&f=live", // ISAT 27-31 Oktober 2023

    // // november
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-03%20since%3A2023-11-01&src=typed_query&f=live", // ISAT 1-3 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-05%20since%3A2023-11-03&src=typed_query&f=live", // ISAT 3-5 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-07%20since%3A2023-11-05&src=typed_query&f=live", // ISAT 5-7 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-09%20since%3A2023-11-07&src=typed_query&f=live", // ISAT 7-9 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-11%20since%3A2023-11-09&src=typed_query&f=live", // ISAT 9-11 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-13%20since%3A2023-11-11&src=typed_query&f=live", // ISAT 11-13 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-15%20since%3A2023-11-13&src=typed_query&f=live", // ISAT 13-15 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-17%20since%3A2023-11-15&src=typed_query&f=live", // ISAT 15-17 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-19%20since%3A2023-11-17&src=typed_query&f=live", // ISAT 17-19 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-21%20since%3A2023-11-19&src=typed_query&f=live", // ISAT 19-21 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-23%20since%3A2023-11-21&src=typed_query&f=live", // ISAT 21-23 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-25%20since%3A2023-11-23&src=typed_query&f=live", // ISAT 23-25 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-27%20since%3A2023-11-25&src=typed_query&f=live", // ISAT 25-27 November 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-27&src=typed_query&f=live", // ISAT 27-30 November 2023

    // // desember
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-03%20since%3A2023-12-01&src=typed_query&f=live", // ISAT 1-3 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-05%20since%3A2023-12-03&src=typed_query&f=live", // ISAT 3-5 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-07%20since%3A2023-12-05&src=typed_query&f=live", // ISAT 5-7 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-09%20since%3A2023-12-07&src=typed_query&f=live", // ISAT 7-9 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-11%20since%3A2023-12-09&src=typed_query&f=live", // ISAT 9-11 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-13%20since%3A2023-12-11&src=typed_query&f=live", // ISAT 11-13 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-15%20since%3A2023-12-13&src=typed_query&f=live", // ISAT 13-15 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-17%20since%3A2023-12-15&src=typed_query&f=live", // ISAT 15-17 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-19%20since%3A2023-12-17&src=typed_query&f=live", // ISAT 17-19 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-21%20since%3A2023-12-19&src=typed_query&f=live", // ISAT 19-21 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-23%20since%3A2023-12-21&src=typed_query&f=live", // ISAT 21-23 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-25%20since%3A2023-12-23&src=typed_query&f=live", // ISAT 23-25 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-27%20since%3A2023-12-25&src=typed_query&f=live", // ISAT 25-27 Desember 2023
    // "https://x.com/search?q=ISAT%20saham%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-27&src=typed_query&f=live", // ISAT 27-31 Desember 2023

    // // Kata Kunci: #ISAT
    // // top
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-01-31%20since%3A2023-01-01&src=typed_query", // ISAT Januari 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-01&src=typed_query", // ISAT Februari 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-01&src=typed_query", // ISAT Maret 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-01&src=typed_query", // ISAT April 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-01&src=typed_query", // ISAT Mei 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-01&src=typed_query", // ISAT Juni 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-01&src=typed_query", // ISAT Juli 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-08-31%20since%3A2023-08-01&src=typed_query", // ISAT Agustus 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-01&src=typed_query", // ISAT September 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-01&src=typed_query", // ISAT Oktober 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-01&src=typed_query", // ISAT November 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-01&src=typed_query", // ISAT Desember 2023

    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-01-01&src=typed_query", // ISAT sejak Januari 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-02-01&src=typed_query", // ISAT sejak Februari 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-03-01&src=typed_query", // ISAT sejak Maret 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-04-01&src=typed_query", // ISAT sejak April 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-05-01&src=typed_query", // ISAT sejak Mei 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-06-01&src=typed_query", // ISAT sejak Juni 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-07-01&src=typed_query", // ISAT sejak Juli 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-08-01&src=typed_query", // ISAT sejak Agustus 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-09-01&src=typed_query", // ISAT sejak September 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-10-01&src=typed_query", // ISAT sejak Oktober 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-11-01&src=typed_query", // ISAT sejak November 2023
    // "https://x.com/search?q=%23ISAT%20lang%3Aid%20since%3A2023-12-01&src=typed_query", // ISAT sejak Desember 2023

    // latest
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-01-31%20since%3A2023-01-01&src=typed_query&f=live", // ISAT Januari 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-01&src=typed_query&f=live", // ISAT Februari 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-01&src=typed_query&f=live", // ISAT Maret 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-01&src=typed_query&f=live", // ISAT April 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-01&src=typed_query&f=live", // ISAT Mei 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-01&src=typed_query&f=live", // ISAT Juni 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-01&src=typed_query&f=live", // ISAT Juli 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-08-31%20since%3A2023-08-01&src=typed_query&f=live", // ISAT Agustus 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-01&src=typed_query&f=live", // ISAT September 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-01&src=typed_query&f=live", // ISAT Oktober 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-01&src=typed_query&f=live", // ISAT November 2023
    "https://x.com/search?q=%23ISAT%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-01&src=typed_query&f=live", // ISAT Desember 2023

    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-02-28%20since%3A2023-02-01&src=typed_query&f=live", // ISAT Februari 2023
    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-03-31%20since%3A2023-03-01&src=typed_query&f=live", // ISAT Maret 2023
    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-04-30%20since%3A2023-04-01&src=typed_query&f=live", // ISAT April 2023
    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-05-31%20since%3A2023-05-01&src=typed_query&f=live", // ISAT Mei 2023
    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-06-30%20since%3A2023-06-01&src=typed_query&f=live", // ISAT Juni 2023
    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-07-31%20since%3A2023-07-01&src=typed_query&f=live", // ISAT Juli 2023
    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-08-31%20since%3A2023-08-01&src=typed_query&f=live", // ISAT Agustus 2023
    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-09-30%20since%3A2023-09-01&src=typed_query&f=live", // ISAT September 2023
    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-10-31%20since%3A2023-10-01&src=typed_query&f=live", // ISAT Oktober 2023
    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-11-30%20since%3A2023-11-01&src=typed_query&f=live", // ISAT November 2023
    "https://x.com/search?q=%23ISAT%20saham%20lang%3Aid%20until%3A2023-12-31%20since%3A2023-12-01&src=typed_query&f=live", // ISAT Desember 2023
];

const SCRAPING_TIME = 6 * 60 * 60 * 1000; // 6 jam
const COOKIES_FILE = "cookies_twitter.json";
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

    if (fs.existsSync("tweets_isat_2023.json")) {
        const existing = JSON.parse(fs.readFileSync("tweets_isat_2023.json", "utf-8"));
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
    fs.writeFileSync("tweets_isat_2023.json", JSON.stringify(tweetArray, null, 2));
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
            fs.writeFileSync("tweets_isat_2023.json", JSON.stringify(tweetArray, null, 2));
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