"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const linq_1 = __importDefault(require("linq"));
const models_1 = require("../models/models");
class ScheduleService {
    constructor(context) {
        this.context = context;
    }
    getWeeklySchedule(startDate) {
        return __awaiter(this, void 0, void 0, function* () {
            var datesOfWeek = this.getDatesOfWeek(startDate);
            var filterStatements = datesOfWeek.map((d) => { return { dataFilters: [{ property: "date", value: d }] }; });
            let assignments = yield this.context.select(models_1.Assignment, false, false, filterStatements);
            var profileIds = assignments.map(a => a.profileId);
            var profileFilter = profileIds.map(pid => { return { dataFilters: [{ property: "id", value: pid }] }; });
            let profiles = yield this.context.select(models_1.Profile, true, false, profileFilter);
            let conditions = yield this.context.select(models_1.Condition);
            for (let assignment of assignments) {
                assignment.profile = profiles.find(p => p.id == assignment.profileId);
                assignment.condition = conditions.find(c => c.id == assignment.conditionId);
                assignment.date = new Date(Date.UTC(assignment.date.getFullYear(), assignment.date.getMonth(), assignment.date.getDate()));
            }
            var assignmentsByDay = linq_1.default.from(assignments).groupBy(a => a.date.toISOString()).toDictionary(a => a.key(), a => a.toArray());
            var weeklySchedule = new models_1.WeeklySchedule();
            weeklySchedule.numberOfAssignments = assignments.length;
            var dailySchedules = [];
            for (let date of datesOfWeek) {
                var day = this.getDayByDate(date);
                let dailySchedule = new models_1.DailySchedule();
                dailySchedule.assignments = assignmentsByDay.get(date.toISOString()) || [];
                dailySchedule.day = day;
                dailySchedule.date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                dailySchedules.push(dailySchedule);
                weeklySchedule.days[day] = dailySchedule;
            }
            weeklySchedule.startDate = datesOfWeek[0];
            weeklySchedule.endDate = datesOfWeek[6];
            weeklySchedule.id = weeklySchedule.startDate.toISOString() + "-" + weeklySchedule.endDate.toISOString();
            return weeklySchedule;
        });
    }
    getDayByDate(date) {
        switch (date.getDay()) {
            case 0: return models_1.Day.Sunday;
            case 1: return models_1.Day.Monday;
            case 2: return models_1.Day.Tuesday;
            case 3: return models_1.Day.Wednesday;
            case 4: return models_1.Day.Thursday;
            case 5: return models_1.Day.Friday;
            case 6: return models_1.Day.Saturday;
        }
    }
    getDatesOfWeek(startDate) {
        let datesOfWeek = [];
        let firstDayOfWeek;
        if (!startDate) {
            var date = new Date();
            date = new Date(date.toISOString());
            startDate = new Date(date);
            firstDayOfWeek = startDate.getUTCDate() - startDate.getUTCDay();
        }
        else {
            firstDayOfWeek = startDate.getDate();
        }
        datesOfWeek.push(new Date(startDate.setDate(firstDayOfWeek)));
        var firstDateOfWeek = datesOfWeek[0];
        for (let index = 1; index < 7; index++) {
            var newDate = new Date(firstDateOfWeek.getFullYear(), firstDateOfWeek.getMonth(), firstDateOfWeek.getDate() + index);
            datesOfWeek.push(new Date(newDate));
        }
        return datesOfWeek.map(date => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
    }
    isSameDay(date, date2) {
        if (!date2) {
            date2 = new Date();
        }
        return date.getFullYear() == date2.getFullYear() && date.getMonth() == date2.getMonth() && date.getDate() == date2.getDate();
    }
    isBetween(date, startDate, endDate) {
        let result = date >= startDate && date <= endDate;
        return result;
    }
}
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule.service.js.map