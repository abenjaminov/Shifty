import express = require('express');
import path = require('path');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');

import { DbContext } from './database/database';

var profiles = require('./routes/profilesRoute');
var tags = require('./routes/tagsRoute');
var rooms = require('./routes/roomsRoute');

const app: express.Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use('/api/*', (req ,res,next) => {
    console.log("All Request");

    DbContext.getContext().then(context => {
        (req as any).dbContext = context;

        next();
    }).catch(error => {

    });
})

app.use('/api/profiles', profiles);
app.use('/api/tags', tags);
app.use('/api/rooms', rooms);

export { app };
