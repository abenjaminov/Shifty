"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoutesCommonService {
    getContextFromRequest(req) {
        return req.dbContext;
    }
}
exports.RoutesCommonService = RoutesCommonService;
var HttpResponseCodes;
(function (HttpResponseCodes) {
    HttpResponseCodes[HttpResponseCodes["success"] = 200] = "success";
    HttpResponseCodes[HttpResponseCodes["internalServerError"] = 500] = "internalServerError";
    HttpResponseCodes[HttpResponseCodes["badRequest"] = 400] = "badRequest";
    HttpResponseCodes[HttpResponseCodes["unauthorized"] = 401] = "unauthorized";
    HttpResponseCodes[HttpResponseCodes["notFound"] = 404] = "notFound";
})(HttpResponseCodes = exports.HttpResponseCodes || (exports.HttpResponseCodes = {}));
var RoutesCommon = new RoutesCommonService();
exports.RoutesCommon = RoutesCommon;
//# sourceMappingURL=routeCommon.js.map