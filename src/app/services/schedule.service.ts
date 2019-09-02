import {forwardRef, Inject, Injectable} from '@angular/core';
import {IShService, ServiceState} from "./models";
import {DailySchedule, Day, Profile, Tag, WeeklySchedule} from "../models";
import {StateService} from "./state.service";

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  state: ServiceState;

  constructor(
      @Inject(forwardRef(() => StateService))  private stateService: StateService
  ) { }

  load(date: Date): Promise<WeeklySchedule> {
    this.state = ServiceState.loading;

    let result = this.stateService.fetch<WeeklySchedule>(WeeklySchedule).then((x:WeeklySchedule) => {
      this.state = ServiceState.ready;

      this.fixDailySchedule(x.days[Day.Sunday]);
      this.fixDailySchedule(x.days[Day.Monday]);
      this.fixDailySchedule(x.days[Day.Tuesday]);
      this.fixDailySchedule(x.days[Day.Wednesday]);
      this.fixDailySchedule(x.days[Day.Thursday]);
      this.fixDailySchedule(x.days[Day.Friday]);
      this.fixDailySchedule(x.days[Day.Saturday]);

      return x;
    });

    return result;
  }

  fixDailySchedule(day: DailySchedule) {
    day.date = new Date(day.date);
    let dateParts = day.date.toDateString().split(' ');
    day.dateString = `${dateParts[1]} ${dateParts[2]}`;
  }
}
