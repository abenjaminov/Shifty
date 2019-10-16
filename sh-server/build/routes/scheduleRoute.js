"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const schedule_service_1 = require("../services/schedule.service");
const routeCommon_1 = require("./routeCommon");
const models_1 = require("../models/models");
const evniroment_1 = require("../genetics/evniroment");
const linq_1 = __importDefault(require("linq"));
const helpers_1 = require("../models/helpers");
const Excel = __importStar(require("exceljs"));
//const Excel = undefined;
var express = require('express');
var router = express.Router();
router.get('/run/:date?', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
    var profiles = yield context.select(models_1.Profile, true, true, []);
    var rooms = yield req.roomService.getRooms(context);
    var firstDate = new Date();
    if (req.params.date) {
        var dateParts = req.params.date.split(";");
        firstDate = new Date(Date.UTC(Number(dateParts[0]), Number(dateParts[1]), Number(dateParts[2])));
    }
    else {
        firstDate = new Date();
        let firstDayOfWeek = firstDate.getUTCDate() - firstDate.getUTCDay();
        firstDate = new Date(firstDate.setUTCDate(firstDayOfWeek));
    }
    firstDate.setDate(firstDate.getDate() - 7);
    var scheduleService = req.scheduleService;
    let lastWeeksSchedule = yield scheduleService.getWeeklySchedule(firstDate);
    firstDate.setDate(firstDate.getDate() + 7);
    var prevDayAssignments = Object.assign([], lastWeeksSchedule.days[models_1.Day.Saturday].assignments);
    var dates = scheduleService.getDatesOfWeek(firstDate);
    var assignments = [];
    for (let index = 0; index < dates.length; index++) {
        let day = scheduleService.getDayByDate(dates[index]);
        var permanentConditionsForThisDay = linq_1.default.from(rooms).selectMany(r => r.conditions).where(c => c.type === models_1.ConditionType.Permanent && c.day == day).toArray();
        // Profiles who are locked from the previous day
        let profileIdsNotAllowedForThisDay = prevDayAssignments.filter(a => a.condition.isLockedForNextDay).map(a => a.profileId);
        // Profiles who are licked and that are part of permanent conditions
        profileIdsNotAllowedForThisDay = profileIdsNotAllowedForThisDay.concat(permanentConditionsForThisDay.map(c => c.profileId));
        let absentProfilesForThisDay = linq_1.default.from(profiles).where(p => linq_1.default.from(p.absences).any(abs => scheduleService.isBetween(dates[index], abs.startDate, abs.endDate))
            || linq_1.default.from(p.nonWorkingDays).any(nwd => nwd.day == day)).toArray();
        // Remove all the permanent conditions that are absent in this day
        permanentConditionsForThisDay = linq_1.default.from(permanentConditionsForThisDay).where(c => linq_1.default.from(absentProfilesForThisDay).all(p => p.id != c.profileId)).toArray();
        profileIdsNotAllowedForThisDay = profileIdsNotAllowedForThisDay.concat(absentProfilesForThisDay.map(p => p.id));
        var profilesForThisDay = profiles.filter(p => p.isAssignable && profileIdsNotAllowedForThisDay.findIndex(pid => pid == p.id) == -1);
        let geneticEnv = new evniroment_1.GeneticEnviroment();
        let roomsForDay = req.roomService.getRoomsWithoutPermanentConditions(rooms, permanentConditionsForThisDay);
        prevDayAssignments = [];
        var solutionForThisDay = geneticEnv.run(profilesForThisDay, roomsForDay);
        let roomsDictionary = linq_1.default.from(rooms).toDictionary(r => r.id);
        for (let gene of solutionForThisDay.genes) {
            let assignment = new models_1.Assignment();
            let date = dates[index];
            assignment.date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            assignment.profileId = gene.profile.id;
            let room = roomsDictionary.get(gene.roomId);
            var condition = room.conditions.find((c) => c.importance == gene.importance && c.professionId == gene.profession.id);
            assignment.conditionId = condition.id;
            assignment.condition = condition;
            prevDayAssignments.push(assignment);
            assignments.push(assignment);
        }
        for (let condition of permanentConditionsForThisDay) {
            let assignment = new models_1.Assignment();
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
        yield context.insert(models_1.Assignment, assignments);
        req.cacheService.clearByPrefix('/api/schedule');
        res.json(helpers_1.getHttpResposeJson("Success running scheduler", true));
    }
    catch (err) {
        req.logService.error("Error running schedule calculation", err);
        res.status(routeCommon_1.HttpResponseCodes.internalServerError).json("Error occured running scheduler");
    }
    ;
}));
router.get('/test', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //var solution = GeneticEnviroment.test();
    res.json(helpers_1.getHttpResposeJson(["solution", "For", "The", "Genetics"], false));
}));
// Get schedule from start date
router.get('/:date?', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let scheduleService = new schedule_service_1.ScheduleService(routeCommon_1.RoutesCommon.getContextFromRequest(req));
    var firstDate = undefined;
    if (req.params.date) {
        var dateParts = req.params.date.split(";");
        firstDate = new Date(Date.UTC(Number(dateParts[0]), Number(dateParts[1]), Number(dateParts[2])));
    }
    try {
        let weeklySchedule = yield scheduleService.getWeeklySchedule(firstDate);
        res.json(helpers_1.getHttpResposeJson(weeklySchedule, false));
    }
    catch (error) {
        req.logService.error("Error getting schedule", error);
        res.status(routeCommon_1.HttpResponseCodes.internalServerError).json("Error getting schedule");
    }
}));
router.delete("/:startDate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let dateParts = req.params.startDate.split(";");
    let startDate = new Date(Date.UTC(Number(dateParts[0]), Number(dateParts[1]), Number(dateParts[2])));
    try {
        let weeklySchedule = yield req.scheduleService.getWeeklySchedule(startDate);
        let assignmentIds = linq_1.default.from(Object.keys(models_1.Day).map(d => weeklySchedule.days[d].assignments)).selectMany(a => a).select(a => a.id).toArray();
        yield req.dbContext.deleteSimple(models_1.Assignment, assignmentIds);
        req.cacheService.clearByPrefix('/api/schedule');
        res.json(helpers_1.getHttpResposeJson(true, true));
    }
    catch (error) {
        req.logService.error("Error deleting assignments for week that starts at " + startDate);
        res.status(routeCommon_1.HttpResponseCodes.internalServerError).send().end();
    }
}));
router.get('/export/:startDate/:endDate?', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let dateParts = req.params.startDate.split(";");
    let startDate = new Date(Date.UTC(Number(dateParts[0]), Number(dateParts[1]), Number(dateParts[2])));
    yield createExcelJS(startDate, req, res);
    res.end();
}));
function createExcelJS(startDate, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let workbook = new Excel.Workbook();
        workbook.creator = "Shifty App";
        let workSheet = workbook.addWorksheet('Schedule', { views: [{ xSplit: 1, ySplit: 1 }] });
        workSheet.columns = [];
        let rooms, weeklySchedule;
        let context = routeCommon_1.RoutesCommon.getContextFromRequest(req);
        try {
            weeklySchedule = yield req.scheduleService.getWeeklySchedule(startDate);
            rooms = yield req.roomService.getRooms(context);
        }
        catch (error) {
            req.logService.error(error.message, error);
            res.status(500).send().end();
        }
        let dates = req.scheduleService.getDatesOfWeek(startDate);
        // Add top left cell value
        let columns = [{ header: 'ZedekMC', key: 'rooms', width: 20 }];
        let days = [];
        // For every date of the week, add a column with a header
        // made out of the name of the day and the date
        //          Sunday
        //         29/9/2019
        for (let index = 0; index < dates.length; index++) {
            let date = dates[index];
            let day = req.scheduleService.getDayByDate(date);
            days.push(day);
            let header = `${day}\n${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            columns.push({
                header: header,
                key: day,
                width: 25
            });
        }
        workSheet.columns = [...columns];
        let middleCenterAllignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true
        };
        // Set the styling for the headers row
        workSheet.lastRow.height = 35;
        workSheet.lastRow.alignment = middleCenterAllignment;
        // TODO : Change style for top left cell
        for (let room of rooms) {
            let values = [room.name];
            for (let day of days) {
                let profilesAssignedThisDay = weeklySchedule.days[day].assignments.filter(a => a.condition.roomId == room.id).map(a => a.profile.name).join('\n');
                values.push(profilesAssignedThisDay);
            }
            // Add a row and set all styles for it
            workSheet.addRow(values);
            workSheet.lastRow.height = 45;
            workSheet.lastRow.alignment = middleCenterAllignment;
        }
        let headerFill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "FFF26B3A"
            },
            bgColor: {
                argb: "FF000000"
            }
        };
        let headerFont = {
            name: 'Arial Black',
            color: { argb: 'FFFFFFFF' },
            family: 2,
            size: 12,
            bold: true
        };
        let columnLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        // Go over all the columns (A - room names, H - Saturday)
        // and set the styles for the cells
        // NOTE: Style is set per cell so that it wont exceed table size
        for (let letter of columnLetters) {
            // Set styling for roow name cells
            workSheet.getCell(`${letter}1`).fill = headerFill;
            workSheet.getCell(`${letter}1`).font = headerFont;
            for (let index = 0; index < rooms.length; index++) {
                // Set styling for the first column
                if (letter == 'A') {
                    workSheet.getCell(`${letter}${index + 2}`).fill = Object.assign(Object.assign({}, headerFill), { fgColor: { argb: "FFF5F5F5" } });
                    workSheet.getCell(`${letter}${index + 2}`).font = Object.assign(Object.assign({}, headerFont), { color: { argb: "FF000000" } });
                }
                // Set the border for every cell
                workSheet.getCell(`${letter}${index + 2}`).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        }
        let fileName = `Schedule_${startDate.getDate()}_${startDate.getMonth() + 1}_${startDate.getFullYear()}.xlsx`;
        res.setHeader('Content-Type', 'text/xlsx');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        yield workbook.xlsx.write(res);
    });
}
exports.default = router;
//# sourceMappingURL=scheduleRoute.js.map