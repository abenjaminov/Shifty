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
import { LogService, LoggerTypes } from './services/logs.service';
import { runInNewContext } from 'vm';

var profiles = require('./routes/profilesRoute');
var tags = require('./routes/tagsRoute');
var rooms = require('./routes/roomsRoute');
var conditions = require('./routes/conditionsRoute');
var schedule = require('./routes/scheduleRoute');

const app: express.Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser())

var freePassRoutes = [
    '/api/schedule/test',
    '/api/clearthecacheforthisapp'
]

app.use("/api/*", (req, res, next) => {
    var logService = new LogService("App");
    let date = new Date();
    let timestamp = `[${date.getDate()}/${date.getMonth()}/${date.getFullYear()}] ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    logService.init(LoggerTypes.console);
    logService.info(`${timestamp}. Incomming -> ${req.originalUrl} ${req.method}`);
    next();
})

app.use('/api/clearthecacheforthisapp', (req,res) => {
    var logService = new LogService("Clear Cache");
    
    var cacheService = new CacheService();

    cacheService.clear();

    logService.info("Cache cleared");
    res.json("Cache clear");
})

app.use('/api/login', async (req,res) => {
    var logService = new LogService("Login");
    let customerCode = req.body.customerCode;

    try {
        let tenantContext = await DbContext.getContext("Tenants");

        let query = `SELECT * FROM TENANTS WHERE NAME = '${customerCode}'`;

        let result = await tenantContext.queryToPromise(query)
        tenantContext.close();

        if(result.length == 0) {
            logService.warning(`Non existing customer code ${customerCode}`);
            res.status(400).send("Non existing customer code");
        }
        else {
            let context = await DbContext.getContext(customerCode)

            let username = req.body.username;
            let password = req.body.password;

            query = `SELECT * FROM USERS WHERE USERNAME = '${username}'`

            result = await context.queryToPromise(query);

            if(result.length == 0) {
                logService.warning(`Non existing username ${username}`);
                res.status(400).send("Non existing username");
            }
            else {
                let user = result[0];
                query = `SELECT * FROM PASSWORDS WHERE USERID = '${user.id}'`

                result = await context.queryToPromise(query);

                let authenticationService = new AuthenticationService();

                let passverified = authenticationService.verifyPassword(password, result[0].value, customerCode);

                if(passverified) {
                    res.json({token: authenticationService.getToken("obenjaminov"), username: username, customerCode: customerCode})
                }
                else {
                    // TODO : Restrict to 3 attempts
                    logService.warning(`incorrect password ${password}`);
                    res.status(400).send("Password incorrect");
                }
            }
        }
    } catch (error) {
        logService.error("Error while logging in", error);
        res.status(500).send();
    }
});

app.use('/api/*', (req: Request ,res,next) => {
    var logService = new LogService("Authenticate");
    let authorizedResult = new AuthenticationService().authenticate(req.headers.authorization, req.body.username);

    if(!authorizedResult.authorized) {
        logService.warning(`Authentication failed for '${req.body.username}', token : '${req.headers.authorization}'`);
        res.status(401).send("Sesson expired");
    }
    else {
        next();
    }
});

app.use('/api/*', (req: Request ,res,next) => {
    var logService = new LogService(req.originalUrl);
    
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

    (req as any).tenantName = "ZedekMC";

    if(freePassRoutes.find(x => x === req.originalUrl) != undefined) {
        next();
        return;
    }

    DbContext.getContext((req as any).tenantName).then(context => {
        req.dbContext = context;
        req.scheduleService = new ScheduleService(context);
        req.logService = logService;

        next();
    }).catch(error => {
        res.status(500).send("Error establishing connection and context");
    });
})

app.use('/api/profiles', profiles);
app.use('/api/tags', tags);
app.use('/api/rooms', rooms);
app.use('/api/conditions', conditions);
app.use('/api/schedule', schedule);

export { app };
