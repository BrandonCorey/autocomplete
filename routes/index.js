const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const COUNTRIES_PATH = path.join(__dirname, '../data/countries.json');

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/countries', (req, res, next) => {
  let query = req.query.matching.toLowerCase() || '';
  let searchResults = searchCountry(query);
  res.json(searchResults);
});

function searchCountry(query) {
  if (query.length === 0) return [];
  return countries().filter((country) => {
    return nameStartsWith(country, query);
  }).slice(0, 20);
}

function countries() {
  let file = fs.readFileSync(COUNTRIES_PATH, 'utf8');
  return JSON.parse(file);
}

function nameStartsWith(country, chars) {
  return country['name'].toLowerCase().startsWith(chars)
}

module.exports = router;