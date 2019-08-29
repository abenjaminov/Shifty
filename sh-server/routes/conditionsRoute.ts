import {  Condition } from "../models/models";
import { Router } from "express-serve-static-core";
import { RoutesCommon } from "./routeCommon";

var express = require('express');
var router: Router = express.Router();

router.get('/', function(req, res, next) {
    var context = RoutesCommon.getContextFromRequest(req);
  
    context.select(Condition, true).then(conditions => {
      res.json({data : conditions});
    });
});

router.post('/', (req,res,next) => {
    var condition = req.body;

    var context = RoutesCommon.getContextFromRequest(req);

    context.insert(Condition, condition).then(x => {
        res.json({data : condition});
    });
});

router.delete('/:id',(req,res,next) => {
    var conditionId = req.params["id"];

    var context = RoutesCommon.getContextFromRequest(req);

    context.deleteSimple(Condition, conditionId).then(x => {
        res.json({ data: true });
    }).catch(err => {
        // TODO : Log
        console.error("Delete Condition " + err);
    })
});

module.exports = router;