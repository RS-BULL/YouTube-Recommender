const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" })); // Allow all origins
app.use(express.json());

app.get("/", (req, res) => {
    res.send("✅ YouTube Recommender Backend is Running!");
});

app.get("/search", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "❌ Missing search query" });

    console.log(`🔍 Searching YouTube for: ${query}`);

    let browser; // Define browser before try block

    try {
        browser = await puppeteer.launch({
            headless: "new",
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled"
            ]
        });

        const page = await browser.newPage();
        await page.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
            waitUntil: "networkidle2"
        });

        const videos = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("ytd-video-renderer"))
                .slice(0, 10)
                .map(video => ({
                    title: video.querySelector("#video-title")?.innerText.trim() || "No title",
                    link: "https://www.youtube.com" + video.querySelector("#video-title")?.getAttribute("href"),
                    thumbnail: video.querySelector("#thumbnail img")?.src || "",
                    channel: video.querySelector("ytd-channel-name a")?.innerText.trim() || "Unknown"
                }))
                .filter(video => video.title !== "No title" && video.link.includes("watch"));
        });

        if (!videos.length) throw new Error("❌ No videos found!");

        console.log("✅ Successfully fetched videos");
        res.json(videos);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Failed to fetch YouTube results" });
    } finally {
        if (browser) await browser.close(); // Close only if browser is defined
    }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
