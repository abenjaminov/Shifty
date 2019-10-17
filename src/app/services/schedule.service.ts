import {Injectable} from '@angular/core';
import {ServiceState} from "./models";
import * as Enumerable from 'linq';
import {createEnumList, DailySchedule, Day, WeeklySchedule} from "../models";
import {AppStatus, StateService} from "./state.service";
import {HttpService} from "./http.service";

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  state: ServiceState;
  dayNames: Array<string>;

  constructor(
        private stateService: StateService,
        private httpService: HttpService
  ) {
    this.dayNames = createEnumList(Day);
  }

  async calculateSchedule(date?: Date) {
    this.state = ServiceState.loading;
    let dateParams = undefined;

    if(date) {
      dateParams = [];
      let dateParam = date.getFullYear() + ";" + date.getMonth() + ";" + date.getDate();
      dateParams.push(dateParam);
    }

    let result = await this.httpService.get(undefined, 'api/schedule/run', dateParams);

    this.httpService.clearCache(this.stateService.getCacheName(WeeklySchedule));

    return result;
  }


  async exportWeek(date: Date) {
    let dateParams = [];

    let dateParam = date.getFullYear() + ";" + date.getMonth() + ";" + date.getDate();
    dateParams.push(dateParam);

    this.stateService.addLoading("exportSchedule",`exportSchedule ${JSON.stringify(dateParam)}`);
    await this.httpService.downloadFile('api/schedule/export', dateParams);
    this.stateService.removeLoading("exportSchedule");
  }

  async deleteWeeklyAssignments(startDate:Date) {
    let dateParams = [];

    let dateParam = startDate.getFullYear() + ";" + startDate.getMonth() + ";" + startDate.getDate();
    dateParams.push(dateParam);

    let deleted = await this.stateService.deleteObject(WeeklySchedule, dateParam)
  }

  load(date?: Date): Promise<WeeklySchedule> {
    this.state = ServiceState.loading;
    let dateParams = undefined;

    if(date) {
      dateParams = [];
      let dateParam = date.getFullYear() + ";" + date.getMonth() + ";" + date.getDate();
      dateParams.push(dateParam);
    }

    let result = this.stateService.fetch<WeeklySchedule>(WeeklySchedule,dateParams).then((weeklySchedule:WeeklySchedule) => {
      this.state = ServiceState.ready;

      for(let day of this.dayNames) {
        let dailySchedule = weeklySchedule.days[day];

        this.fixDailySchedule(dailySchedule);

        dailySchedule.isToday = this.isToday(dailySchedule.date);

        let allRooms = Enumerable.from(dailySchedule.assignments).select(a => a.condition.roomId).distinct().toArray();

        for(let roomId of allRooms) {
          let assignmentsForRoom = Enumerable.from(dailySchedule.assignments).where(a => a.condition.roomId == roomId).toArray();
          dailySchedule.assignmentsByRoom.set(roomId, assignmentsForRoom);
        }
      }

      weeklySchedule.startDate = this.toDate(weeklySchedule.startDate as any);
      weeklySchedule.endDate = this.toDate(weeklySchedule.endDate as any);

      return weeklySchedule;
    });

    return result;
  }

  fixDailySchedule(day: DailySchedule) {
    day.date = new Date(day.date);
    let dateParts = day.date.toDateString().split(' ');
    day.dateString = `${dateParts[1]} ${dateParts[2]}`;
  }

  isToday(date: Date) {
    let today = new Date();

    return date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate();
  }

  toDate(value: string) {
    return new Date(value);
  }
}
