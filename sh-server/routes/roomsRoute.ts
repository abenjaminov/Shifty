import { Room, Condition } from "../models/models";
import { Router } from "express-serve-static-core";
import { RoutesCommon } from "./routeCommon";
import { getHttpResposeJson } from "../models/helpers";

var express = require('express');
var router: Router = express.Router();

router.get('/', function(req, res, next) {
  var context = RoutesCommon.getContextFromRequest(req);
  
    context.select(Room, true, true).then(rooms => {
      res.json(getHttpResposeJson(rooms, false));
    });
});

export default router;
