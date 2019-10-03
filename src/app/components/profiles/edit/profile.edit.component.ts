import {Component, forwardRef, Inject, Input} from '@angular/core';
import { ProfilesService } from 'src/app/services/profiles.service';
import {ActivatedRoute, Router} from "@angular/router";
import {Absence, createEnumList, Day, NonWorkingDay, Profile, Tag} from 'src/app/models';
import {DropdownOption} from "../../dropdown/dropdown.component";
import { TagsService } from 'src/app/services/tags.service';
import { NavigationService } from 'src/app/services/navigation.service';
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import * as Enumerable from 'linq';
import {MatButtonToggleChange} from "@angular/material/button-toggle";

@Component({
    selector: 'sh-profile-edit',
    templateUrl: './profile.edit.component.html',
    styleUrls: ['./profile.edit.component.scss'],
    providers: [ProfilesService, TagsService]
  })
  export class ProfileEditComponent {
    // General Data
    profileToEdit: Profile;
    modifiedProfile : Profile;

    // Professions
    tags: Tag[] = [];
    selectedTag: DropdownOption;

    // Absence
    selectedStartDate: Date;
    selectedEndDate: Date;
    nextAbsence: string;
    today: Date;

    // Working Days
    nonWorkingDays: Array<any>


    constructor(
       private activatedRoute: ActivatedRoute,
       private profilesService: ProfilesService,
       private tagsService: TagsService,
       private navigationService: NavigationService
    ) {

    }

    ngOnInit() {
      this.init();
    }

    init() {
      Promise.all([this.profilesService.load(), this.tagsService.load()]).then(result => {
        var profiles = result[0];

        var profileId = this.activatedRoute.snapshot.params["id"];

        var profileFilter = profiles.filter(p => p.id == profileId);

          if(profileFilter.length > 0) {
              this.profileToEdit = profileFilter[0];
              this.modifiedProfile = Object.assign(new Profile(), this.profileToEdit);

              var tags = result[1];
              var profileTagIds = this.modifiedProfile.professions ? this.modifiedProfile.professions.map(p => p.id) : [];

              this.tags = tags.filter(t => profileTagIds.indexOf(t.id) == -1)

              if(!this.today) {
                  this.today = new Date();
                  this.today.setHours(0,0,0,0);
              }

              this.setNextAbsence();

              this.nonWorkingDays = createEnumList(Day).map(d => {
                  return {
                      isSelected: this.modifiedProfile.nonWorkingDays.find(x => x.day == d) != undefined,
                      day:d
                  }
              });
          }
        })
    }

    setNextAbsence() {
        var closestAbs = Enumerable.from(this.modifiedProfile.absences).where(ab => ab.startDate >= this.today).orderBy(ab => this.today.getTime() - ab.startDate.getTime()).firstOrDefault(undefined);

        if(closestAbs) {
            this.nextAbsence = `${closestAbs.startDate.toDateString()} - ${closestAbs.endDate.toDateString()}`
        }
    }
    
    addProfession() {
        if(!this.selectedTag) { return; }

        var tag = this.tags.find(tag => tag.id.toString() == this.selectedTag.id);

        if(!this.modifiedProfile.professions) {
            this.modifiedProfile.professions = [];
        }

        this.modifiedProfile.professions.push(tag);
    }

    removeProfession(tag: Tag) {
      if(!tag) { return; }

        var index = this.modifiedProfile.professions.indexOf(tag);

        if(index > -1) {
          this.modifiedProfile.professions.splice(index,1);
        }
    }

    onSaveClicked() {

        let nonWorkingDaysValues = Enumerable.from(this.nonWorkingDays).where(nwd => nwd.isSelected).select(nwd => nwd.day).toArray().join('');

        let oldNonWorkingDaysValues = Enumerable.from(this.modifiedProfile.nonWorkingDays).select(nwd => nwd.day).toArray().join('');

        if(nonWorkingDaysValues !== oldNonWorkingDaysValues) {
            this.modifiedProfile.nonWorkingDays = this.nonWorkingDays.filter(nwd => nwd.isSelected).map(nwd => new NonWorkingDay(nwd.day, this.modifiedProfile.id));
        }

        this.profilesService.saveProfile(this.modifiedProfile).then(x => {
          this.navigationService.navigateTo("/profiles");
        });
    }

    profileNameChanged($event) {
      this.modifiedProfile.name = $event.target.value;
    }

    startDateChanged($event: MatDatepickerInputEvent<Date>) {
        this.selectedStartDate = $event.value;
    }

    endDateChanged($event: MatDatepickerInputEvent<Date>) {
        this.selectedEndDate = $event.value;
    }

    submitAbsence() {
        if(!this.selectedStartDate || !this.selectedEndDate) return;
        var absence = new Absence();

        absence.startDate = this.toUtcDate(this.selectedStartDate);
        absence.endDate = this.toUtcDate(this.selectedEndDate);
        absence.profileId = this.modifiedProfile.id;

        this.profilesService.fixAbsence(absence);

        this.modifiedProfile.absences.push(absence);

        this.setNextAbsence();

        this.selectedStartDate = undefined;
        this.selectedEndDate = undefined;
    }

    toUtcDate(date: Date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }

    dateClass = (d: Date) => {
        const date = d.getDate();

        // Highlight the 1st and 20th day of each month.
        return Enumerable.from(this.modifiedProfile.absences).any(abs => d >= abs.startDate && d <= abs.endDate) ? 'abscent-date' : undefined;
    }

    toggleChanged(nonWorkingDay: any, $event: MatButtonToggleChange) {
        nonWorkingDay.isSelected = $event.source.checked;
    }
}
