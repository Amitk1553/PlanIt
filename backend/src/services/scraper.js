// const puppeteer = require("puppeteer");
// const cheerio = require("cheerio");
// import puppeteer from "puppeteer";
import * as cheerio from 'cheerio';
// const cheerio = require("cheerio");

/**
 * Scrapes movie details from a BookMyShow movies listing page.
 * Uses got-scraping for fast HTTP requests (~500ms) with automatic
 * browser-like TLS fingerprinting.
 *
 * @param {string} url - BookMyShow explore movies URL
 *   e.g. "https://in.bookmyshow.com/explore/movies-jamshedpur?cat=MT"
 * @returns {Promise<Array<Object>>} Array of movie detail objects
 */
export async function scrapeMovies(url) {
    const { gotScraping } = await import("got-scraping");

    const response = await gotScraping({
        url,
        headerGeneratorOptions: {
            browsers: [{ name: "chrome", minVersion: 120 }],
            devices: ["desktop"],
            operatingSystems: ["windows"],
        },
        timeout: { request: 10000 },
    });

    if (response.statusCode !== 200) {
        throw new Error(`Request failed with status ${response.statusCode}`);
    }

    const $ = cheerio.load(response.body);
    const movies = [];

    // Select all movie card anchor tags linking to individual movie pages
    // URL pattern: /movies/<city>/<movie-slug>/<eventId>
    $('a[href*="/movies/"][href*="/ET"]').each((_, el) => {
        const href = $(el).attr("href");
        if (!href || !href.match(/\/movies\/[^/]+\/[^/]+\/ET\d+/)) return;

        const eventIdMatch = href.match(/(ET\d+)$/);
        if (!eventIdMatch) return;
        const eventId = eventIdMatch[1];

        // Movie card structure: div.hoNDWQ contains [Name, Rating, Languages]
        const detailDivs = $(el).find(".hoNDWQ");
        if (detailDivs.length < 3) return;

        const movieName = $(detailDivs[0]).text().trim();
        const rated = $(detailDivs[1]).text().trim();
        const languages = $(detailDivs[2]).text().trim();

        // Extract poster image URL from the <img> inside the card
        const imgEl = $(el).find("img").first();
        const imageUrl = imgEl.attr("src") || imgEl.attr("data-src") || "";

        // Skip duplicates
        if (movies.some((m) => m.eventId === eventId)) return;

        movies.push({ movieName, languages, rated, eventId, movieUrl: href, imageUrl });
    });

    return movies;
}