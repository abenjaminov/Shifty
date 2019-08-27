import { Room, Assignment } from "../models/models";
import { Router } from "express-serve-static-core";
import { RoutesCommon } from "./routeCommon";

var express = require('express');
var router: Router = express.Router();

router.get('/', function(req, res, next) {
  var context = RoutesCommon.getContextFromRequest(req);
  
    context.select(Room, true).then(rooms => {
      res.json({data : rooms});
    });
});

module.exports = router;
