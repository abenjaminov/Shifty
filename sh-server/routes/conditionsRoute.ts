import { Condition } from "../models/models";
import { Router } from "express-serve-static-core";
import { RoutesCommon } from "./routeCommon";
import { getHttpResposeJson } from "../models/helpers";

import * as express from 'express';
var router: Router = express.Router();

router.get('/', function(req, res, next) {
    var context = RoutesCommon.getContextFromRequest(req);
  
    context.select(Condition, true).then(conditions => {
      res.json(getHttpResposeJson(conditions, false));
    });
});

router.post('/', (req,res,next) => {
    var condition: Condition = req.body;

    var context = RoutesCommon.getContextFromRequest(req);

    context.insert(Condition, [condition]).then(x => {
        req.cacheService.clearByPrefix('/api/conditions');
        res.json(getHttpResposeJson(condition, true));
    }).catch(error => {
        req.logService.error(error.message, error);
        res.status(500).send();
    });
});

router.delete('/:id',(req,res,next) => {
    var conditionId = req.params["id"];

    var context = RoutesCommon.getContextFromRequest(req);

    context.deleteSimple(Condition, conditionId).then(x => {
        req.cacheService.clearByPrefix('/api/conditions');
        res.json(getHttpResposeJson(true, true));
    }).catch(error => {
        req.logService.error(error.message, error);
        res.status(500).send();
    })
});

export default router;
