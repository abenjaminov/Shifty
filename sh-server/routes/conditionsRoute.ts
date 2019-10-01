import {  Condition } from "../models/models";
import { Router } from "express-serve-static-core";
import { RoutesCommon } from "./routeCommon";
import { getHttpResposeJson } from "../models/helpers";

var express = require('express');
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
    });
});

router.delete('/:id',(req,res,next) => {
    var conditionId = req.params["id"];

    var context = RoutesCommon.getContextFromRequest(req);

    context.deleteSimple(Condition, conditionId).then(x => {
        req.cacheService.clearByPrefix('/api/conditions');
        res.json(getHttpResposeJson(true, true));
    }).catch(err => {
        // TODO : Log
        console.error("Delete Condition " + err);
        res.status(500).send();
    })
});

module.exports = router;
