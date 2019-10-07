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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const routeCommon_1 = require("./routeCommon");
const models_1 = require("../models/models");
const helpers_1 = require("../models/helpers");
const express = __importStar(require("express"));
var router = express.Router();
/* GET users listing. */
router.get('/:id?', (req, res) => {
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    var filter = [{ dataFilters: [] }];
    if (req.params.id) {
        filter[0].dataFilters.push({
            property: "id",
            value: req.params.id
        });
    }
    context.select(models_1.Profile, true, true, filter).then(profiles => {
        res.json(helpers_1.getHttpResposeJson(profiles, false));
    }).catch(err => {
        console.error("Put Profile " + err);
        // TODO : Log Error
    });
});
router.put('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var profile = req.body;
    fixProfileBeforeSave(profile);
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    context.connection.beginTransaction();
    try {
        yield context.update(models_1.Profile, profile);
        yield context.updateOneToManyMappings(models_1.Profile, profile);
        yield context.deleteConnections(models_1.Absence, "profileId", profile.id, profile.absences.filter(x => x.id).map(x => x.id));
        yield context.updateOrInsert(models_1.Absence, profile.absences);
        yield context.deleteConnections(models_1.NonWorkingDay, "profileId", profile.id, profile.nonWorkingDays.filter(x => x.id).map(x => x.id));
        yield context.updateOrInsert(models_1.NonWorkingDay, profile.nonWorkingDays);
        context.connection.commit();
        req.cacheService.clearByPrefix('/api/profiles');
        res.json(helpers_1.getHttpResposeJson(profile, true));
    }
    catch (error) {
        console.error("Put Profile " + error);
        context.connection.rollback();
        res.status(500).send();
    }
}));
function fixProfileBeforeSave(profile) {
    if (profile.absences && profile.absences.length > 0) {
        for (let absence of profile.absences) {
            let startDate = new Date(absence.startDate);
            let endDate = new Date(absence.endDate);
            absence.startDate = helpers_1.toUtcDate(startDate);
            absence.endDate = helpers_1.toUtcDate(endDate);
        }
    }
}
exports.default = router;
//# sourceMappingURL=profilesRoute.js.map