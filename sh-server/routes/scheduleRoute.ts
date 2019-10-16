import { ScheduleService } from "../services/schedule.service";
import { RoutesCommon, HttpResponseCodes } from "./routeCommon";
import { Profile, Assignment, Room, Day, ConditionType, Condition } from "../models/models";
import { GeneticEnviroment } from "../genetics/evniroment";
import { Router, Request } from "express";
import Enumerable from 'linq';
import { getHttpResposeJson } from "../models/helpers";
import * as Excel from 'exceljs';

var express = require('express');
var router: Router = express.Router();

router.get('/run/:date?', async (req: Request,res,next) => {
    var context = RoutesCommon.getContextFromRequest(req);

    var profiles = await context.select<Profile>(Profile, true,true, []);
    var rooms = await req.roomService.getRooms(context);

    var firstDate = new Date();

    if(req.params.date) {
        var dateParts = req.params.date.split(";");
        firstDate = new Date(Date.UTC(Number(dateParts[0]), Number(dateParts[1]), Number(dateParts[2])));
    }
    else {
        firstDate = new Date();
        let firstDayOfWeek = firstDate.getUTCDate() - firstDate.getUTCDay()
        firstDate = new Date(firstDate.setUTCDate(firstDayOfWeek))
    }

    firstDate.setDate(firstDate.getDate() - 7);

    var scheduleService = req.scheduleService;

    let lastWeeksSchedule = await scheduleService.getWeeklySchedule(firstDate);

    firstDate.setDate(firstDate.getDate() + 7);

    var prevDayAssignments = Object.assign([], lastWeeksSchedule.days[Day.Saturday].assignments);

    var dates = scheduleService.getDatesOfWeek(firstDate);

    var assignments: Array<Assignment> = []

    for (let index = 0; index < dates.length; index++) {
        let day = scheduleService.getDayByDate(dates[index]);

        var permanentConditionsForThisDay = Enumerable.from(rooms).selectMany(r => r.conditions).where(c => c.type === ConditionType.Permanent && c.day == day).toArray();
        
        let profileIdsNotAllowedForThisDay = prevDayAssignments.filter(a => a.condition.isLockedForNextDay).map(a => a.profileId);
        profileIdsNotAllowedForThisDay = profileIdsNotAllowedForThisDay.concat(permanentConditionsForThisDay.map(c => c.profileId));

        var profilesForThisDay = profiles.filter(p => p.isAssigned && profileIdsNotAllowedForThisDay.findIndex(pid => pid == p.id) == -1);
        profilesForThisDay = Enumerable.from(profilesForThisDay).where(p => Enumerable.from(p.absences).all(abs => !scheduleService.isBetween(dates[index], abs.startDate, abs.endDate))).toArray();
        profilesForThisDay = Enumerable.from(profilesForThisDay).where(p => Enumerable.from(p.nonWorkingDays).all(nwd => nwd.day != day)).toArray();
        let geneticEnv = new GeneticEnviroment();

        let roomsForDay = prepRoomsForRun(rooms, permanentConditionsForThisDay);

        prevDayAssignments = [];

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
            assignment.condition = condition;

            prevDayAssignments.push(assignment);
            assignments.push(assignment);
        }

        for(let condition of permanentConditionsForThisDay) {
            let assignment = new Assignment();
            let date = dates[index];

            assignment.date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            assignment.profileId = condition.profileId;

            assignment.conditionId = condition.id;
            assignment.condition = condition;

            prevDayAssignments.push(assignment);
            assignments.push(assignment);
        }
    }

    
    try {
        await context.insert<Assignment>(Assignment, assignments);
        req.cacheService.clearByPrefix('/api/schedule');
        res.json(getHttpResposeJson("Success running scheduler", true));
    }
    catch(err) {
        req.logService.error("Error running schedule calculation", err)

        res.status(HttpResponseCodes.internalServerError).json("Error occured running scheduler");
    };
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
    //var solution = GeneticEnviroment.test();

    res.json(getHttpResposeJson(["solution","For","The","Genetics"], false));
});

