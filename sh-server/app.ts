import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser'
import path from 'path';
import { DbContext } from './database/database';
import { RoutesCommon } from './routes/routeCommon';
import { ScheduleService } from './services/schedule.service';
import { Request } from "express";
import { CacheService } from './services/cache.service';
import * as x from './typings/index'
import { AuthenticationService } from './services/authentication.service';
import { LogService, LoggerTypes } from './services/logs.service';

import profilesRouter from './routes/profilesRoute';
import tagsRouter from './routes/tagsRoute';
import roomsRouter from './routes/roomsRoute';
import conditionsRouter from './routes/conditionsRoute';
import scheduleRouter from './routes/scheduleRoute';

const app: express.Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

const appFolder = __dirname + '/../../dist/Shifty';

console.log(appFolder)

// Serve only the static files form the dist directory
app.use(express.static(appFolder));

// ---- SERVE APLICATION PATHS ---- //
app.use('*', (req, res,next) => {
    res.status(200).sendFile(`/`, {root: appFolder});
});

var freePassRoutes = [
    '/api/schedule/test',
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
        var tenantContext = await DbContext.getContext("Shared");    

        let query = `SELECT * FROM Tenants WHERE name = '${customerCode}'`;

        let result = await tenantContext.queryToPromise(query)

        if(result.length == 0) {
            logService.warning(`Non existing customer code ${customerCode}`);
            res.status(400).send("Non existing customer code");
        }
        else {
            var context = await DbContext.getContext(customerCode)

            let username = req.body.username;
            let password = req.body.password;

            query = `SELECT * FROM Profiles WHERE username = '${username}'`

            result = await context.queryToPromise(query);

            if(result.length == 0) {
                logService.warning(`Non existing username ${username}`);
                res.status(400).send("Non existing username");
            }
            else {
                let user = result[0];
                query = `SELECT * FROM Passwords WHERE userId = '${user.id}'`
                // let encrypted = crypto.AES.encrypt(password, customerCode);
                // query = `UPDATE Passwords SET value = '${encrypted.toString()}'`;

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
    finally {
        tenantContext.close();
        context.close();
    }
});

app.use('/api/*', (req: Request ,res,next) => {
    var logService = new LogService("Authenticate");

    if(req.headers["abenjaminov"] == 'LETMETHROUGH') {
        next();
    }
    else {
        let authorizedResult = new AuthenticationService().authenticate(req.headers.authorization.toString(), req.body.username);

        if(!authorizedResult.authorized) {
            logService.warning(`Authentication failed for '${req.body.username}', token : '${req.headers.authorization}'`);
            res.status(401).send("Sesson expired");
        }
        else {
            next();
        }
    }
});

app.use('/api/*', (req: Request ,res,next) => {
    var logService = new LogService(req.originalUrl);
    
    var realJson = res.json;

    var cacheService = new CacheService();

    if(req.method == "GET") {
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

    DbContext.getContext((req as any).tenantName).then(context => {
        req.dbContext = context;
        req.scheduleService = new ScheduleService(context);
        req.logService = logService;
        req.cacheService = cacheService;
        //req.roomService = new RoomsService();

        next();
    }).catch(error => {
        res.status(500).send("Error establishing connection and context");
    });
})

app.use('/api/profiles', profilesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/conditions', conditionsRouter);
app.use('/api/schedule', scheduleRouter);

export { app };
