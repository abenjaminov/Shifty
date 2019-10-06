"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models/models");
const routeCommon_1 = require("./routeCommon");
const helpers_1 = require("../models/helpers");
var express = require('express');
var router = express.Router();
router.get('/', function (req, res, next) {
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    context.select(models_1.Tag, true).then(tags => {
        res.json(helpers_1.getHttpResposeJson(tags, true));
    });
});
exports.default = router;
//# sourceMappingURL=tagsRoute.js.map