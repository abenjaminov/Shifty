import express = require('express');
import path = require('path');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import { DbContext } from './database/database';
import { RoutesCommon } from './routes/routeCommon';
import { ScheduleService } from './services/schedule.service';
import { Request } from "express";
import { CacheService } from './services/cache.service';
import x from './typings/index'
import { AuthenticationService } from './services/authentication.service';

var pino = require('express-pino-logger')();

var profiles = require('./routes/profilesRoute');
var tags = require('./routes/tagsRoute');
var rooms = require('./routes/roomsRoute');
var conditions = require('./routes/conditionsRoute');
var schedule = require('./routes/scheduleRoute');

const app: express.Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser())

app.use(pino);

pino.logger.info("Hello");

var freePassRoutes = [
    '/api/schedule/test',
    '/api/clearthecacheforthisapp'
]

app.use('/api/clearthecacheforthisapp', (req,res) => {
    var cacheService = new CacheService();

    cacheService.clear();

    res.json("Cache clear");
})

app.use('/api/login', async (req,res) => {
    let customerCode = req.body.customerCode;
    let username = req.body.username;
    let password = req.body.password;

    let authenticationService = new AuthenticationService();
    res.json({token: authenticationService.getToken("obenjaminov"), username: username, customerCode: customerCode})
    return;
    
    let tenantContext = await DbContext.getContext("Tenants");

    let query = `SELECT * FROM TENANTS WHERE NAME = '${customerCode}'`;

    try {
        let result = await tenantContext.queryToPromise(query)
        tenantContext.close();

        if(result.length == 0) {
            res.status(400).send("Non existing customer code");
        }
        else {
            let context = await DbContext.getContext(customerCode)

            // TODO : Verify password and username
            query = `SELECT * FROM USERS WHERE USERNAME = '${username}'`

            result = await context.queryToPromise(query);

            if(result.length == 0) {
                res.status(400).send("Non existing customer code");
            }
            else {

                // TODO : Verify password

                let authenticationService = new AuthenticationService();
                res.json({token: authenticationService.getToken("obenjaminov"), username: username, customerCode: customerCode})
            }
        }
    } catch (error) {
        // TODO : Log
        res.status(500).send();
    }
});

app.use('/api/*', (req: Request ,res,next) => {
    (req as any).log.info("-> " + req.originalUrl);
    
    let authorizedResult = new AuthenticationService().authenticate(req.headers.authorization, req.body.username);

    if(!authorizedResult.authorized) {
        res.status(401).send("Sesson expired");
    }
    else {
        var realJson = res.json;

        if(req.method == "GET") {
            var cacheService = new CacheService();
            let result = cacheService.getValue(req.originalUrl)
            if(result) {
                res.json(result);
                return;
            }
        }
    
        // Override json so that the context can be closed
        res.json = function(body?: any) {
            var context = RoutesCommon.getContextFromRequest(req);
            if(context)
            {
                context.close();
            }
    
            if(req.method == "GET") {
                cacheService.setValue(req.originalUrl, body);
            }
    
            return realJson.call(this, body);
        };
    
        (req as any).tenant = "ZedekMC";
    
        if(freePassRoutes.find(x => x === req.originalUrl) != undefined) {
            next();
            return;
        }
    
        DbContext.getContext((req as any).tenant).then(context => {
            req.dbContext = context;
            req.scheduleService = new ScheduleService(context);
            
    
            next();
        }).catch(error => {
            res.status(500).send("Error establishing connection and context");
        });
    }
})

app.use('/api/profiles', profiles);
app.use('/api/tags', tags);
app.use('/api/rooms', rooms);
app.use('/api/conditions', conditions);
app.use('/api/schedule', schedule);

export { app };
