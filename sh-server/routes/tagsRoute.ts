import { Tag, Condition } from "../models/models";
import { Router } from "express-serve-static-core";
import { RoutesCommon } from "./routeCommon";
import { getHttpResposeJson } from "../models/helpers";

var express = require('express');
var router : Router = express.Router();

router.get('/', function(req, res, next) {
  var context = RoutesCommon.getContextFromRequest(req);
  
    context.select<Tag>(Tag, true).then(tags => {
      res.json(getHttpResposeJson(tags, true));
    });
});

export default router;
