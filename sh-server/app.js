var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var profiles = require('./routes/profilesController');
var tags = require('./routes/tagsController');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use('/api/profiles', profiles);
app.use('/api/tags', tags);

module.exports = app;
