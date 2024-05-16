const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { create } = require('xmlbuilder2');

const getLastSeason = () => {
  return puppeteer.launch().then(async (browser) => {
    try {
      console.log("Fetching Last Season...");
      // opening a new page and navigating to provided URL (to be scraped).
      const page = await browser.newPage();
      // go to provide URL (page)
      await page.goto("https://en.wikipedia.org/wiki/Lists_of_One_Piece_episodes");
      // wait for the contents inside specified element
      await page.waitForSelector(".mw-content-ltr.mw-parser-output");
      // Fetch HTML of the page we want to scrape
      const data = await page.content();
      const $ = cheerio.load(data);

      const seasons = $("h3").next('ul');
      let lastSeasons = $(seasons[seasons.length - 1]);
      lastSeasons = $(lastSeasons).find("li");
      const lastSeason = $(lastSeasons[lastSeasons.length - 1]).text();
      const split = lastSeason.split(" ");
      const season = parseInt(split.pop());
      console.log("Last Season => ", season);
      return season;
    } catch (error) {
      console.log(error);
    } finally {
      await browser.close(); // Close the browser once done
    }
  });
};

function generateXML(dataArray) {
  const xmlItems = dataArray.map(item => {
    return create({
      episodes: {
        episode: {
          '@number': item.episode,
          ...item
        }
      }
    }).end({ prettyPrint: true });
  });
  let data = xmlItems.join('\n');

  // remove repeated tags
  data = data.replace(/<\?xml version="1.0"\?>\n/g, "");
  data = data.replace(/<episodes>\n/g, "");
  data = data.replace(/<\/episodes>\n/g, "");
  data = data.replace(/<\/episodes>/g, "");
  return data;
}

function processData(data) {
  console.log("Processing Data...");
  const $ = cheerio.load(data);
  const list = $(".module-episode-list-row");
  const summaries = $(".shortSummaryText");
  const items = [];
  list.each(function (idx, ele) {
    const targeted = $(ele);
    const number = targeted.find("th").text();
    
    let title = targeted.find(".summary").text().trim();
    
    // Extract English, Japanese and Transliterations Parts from Title
    const split = title.split("Transliteration: ");
    const splitt = split[1].split(" (Japanese: ");
    const english = split[0].slice(1, split[0].length - 1);
    const japanese = splitt[0].slice(1, splitt[0].length - 1);
    const transliteration = splitt[1].slice(0, splitt[1].length - 1);
    
    let tds = targeted.find("td");
    let directedBy = $(tds[2]).text().trim();
    let writtenBy = $(tds[3]).text().trim();
    let animatedBy = $(tds[4]).text().trim();
    let aired = $(tds[5]).text().trim();
    
    let summary = $(summaries[idx]).text().trim();

    const item = {
      number,
      title: english,
      english,
      japanese,
      transliteration,
      directedBy,
      writtenBy,
      animatedBy,
      aired,
      summary
    };
    items.push(item);
  });

  console.log("Saving Data...");
  // Save as JSON
  fs.writeFile(
    `./data/One Piece.json`,
    JSON.stringify(items, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("JSON file has been saved");
    }
  );

  // Save as XML
  const xmlData = generateXML(items);

  fs.writeFile('./data/One Piece.xml', `<?xml version="1.0" encoding="utf-8"?>\n<episodes>\n${xmlData}</episodes>`, (err) => {
      if (err) throw err;
      console.log('XML file has been saved!');
  });
}

const scraper = () => {
  puppeteer.launch().then(async (browser) => {
    try {
      console.log("Starting One Piece Episodes Web Scraping...");
      // Create links to access each season page
      const seasons = await getLastSeason();
      console.log("Generating Links...");
      const links = [];
      for (let k = 1; k <= seasons; k++) {
        links.push(`https://en.wikipedia.org/wiki/One_Piece_season_${k}`);
      }
  
      // opening a new page and navigating to provided url(to be scraped).
      const page = await browser.newPage();

      // Fetch data for each season
      console.log("Fetching Data...");
      let data;
      for (let p = 0; p < links.length; p++) {
        const link = links[p];
        await page.goto(link);
        // wait for the contents inside specified element
        await page.waitForSelector(".wikiepisodetable>tbody");
        // Fetch HTML of the page we want to scrape
        data += await page.content();
      }
      // pass data to processData(function) for further processing using cheerio;
      processData(data);
    } catch (error) {
      console.log(error);
    } finally {
      await browser.close(); // Close the browser once done
    }
  });
};

module.exports = scraper;