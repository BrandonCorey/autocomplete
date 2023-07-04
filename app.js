const express = require('express');
const indexRouter = require('./routes/index');

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use('/', indexRouter);

module.exports = app;