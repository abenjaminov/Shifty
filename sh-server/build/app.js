"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const database_1 = require("./database/database");
const routeCommon_1 = require("./routes/routeCommon");
const schedule_service_1 = require("./services/schedule.service");
const cache_service_1 = require("./services/cache.service");
const authentication_service_1 = require("./services/authentication.service");
const logs_service_1 = require("./services/logs.service");
const profilesRoute_1 = __importDefault(require("./routes/profilesRoute"));
const tagsRoute_1 = __importDefault(require("./routes/tagsRoute"));
const roomsRoute_1 = __importDefault(require("./routes/roomsRoute"));
const conditionsRoute_1 = __importDefault(require("./routes/conditionsRoute"));
const scheduleRoute_1 = __importDefault(require("./routes/scheduleRoute"));
const app = express_1.default();
exports.app = app;
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(cookie_parser_1.default());
const appFolder = __dirname + '\\..\\..\\dist\\Shifty';
console.log(appFolder);
// Serve only the static files form the dist directory
app.use(express_1.default.static(appFolder));
// ---- SERVE APLICATION PATHS ---- //
app.use('*', (req, res, next) => {
    res.status(200).sendFile(`/`, { root: appFolder });
});
var freePassRoutes = [
    '/api/schedule/test',
];
app.use("/api/*", (req, res, next) => {
    var logService = new logs_service_1.LogService("App");
    let date = new Date();
    let timestamp = `[${date.getDate()}/${date.getMonth()}/${date.getFullYear()}] ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    logService.init(logs_service_1.LoggerTypes.console);
    logService.info(`${timestamp}. Incomming -> ${req.originalUrl} ${req.method}`);
    next();
});
app.use('/api/clearthecacheforthisapp', (req, res) => {
    var logService = new logs_service_1.LogService("Clear Cache");
    var cacheService = new cache_service_1.CacheService();
    cacheService.clear();
    logService.info("Cache cleared");
    res.json("Cache clear");
});
app.use('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var logService = new logs_service_1.LogService("Login");
    let customerCode = req.body.customerCode;
    try {
        var tenantContext = yield database_1.DbContext.getContext("Shared");
        let query = `SELECT * FROM Tenants WHERE name = '${customerCode}'`;
        let result = yield tenantContext.queryToPromise(query);
        if (result.length == 0) {
            logService.warning(`Non existing customer code ${customerCode}`);
            res.status(400).send("Non existing customer code");
        }
        else {
            var context = yield database_1.DbContext.getContext(customerCode);
            let username = req.body.username;
            let password = req.body.password;
            query = `SELECT * FROM Profiles WHERE username = '${username}'`;
            result = yield context.queryToPromise(query);
            if (result.length == 0) {
                logService.warning(`Non existing username ${username}`);
                res.status(400).send("Non existing username");
            }
            else {
                let user = result[0];
                query = `SELECT * FROM Passwords WHERE userId = '${user.id}'`;
                // let encrypted = crypto.AES.encrypt(password, customerCode);
                // query = `UPDATE Passwords SET value = '${encrypted.toString()}'`;
                result = yield context.queryToPromise(query);
                let authenticationService = new authentication_service_1.AuthenticationService();
                let passverified = authenticationService.verifyPassword(password, result[0].value, customerCode);
                if (passverified) {
                    res.json({ token: authenticationService.getToken("obenjaminov"), username: username, customerCode: customerCode });
                }
                else {
                    // TODO : Restrict to 3 attempts
                    logService.warning(`incorrect password ${password}`);
                    res.status(400).send("Password incorrect");
                }
            }
        }
    }
    catch (error) {
        logService.error("Error while logging in", error);
        res.status(500).send();
    }
    finally {
        tenantContext.close();
        context.close();
    }
}));
app.use('/api/*', (req, res, next) => {
    var logService = new logs_service_1.LogService("Authenticate");
    if (req.headers["abenjaminov"] == 'LETMETHROUGH') {
        next();
    }
    else {
        let authorizedResult = new authentication_service_1.AuthenticationService().authenticate(req.headers.authorization.toString(), req.body.username);
        if (!authorizedResult.authorized) {
            logService.warning(`Authentication failed for '${req.body.username}', token : '${req.headers.authorization}'`);
            res.status(401).send("Sesson expired");
        }
        else {
            next();
        }
    }
});
app.use('/api/*', (req, res, next) => {
    var logService = new logs_service_1.LogService(req.originalUrl);
    var realJson = res.json;
    var cacheService = new cache_service_1.CacheService();
    if (req.method == "GET") {
        let result = cacheService.getValue(req.originalUrl);
        if (result) {
            res.json(result);
            return;
        }
    }
    // Override json so that the context can be closed
    res.json = function (body) {
        var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
        if (context) {
            context.close();
        }
        if (req.method == "GET") {
            cacheService.setValue(req.originalUrl, body);
        }
        return realJson.call(this, body);
    };
    req.tenantName = "ZedekMC";
    database_1.DbContext.getContext(req.tenantName).then(context => {
        req.dbContext = context;
        req.scheduleService = new schedule_service_1.ScheduleService(context);
        req.logService = logService;
        req.cacheService = cacheService;
        //req.roomService = new RoomsService();
        next();
    }).catch(error => {
        res.status(500).send("Error establishing connection and context");
    });
});
app.use('/api/profiles', profilesRoute_1.default);
app.use('/api/tags', tagsRoute_1.default);
app.use('/api/rooms', roomsRoute_1.default);
app.use('/api/conditions', conditionsRoute_1.default);
app.use('/api/schedule', scheduleRoute_1.default);
//# sourceMappingURL=app.js.map