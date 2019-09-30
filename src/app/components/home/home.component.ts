import {Component, forwardRef, Inject, OnInit} from '@angular/core';
import {createEnumList, DailySchedule, Day, Profile, Room, WeeklySchedule} from "../../models";
import {RoomsService} from "../../services/rooms.service";
import {ScheduleService} from "../../services/schedule.service";
import {NavigationService} from "../../services/navigation.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {AbsentComponent} from "../absent/absent.component";
import {MatDialog} from "@angular/material/dialog";
import {QuestionDialogComponent} from "../question-dialog/question-dialog.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: []
})
export class HomeComponent implements OnInit {
  days: string[];
  rooms: Room[];
  weeklySchedule: WeeklySchedule = new WeeklySchedule();
  title: string;
  weekStartDate:Date = undefined;

  assignmentsToRoomAndDay: {[key:string] : string} = {};

  constructor(
      private roomsService: RoomsService,
      private scheduleService: ScheduleService,
      private navigationService: NavigationService,
      private _bottomSheet: MatBottomSheet,
      public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.init();
  }

  init() {
    Promise.all([this.roomsService.load(), this.scheduleService.load(this.weekStartDate)]).then(result => {
      this.days = createEnumList(Day);
      this.rooms = this.roomsService.rooms;

      this.weeklySchedule = result[1];

      this.title = this.weeklySchedule.days[Day.Sunday].dateString + " - " + this.weeklySchedule.days[Day.Saturday].dateString;

      if(this.weeklySchedule.numberOfAssignments == 0) {
        this.askRunSchedule();
      }
    })
  }

  askRunSchedule(): void {
    const dialogRef = this.dialog.open(QuestionDialogComponent, {
      width: '250px',
      data: {title: 'Calculate Assignments', question : 'Would you like to calculate assignments for this week?', answer: false}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.scheduleService.calculateSchedule(this.weeklySchedule.days[Day.Sunday].date).then(x => {
          this.init();
        })
      }
    });
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

  onNextWeekClicked() {
    let firstDateOfWeek = this.weeklySchedule.days[Day.Saturday].date;
    let firstDateOfNextWeek = new Date(firstDateOfWeek.getTime());
    firstDateOfNextWeek.setDate(firstDateOfNextWeek.getDate() + 1);

    this.weekStartDate = firstDateOfNextWeek;

    this.init();
  }

  onPrevWeekClicked() {
    let firstDateOfWeek = this.weeklySchedule.days[Day.Sunday].date;
    let firstDateOfLastWeek = new Date(firstDateOfWeek.getTime());
    firstDateOfLastWeek.setDate(firstDateOfLastWeek.getDate() - 7);

    this.weekStartDate = firstDateOfLastWeek;

    this.init();
  }
}