// Get schedule from start date
router.get('/:date?', async (req,res,next) => {
    let scheduleService = new ScheduleService(RoutesCommon.getContextFromRequest(req));

    var firstDate = undefined;

    if(req.params.date) {
        var dateParts = req.params.date.split(";");
        firstDate = new Date(Date.UTC(Number(dateParts[0]), Number(dateParts[1]), Number(dateParts[2])));
    }

    try {
        let weeklySchedule = await scheduleService.getWeeklySchedule(firstDate)
    
        res.json(getHttpResposeJson(weeklySchedule, false));
    } catch (error) {
        req.logService.error("Error getting schedule", error)

        res.status(HttpResponseCodes.internalServerError).json("Error getting schedule");
    }
});

router.get('/export/:startDate/:endDate?', async (req,res,next) => {
    
    let dateParts = req.params.startDate.split(";");
    let startDate = new Date(Date.UTC(Number(dateParts[0]), Number(dateParts[1]), Number(dateParts[2])));

    await createExcelJS(startDate, req,res);

    res.end();
});

async function createExcelJS(startDate, req, res) {
    let workbook = new Excel.Workbook();
    workbook.creator = "Shifty App";
    let workSheet = workbook.addWorksheet('Schedule', {views:[{xSplit: 1, ySplit:1}]});
    workSheet.columns = [];
    let rooms, weeklySchedule;

    let context = RoutesCommon.getContextFromRequest(req);

    try {
        weeklySchedule = await req.scheduleService.getWeeklySchedule(startDate);

        rooms = await req.roomService.getRooms(context);
    }
    catch(error) {
        req.logService.error(error.message, error);
        res.status(500).send().end();
    }
    

    let dates = req.scheduleService.getDatesOfWeek(startDate);

    // Add top left cell value
    let columns = [{header: 'ZedekMC', key: 'rooms', width: 20}]
    let days = [];

    // For every date of the week, add a column with a header
    // made out of the name of the day and the date
    //          Sunday
    //         29/9/2019
    for (let index = 0; index < dates.length; index++) {
        let date = dates[index];
        let day = req.scheduleService.getDayByDate(date);
        days.push(day);
        
        let header = `${day}\n${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

        columns.push({
            header: header,
            key: day,
            width: 25
        });
    }

    workSheet.columns = [...columns];

    let middleCenterAllignment: any = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
    }

    

    // Set the styling for the headers row
    workSheet.lastRow.height = 35;
    workSheet.lastRow.alignment = middleCenterAllignment

    // TODO : Change style for top left cell

    for(let room of rooms) {
        let values = [room.name]

        for(let day of days) {
            let profilesAssignedThisDay = weeklySchedule.days[day].assignments.filter(a=> a.condition.roomId == room.id).map(a => a.profile.name).join('\n');
            values.push(profilesAssignedThisDay);
        }

        // Add a row and set all styles for it
        workSheet.addRow(values)
        workSheet.lastRow.height = 45;
        workSheet.lastRow.alignment = middleCenterAllignment
    }

    let headerFill : any = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FFF26B3A"
        },
        bgColor: {
            argb: "FF000000"
        }
    }

    let headerFont: any = {
        name: 'Arial Black',
        color: { argb: 'FFFFFFFF' },
        family: 2,
        size: 12,
        bold: true
    }

    let columnLetters = ['A','B','C','D','E','F','G','H'];

    // Go over all the columns (A - room names, H - Saturday)
    // and set the styles for the cells

    // NOTE: Style is set per cell so that it wont exceed table size
    for(let letter of columnLetters) {
        // Set styling for roow name cells
        workSheet.getCell(`${letter}1`).fill = headerFill;
        workSheet.getCell(`${letter}1`).font = headerFont;

        for(let index = 0; index < rooms.length; index++) {
            // Set styling for the first column
            if(letter == 'A') {
                workSheet.getCell(`${letter}${index + 2}`).fill = {
                    ...headerFill,
                    fgColor: {argb: "FFF5F5F5"}
                }
                workSheet.getCell(`${letter}${index + 2}`).font = {
                    ...headerFont,
                    color: {argb: "FF000000"}
                }
            }

            // Set the border for every cell
            workSheet.getCell(`${letter}${index + 2}`).border = {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
              }
        }
    }

    let fileName = `Schedule_${startDate.getDate()}_${startDate.getMonth() + 1}_${startDate.getFullYear()}.xlsx`

    res.setHeader('Content-Type', 'text/xlsx');
    res.setHeader('Content-Disposition',`attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
}



export default router;