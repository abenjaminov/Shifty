import { Condition } from "../models/models";
import { Router } from "express-serve-static-core";
import { RoutesCommon, HttpResponseCodes } from "./routeCommon";
import { getHttpResposeJson } from "../models/helpers";

import * as express from 'express';
var router: Router = express.Router();

// Get conditions
router.get('/', async (req, res) => {
    var context = RoutesCommon.getContextFromRequest(req);
  
    let conditions = await context.select(Condition, true,false,[{ dataFilters: [{ property: "isDeleted", value: false }] }]);
    
    res.json(getHttpResposeJson(conditions, false));
});

// Add Condition
router.post('/', (req,res,next) => {
    var condition: Condition = req.body;

    var context = RoutesCommon.getContextFromRequest(req);

    context.insert(Condition, [condition]).then(x => {
        req.cacheService.clearByPrefix('/api/conditions');
        res.json(getHttpResposeJson(condition, true));
    }).catch(error => {
        req.logService.error(error.message, error);
        res.status(HttpResponseCodes.internalServerError).send().end();
    });
});

// Delete Condition
router.delete('/:id',async (req,res,next) => {
    var conditionId = req.params["id"];

    var context = RoutesCommon.getContextFromRequest(req);

    let conditions: Array<Condition> = await context.select(Condition, false, false, [{ dataFilters: [{ property: "id", value: conditionId }] }])

    if(!conditions || conditions.length == 0) {
        let error = `No Condition with id ${conditionId}`;
        req.logService.error(error);
        res.status(HttpResponseCodes.badRequest).send(error).end();
    }
    else {
        let conditionToDelete = conditions[0];
        conditionToDelete.isDeleted = true;

        try {
            await context.update(Condition, conditionToDelete,true);
            req.cacheService.clearByPrefix('/api/conditions');
            res.json(getHttpResposeJson(true, true));
        }
        catch (error) {
            req.logService.error(error.message, error);
            res.status(HttpResponseCodes.badRequest).send(error).end();
            
        }
    }
});

export default router;
