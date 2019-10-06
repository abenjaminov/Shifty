"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models/models");
const routeCommon_1 = require("./routeCommon");
const helpers_1 = require("../models/helpers");
var express = require('express');
var router = express.Router();
router.get('/', function (req, res, next) {
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    context.select(models_1.Room, true, true).then(rooms => {
        res.json(helpers_1.getHttpResposeJson(rooms, false));
    });
});
exports.default = router;
//# sourceMappingURL=roomsRoute.js.map