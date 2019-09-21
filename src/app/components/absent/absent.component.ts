import {Component, forwardRef, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from "@angular/material/bottom-sheet";
import {ProfilesService} from "../../services/profiles.service";
import * as Enumerable from 'linq';

@Component({
  selector: 'sh-absent',
  templateUrl: './absent.component.html',
  styleUrls: ['./absent.component.scss'],
  providers: [ProfilesService]
})
export class AbsentComponent implements OnInit {

  title: string;
  absentProfiles = []
  date: Date;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
              @Inject(forwardRef(() => ProfilesService)) private profilesService: ProfilesService) {

  }

  ngOnInit() {
    if(this.data) {
      this.date = this.data.date;
      this.title = "Absent profiles for " + this.date.toDateString();
      this.profilesService.load().then(profiles => {
        let absentProfiles = Enumerable.from(this.profilesService.profiles).
              where(p => Enumerable.from(p.absences).any(abs => this.isBetween(this.date, abs.startDate, abs.endDate))).toArray();

        let nonWorkingProfiles = Enumerable.from(this.profilesService.profiles).where(x => absentProfiles.find(p => p.id == x.id) == undefined).
                                                                                where(p => Enumerable.from(p.nonWorkingDays).any(nwd => nwd.day == this.data.day)).toArray();

        let absentMapping = absentProfiles.map((x) => {
          let absence = x.absences.find(abs => this.isBetween(this.date, abs.startDate, abs.endDate));

          return {
            name: x.name,
            text: `is absent from ${absence.startDate.toDateString()} <b>to</b> ${absence.endDate.toDateString()}`
          }
        })

        let nonWorkingMapping = nonWorkingProfiles.map((x) => {
          return {
            name: x.name,
            text: `is not working on ${this.data.day}s`
          }
        })

        this.absentProfiles = absentMapping.concat(nonWorkingMapping);
      })
    }
  }

  isBetween(date: Date, startDate: Date, endDate: Date) {
    let result = date >= startDate && date <= endDate;

    return result;
  }
}
