"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoutesCommonService {
    getContextFromRequest(req) {
        return req.dbContext;
    }
}
exports.RoutesCommonService = RoutesCommonService;
var RoutesCommon = new RoutesCommonService();
exports.RoutesCommon = RoutesCommon;
//# sourceMappingURL=routeCommon.js.map