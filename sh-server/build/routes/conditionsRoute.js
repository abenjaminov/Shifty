"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
router.get('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    let conditions = yield context.select(models_1.Condition, true, false, [{ dataFilters: [{ property: "isDeleted", value: false }] }]);
    res.json(helpers_1.getHttpResposeJson(conditions, false));
}));
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
router.delete('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    var conditionId = req.params["id"];
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    let conditions = yield context.select(models_1.Condition, false, false, [{ dataFilters: [{ property: "id", value: conditionId }] }]);
    if (!conditions || conditions.length == 0) {
        let error = `No Condition with id ${conditionId}`;
        res.status(routeCommon_1.HttpResponseCodes.badRequest).send(error);
        req.logService.error(error);
    }
    else {
        let conditionToDelete = conditions[0];
        conditionToDelete.isDeleted = true;
        try {
            yield context.update(models_1.Condition, conditionToDelete, true);
            req.cacheService.clearByPrefix('/api/conditions');
            res.json(helpers_1.getHttpResposeJson(true, true));
        }
        catch (error) {
            req.logService.error(error.message, error);
            res.status(routeCommon_1.HttpResponseCodes.badRequest).send(error);
        }
    }
}));
exports.default = router;
//# sourceMappingURL=conditionsRoute.js.map