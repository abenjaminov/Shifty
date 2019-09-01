import Enumerable from 'linq';
import { IFilterStatement, DbContext } from "../database/database";
import { Assignment, WeeklySchedule, Profile, DailySchedule, Day, Condition } from "../models/models";

export class ScheduleService {

    constructor(private context: DbContext) {

    }

    async getWeeklySchedule(startDate? :Date) {
        var datesOfWeek = this.getDatesOfWeek(startDate);

        var filterStatements: IFilterStatement[] = datesOfWeek.map((d) => {return{ dataFilters: [{ property: "date", value: d }]}});

        let assignments = await this.context.select<Assignment>(Assignment, false,false, filterStatements);

        var profileIds = assignments.map(a => a.profileId);
        var profileFilter = profileIds.map(pid => {return{ dataFilters: [{ property: "id", value: pid}]}});

        let profiles = await this.context.select<Profile>(Profile, true, false, profileFilter)
        let conditions = await this.context.select<Condition>(Condition);

        for(let assignment of assignments) {
            assignment.profile = profiles.find(p => p.id == assignment.profileId);
            assignment.condition = conditions.find(c => c.id == assignment.conditionId);
        }

        var assignmentsByDay = Enumerable.from(assignments).groupBy(a => a.date.toDateString()).toDictionary(a => a.key(), a => a.toArray());

        var weeklySchedule = new WeeklySchedule();
        var dailySchedules: DailySchedule[] = [];

        for(let date of datesOfWeek) {
            var day = this.getDayByDate(date);
            let dailySchedule = new DailySchedule();

            dailySchedule.assignments = assignmentsByDay.get(date.toDateString()) || [];
            dailySchedule.day = day;
            dailySchedule.date = date;

            dailySchedules.push(dailySchedule);
            weeklySchedule.days[day] = dailySchedule;
        }

        weeklySchedule.startDate = datesOfWeek[0];
        weeklySchedule.endDate = datesOfWeek[6];

        return weeklySchedule;
    }

    getDayByDate(date: Date): Day {
        switch(date.getDay()) {
            case 0: return Day.Sunday;
            case 1: return Day.Monday;
            case 2: return Day.Tuesday;
            case 3: return Day.Wednesday;
            case 4: return Day.Thursday;
            case 5: return Day.Friday;
            case 6: return Day.Saturday;
        }
    }

    getDatesOfWeek(startDate? :Date): Date[] {
        let datesOfWeek: Date[] = []

        if(!startDate) {
            var date = new Date();
            date = new Date(date.toUTCString());
            startDate = new Date(date);
        }
        
        let firstDayOfWeek = startDate.getUTCDate() - startDate.getUTCDay();
        datesOfWeek.push(new Date(startDate.setUTCDate(firstDayOfWeek)));

        var firstDateOfWeek = datesOfWeek[0];

        for (let index = 1; index < 7; index++) {
            var newDate = new Date(firstDateOfWeek.getUTCFullYear(), firstDateOfWeek.getUTCMonth(), firstDateOfWeek.getUTCDate() + index);
            datesOfWeek.push(new Date(newDate));
        }

        return datesOfWeek;
    }
}