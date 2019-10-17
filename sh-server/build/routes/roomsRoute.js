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
Object.defineProperty(exports, "__esModule", { value: true });
const routeCommon_1 = require("./routeCommon");
const helpers_1 = require("../models/helpers");
var express = require('express');
var router = express.Router();
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    try {
        let rooms = yield req.roomService.getRooms(context);
        res.json(helpers_1.getHttpResposeJson(rooms, false));
    }
    catch (error) {
        req.logService.error("Error getting rooms", error);
        res.status(routeCommon_1.HttpResponseCodes.internalServerError).send().end();
    }
}));
exports.default = router;
//# sourceMappingURL=roomsRoute.js.map