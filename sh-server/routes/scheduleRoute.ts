import { ScheduleService } from "../services/schedule.service";
import { RoutesCommon } from "./routeCommon";
import { Profile, Assignment, Room, DailySchedule, Day } from "../models/models";
import { GeneticEnviroment } from "../genetics/evniroment";
import { Router, Request } from "express";

var express = require('express');
var router: Router = express.Router();

router.get('/run', async (req: Request,res,next) => {
    var context = RoutesCommon.getContextFromRequest(req);

    var profiles = await context.select<Profile>(Profile, true, []);
    var rooms = await context.select<Room>(Room, true, []);

    var lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    var scheduleService = req.scheduleService;

    let lastWeeksSchedule = await scheduleService.getWeeklySchedule(lastWeekDate);

    var prevDay = lastWeeksSchedule.days[Day.Saturday];

    // TODO : Take care of other conditions such as vacations and more
    let profileIdsNotAllowedForThisDay = prevDay.assignments.filter(a => a.condition.isLockedForNextDay).map(a => a.profileId);

    var dates = scheduleService.getDatesOfWeek();

    var assignments: Array<Assignment> = []

    for (let index = 0; index < dates.length; index++) {
        var profilesForThisDay = profiles.filter(p => profileIdsNotAllowedForThisDay.findIndex(pid => pid == p.id) == -1);
        let geneticEnv = new GeneticEnviroment();

        var solutionForThisDay = geneticEnv.run(profilesForThisDay, rooms);

        for(let gene of solutionForThisDay.genes) {
            var assignment = new Assignment();
            assignment.date = dates[index];
            assignment.profileId = gene.profile.id;
            
            var room = rooms.find(r => r.id == gene.roomId);
            var condition = room.conditions.find(c => c.importance == gene.importance && c.professionId == gene.profession.id);
            assignment.conditionId = condition.id;

            assignments.push(assignment);
        }
    }

    var result = await context.insert<Assignment>(Assignment, assignments).catch((err:string) => {
        console.log(err);

        return err;
    });

    if(!Array.isArray(result)) {
        res.status(500).json("Error occured running scheduler");
    }
    else {
        res.json("Success running scheduler");
    }
});

router.get('/test', async (req,res,next) => {
    var solution = GeneticEnviroment.test();

    res.json(solution);
});

router.get('/:date?', (req,res,next) => {
    let scheduleService = new ScheduleService(RoutesCommon.getContextFromRequest(req));

    scheduleService.getWeeklySchedule().then(x => {
        console.log(x)

        res.json(x);
    })
});



module.exports = router;