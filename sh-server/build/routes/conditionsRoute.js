"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models/models");
const routeCommon_1 = require("./routeCommon");
const helpers_1 = require("../models/helpers");
const express = __importStar(require("express"));
var router = express.Router();
router.get('/', function (req, res, next) {
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    context.select(models_1.Condition, true).then(conditions => {
        res.json(helpers_1.getHttpResposeJson(conditions, false));
    });
});
router.post('/', (req, res, next) => {
    var condition = req.body;
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    context.insert(models_1.Condition, [condition]).then(x => {
        req.cacheService.clearByPrefix('/api/conditions');
        res.json(helpers_1.getHttpResposeJson(condition, true));
    }).catch(error => {
        req.logService.error(error.message, error);
        res.status(500).send();
    });
});
router.delete('/:id', (req, res, next) => {
    var conditionId = req.params["id"];
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    context.deleteSimple(models_1.Condition, conditionId).then(x => {
        req.cacheService.clearByPrefix('/api/conditions');
        res.json(helpers_1.getHttpResposeJson(true, true));
    }).catch(error => {
        req.logService.error(error.message, error);
        res.status(500).send();
    });
});
exports.default = router;
//# sourceMappingURL=conditionsRoute.js.map