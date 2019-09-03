import {forwardRef, Inject, Injectable} from '@angular/core';
import {ServiceState} from "./models";
import * as Enumerable from 'linq';
import {createEnumList, DailySchedule, Day, Profile, Tag, WeeklySchedule} from "../models";
import {StateService} from "./state.service";

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  state: ServiceState;
  dayNames: Array<string>;

  constructor(
      @Inject(forwardRef(() => StateService))  private stateService: StateService
  ) {
    this.dayNames = createEnumList(Day);
  }

  load(date?: Date): Promise<WeeklySchedule> {
    this.state = ServiceState.loading;

    let result = this.stateService.fetch<WeeklySchedule>(WeeklySchedule).then((weeklySchedule:WeeklySchedule) => {
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
