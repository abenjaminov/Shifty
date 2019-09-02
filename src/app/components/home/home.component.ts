import {Component, forwardRef, Inject, OnInit} from '@angular/core';
import {createEnumList, DailySchedule, Day, Profile, Room, WeeklySchedule} from "../../models";
import {RoomsService} from "../../services/rooms.service";
import {ScheduleService} from "../../services/schedule.service";

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

  assignmentsToRoomAndDay: {[key:string] : string} = {};

  constructor(
      @Inject(forwardRef(() => RoomsService)) private roomsService: RoomsService,
      @Inject(forwardRef(() => ScheduleService)) private scheduleService: ScheduleService,
  ) {
  }

  ngOnInit() {
    Promise.all([this.roomsService.load(), this.scheduleService.load()]).then(result => {
      this.days = createEnumList(Day);
      this.rooms = this.roomsService.rooms;

      this.weeklySchedule = result[1];

      this.mapRoomsPerDayAssignment();
    })
  }

  mapRoomsPerDayAssignment() {
      // for(let day of this.days) {
      //   let dailySchedule: DailySchedule = this.weeklySchedule.days[day];
      //
      //   for(let room of this.rooms) {
      //     var assignment = dailySchedule.assignments.find(x => x.condition.roomId == room.id);
      //     if(assignment) {
      //       this.assignmentsToRoomAndDay[room.id + "-" + day] = assignment.profile.name;
      //     }
      //     else {
      //       this.assignmentsToRoomAndDay[room.id + "-" + day] = "--";
      //     }
      //   }
      // }
  }
}