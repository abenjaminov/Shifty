import express = require('express');
import path = require('path');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import { DbContext } from './database/database';
import { RoutesCommon } from './routes/routeCommon';
import { GeneticEnviroment } from './genetics/evniroment';

var pino = require('express-pino-logger')();

var profiles = require('./routes/profilesRoute');
var tags = require('./routes/tagsRoute');
var rooms = require('./routes/roomsRoute');
var assignments = require('./routes/assignmentsRoute');

const app: express.Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser())

app.use(pino);

pino.logger.info("Hello");

app.use('/api/*', (req ,res,next) => {
    (req as any).log.info("-> " + req.originalUrl);

    var realJson = res.json;

    // Override json so that the context can be closed
    res.json = function(body?: any) {
        var context = RoutesCommon.getContextFromRequest(req);
        context.close();

        return realJson.call(this, body);
    }

    DbContext.getContext().then(context => {
        (req as any).dbContext = context;

        next();
    }).catch(error => {
        res.status(500).json("Error establishing connection");
    });
})

app.use('/api/profiles', profiles);
app.use('/api/tags', tags);
app.use('/api/rooms', rooms);
app.use('/api/assignments', assignments);

export { app };
