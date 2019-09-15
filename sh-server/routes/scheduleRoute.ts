import { ScheduleService } from "../services/schedule.service";
import { RoutesCommon } from "./routeCommon";
import { Profile, Assignment, Room, DailySchedule, Day, ConditionType, Condition } from "../models/models";
import { GeneticEnviroment } from "../genetics/evniroment";
import { Router, Request } from "express";
import Enumerable from 'linq';

var express = require('express');
var router: Router = express.Router();

router.get('/run', async (req: Request,res,next) => {
    var context = RoutesCommon.getContextFromRequest(req);

    var profiles = await context.select<Profile>(Profile, true,true, []);
    var rooms = await context.select<Room>(Room, true,true, []);

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
        let day = scheduleService.getDayByDate(dates[index]);
        var permanentConditionsForThisDay = Enumerable.from(rooms).selectMany(r => r.conditions).where(c => c.type === ConditionType.Permanent && c.day == day).toArray();

        profileIdsNotAllowedForThisDay = profileIdsNotAllowedForThisDay.concat(permanentConditionsForThisDay.map(c => c.profileId));

        var profilesForThisDay = profiles.filter(p => profileIdsNotAllowedForThisDay.findIndex(pid => pid == p.id) == -1);
        let geneticEnv = new GeneticEnviroment();

        let roomsForDay = prepRoomsForRun(rooms, permanentConditionsForThisDay);

        var solutionForThisDay = geneticEnv.run(profilesForThisDay, roomsForDay); 

        let roomsDictionary = Enumerable.from(rooms).toDictionary(r => r.id);

        for(let gene of solutionForThisDay.genes) {
            let assignment = new Assignment();
            let date = dates[index];
            assignment.date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            assignment.profileId = gene.profile.id;
            
            let room = roomsDictionary.get(gene.roomId);
            var condition = room.conditions.find((c: Condition) => c.importance == gene.importance && c.professionId == gene.profession.id);
            assignment.conditionId = condition.id;

            assignments.push(assignment);
        }

        for(let condition of permanentConditionsForThisDay) {
            let assignment = new Assignment();
            let date = dates[index];

            assignment.date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            assignment.profileId = condition.profileId;

            assignment.conditionId = condition.id;

            assignments.push(assignment);
        }
    }

    var result = await context.insert<Assignment>(Assignment, assignments).catch((err:string) => {
        console.log(err);

        return err;
    });

    if(!(result as any).affectedRows) {
        res.status(500).json("Error occured running scheduler");
    }
    else {
        res.json("Success running scheduler");
    }
});

var prepRoomsForRun = (rooms: Array<Room>, permanentConditionsForThisDay: Array<Condition>) => {
    let roomsInternal: Array<Room> = Object.assign([], rooms.map(r => Object.assign({}, r)));

    for(let room of roomsInternal) {
        room.conditions = room.conditions.filter(c => c.type != ConditionType.Permanent);
    }

    for(let permanentCondition of permanentConditionsForThisDay) {
        let room = roomsInternal.find(r => r.id == permanentCondition.roomId);

        if(!room) {
            // TODO : Log Error
        }
        else {
            let conditionWithSameProfession = room.conditions.find(c => c.professionId == permanentCondition.professionId);

            if(conditionWithSameProfession) {
                room.conditions = room.conditions.filter(x => x.id != conditionWithSameProfession.id)
            }
        }
    }

    return roomsInternal;
}

router.get('/test', async (req,res,next) => {
    var solution = GeneticEnviroment.test();

    res.json(solution);
});

router.get('/:date?', async (req,res,next) => {
    let scheduleService = new ScheduleService(RoutesCommon.getContextFromRequest(req));

    var firstDate = undefined;

    if(req.params.date) {
        var dateParts = req.params.date.split(";");
        firstDate = new Date(Number(dateParts[0]), Number(dateParts[1]), Number(dateParts[2]));
    }

    let weeklySchedule = await scheduleService.getWeeklySchedule(firstDate)
    
    res.json({data : weeklySchedule});
});



module.exports = router;