const express = require('express');
const routes = require('./routes/index.js');

const app = express();
const host = 'localhost';
const port = 3000;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('<h1>Testing Server!</h1>');
});

app.listen(port, host, () => {
  console.log(`Server running on port ${port}.`);
})