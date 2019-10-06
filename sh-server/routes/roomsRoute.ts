import { Room, Condition } from "../models/models";
import { Router } from "express-serve-static-core";
import { RoutesCommon } from "./routeCommon";
import { getHttpResposeJson } from "../models/helpers";

var express = require('express');
var router: Router = express.Router();

router.get('/', async (req, res, next) => {
  var context = RoutesCommon.getContextFromRequest(req);
  
  try {
    let rooms = await req.roomService.getRooms(context);

    res.json(getHttpResposeJson(rooms, false));
  }
  catch (error) {
    req.logService.error("Error getting rooms", error)
    res.status(500).send().end();
  }
  
});

export default router;
