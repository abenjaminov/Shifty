import {Component, forwardRef, Inject, OnInit} from '@angular/core';
import {createEnumList, DailySchedule, Day, Profile, Room, WeeklySchedule} from "../../models";
import {RoomsService} from "../../services/rooms.service";
import {ScheduleService} from "../../services/schedule.service";
import {NavigationService} from "../../services/navigation.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {AbsentComponent} from "../absent/absent.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [RoomsService, ScheduleService]
})
export class HomeComponent implements OnInit {
  days: string[];
  rooms: Room[];
  weeklySchedule: WeeklySchedule = new WeeklySchedule();
  title: string;

  assignmentsToRoomAndDay: {[key:string] : string} = {};

  constructor(
      @Inject(forwardRef(() => RoomsService)) private roomsService: RoomsService,
      @Inject(forwardRef(() => ScheduleService)) private scheduleService: ScheduleService,
      @Inject(forwardRef(() => NavigationService)) private navigationService: NavigationService,
      @Inject(forwardRef(() => MatBottomSheet)) private _bottomSheet: MatBottomSheet
  ) {
  }

  ngOnInit() {
    Promise.all([this.roomsService.load(), this.scheduleService.load()]).then(result => {
      this.days = createEnumList(Day);
      this.rooms = this.roomsService.rooms;

      this.weeklySchedule = result[1];

      this.title = this.weeklySchedule.days[Day.Sunday].dateString + " - " + this.weeklySchedule.days[Day.Saturday].dateString;
    })
  }

  profileClicked(profile: Profile) {
    this.navigationService.navigateTo('/profiles/' + profile.id.toString());
  }

  onShowAbsent(day: string) {
    let date = this.weeklySchedule.days[day].date;

    this._bottomSheet.open(AbsentComponent, {
      data: {day: day, date: date}
    })
  }
}