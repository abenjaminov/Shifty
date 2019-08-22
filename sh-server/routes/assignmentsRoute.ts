import {  Assignment } from "../models/models";
import { Router } from "express-serve-static-core";
import { RoutesCommon } from "./routeCommon";

var express = require('express');
var router: Router = express.Router();

router.get('/', function(req, res, next) {
    var context = RoutesCommon.getContextFromRequest(req);
  
    context.select(Assignment, true).then(assignments => {
      res.json({data : assignments});
    });
});

router.post('/', (req,res,next) => {
    var assignment = req.body;

    var context = RoutesCommon.getContextFromRequest(req);

    context.insert(Assignment, assignment).then(x => {
        res.json({data : assignment});
    });
})

module.exports = router;
