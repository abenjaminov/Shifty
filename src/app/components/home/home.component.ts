import {Component, forwardRef, Inject, OnInit} from '@angular/core';
import {createEnumList, DailySchedule, Day, Room, WeeklySchedule} from "../../models";
import {RoomsService} from "../../services/rooms.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [RoomsService]
})
export class HomeComponent implements OnInit {
  days: string[];
  rooms: Room[];
  weeklySchedule: WeeklySchedule = new WeeklySchedule();

  constructor(
      @Inject(forwardRef(() => RoomsService)) private roomsService: RoomsService,
  ) {
    this.weeklySchedule.startDate = new Date("08/25/2019");
    this.weeklySchedule.endDate = new Date("08/31/2019");
    this.weeklySchedule.days[Day.Sunday] = new DailySchedule();

    this.weeklySchedule.days[Day.Sunday].date = new Date("08/25/2019");
    this.weeklySchedule.days[Day.Sunday].day = Day.Sunday;
    this.weeklySchedule.days[Day.Sunday].setDateString();

    this.weeklySchedule.days[Day.Monday] = new DailySchedule();

    this.weeklySchedule.days[Day.Monday].date = new Date("08/26/2019");
    this.weeklySchedule.days[Day.Monday].day = Day.Monday;
    this.weeklySchedule.days[Day.Monday].setDateString();

    this.weeklySchedule.days[Day.Tuesday] = new DailySchedule();

    this.weeklySchedule.days[Day.Tuesday].date = new Date("08/27/2019");
    this.weeklySchedule.days[Day.Tuesday].day = Day.Tuesday;
    this.weeklySchedule.days[Day.Tuesday].isToday = true;
    this.weeklySchedule.days[Day.Tuesday].setDateString();

    this.weeklySchedule.days[Day.Wednesday] = new DailySchedule();

    this.weeklySchedule.days[Day.Wednesday].date = new Date("08/28/2019");
    this.weeklySchedule.days[Day.Wednesday].day = Day.Wednesday;
    this.weeklySchedule.days[Day.Wednesday].setDateString();

    this.weeklySchedule.days[Day.Thursday] = new DailySchedule();

    this.weeklySchedule.days[Day.Thursday].date = new Date("08/29/2019");
    this.weeklySchedule.days[Day.Thursday].day = Day.Thursday;
    this.weeklySchedule.days[Day.Thursday].setDateString();

    this.weeklySchedule.days[Day.Friday] = new DailySchedule();

    this.weeklySchedule.days[Day.Friday].date = new Date("08/30/2019");
    this.weeklySchedule.days[Day.Friday].day = Day.Friday;
    this.weeklySchedule.days[Day.Friday].setDateString();

    this.weeklySchedule.days[Day.Saturday] = new DailySchedule();

    this.weeklySchedule.days[Day.Saturday].date = new Date("08/31/2019");
    this.weeklySchedule.days[Day.Saturday].day = Day.Saturday;
    this.weeklySchedule.days[Day.Saturday].setDateString();
  }

  ngOnInit() {
    this.roomsService.load().then(rooms => {
      this.days = createEnumList(Day);
      this.rooms = this.roomsService.rooms;
    });
  }
}