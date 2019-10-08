import { DbContext } from "../database/database";

export class RoutesCommonService {

    getContextFromRequest(req: any): DbContext {
        return req.dbContext;
    }
}

export enum HttpResponseCodes {
    success = 200,
    internalServerError = 500,
    badRequest = 400,
    unauthorized = 401,
    notFound = 404
}

var RoutesCommon = new RoutesCommonService();

export { RoutesCommon }