# One Piece Episodes Node Web Scraper

This project is a web scraper built in Node JS used to collect information about each episode of the One Piece anime from the Wikipedia page (https://en.wikipedia.org/wiki/Lists_of_One_Piece_episodes). The technologies used include Express.js, Axios, Cheerio, and Puppeteer.

The information collected include:

- Episode Number
- Title (English, Japanese and Transliteration)
- Summary
- Director
- Writer
- Animator(s)
- Date Aired

## Project Structure

The project is an Express.js application that uses Axios for making HTTP requests, Cheerio for parsing HTML, and Puppeteer for browser automation.

### Install Dependencies

#### `npm install`

### Getting Started

Run npm start to use the application

#### `npm start`

### Output

After running the application, the data retrieved is stored both in JSON and XML files.