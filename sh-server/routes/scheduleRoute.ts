import { Router } from "express-serve-static-core";
import { ScheduleService } from "../services/schedule.service";
import { RoutesCommon } from "./routeCommon";
import { Profile } from "../models/models";

var express = require('express');
var router: Router = express.Router();

router.get('/:date?', (req,res,next) => {
    let scheduleService = new ScheduleService(RoutesCommon.getContextFromRequest(req));

    scheduleService.getWeeklySchedule().then(x => {
        console.log(x)

        res.json(x);
    })
});

router.get('/run', async (req,res,next) => {
    var context = RoutesCommon.getContextFromRequest(req);

    var profiles = await context.select<Profile>(Profile, true, []);
});

module.exports = router;