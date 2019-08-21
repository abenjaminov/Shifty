"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var database_1 = require("./database/database");
var profiles = require('./routes/profilesRoute');
var tags = require('./routes/tagsRoute');
var rooms = require('./routes/roomsRoute');
var app = express();
exports.app = app;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/*', function (req, res, next) {
    database_1.DbContext.getContext().then(function (context) {
        req.dbContext = context;
        next();
    }).catch(function (error) {
    });
});
app.use('/api/profiles', profiles);
app.use('/api/tags', tags);
app.use('/api/rooms', rooms);
//# sourceMappingURL=app.js.map