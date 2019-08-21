import { DbContext } from "../database/database";

export class RoutesCommonService {

    getContextFromRequest(req: any): DbContext {
        return req.dbContext;
    }
}

var RoutesCommon = new RoutesCommonService();

export { RoutesCommon }