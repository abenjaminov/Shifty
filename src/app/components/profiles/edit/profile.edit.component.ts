import {Component, forwardRef, Inject, Input} from '@angular/core';
import { ProfilesService } from 'src/app/services/profiles.service';
import {ActivatedRoute, Router} from "@angular/router";
import {Absence, Profile, Tag} from 'src/app/models';
import {DropdownOption} from "../../dropdown/dropdown.component";
import { TagsService } from 'src/app/services/tags.service';
import { NavigationService } from 'src/app/services/navigation.service';
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import * as Enumerable from 'linq';

@Component({
    selector: 'sh-profile-edit',
    templateUrl: './profile.edit.component.html',
    styleUrls: ['./profile.edit.component.scss'],
    providers: [ProfilesService, TagsService]
  })
  export class ProfileEditComponent {
    profileToEdit: Profile;
    modifiedProfile : Profile;
    tags: Tag[] = [];
    selectedOption: DropdownOption;

    selectedStartDate: Date;
    selectedEndDate: Date;
    nextAbsence: string;

    constructor(
        @Inject(forwardRef(() => ActivatedRoute)) private activatedRoute: ActivatedRoute,
        @Inject(forwardRef(() => ProfilesService)) private profilesService: ProfilesService,
        @Inject(forwardRef(() => TagsService)) private tagsService: TagsService,
        @Inject(forwardRef(() => NavigationService)) private navigationService: NavigationService
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

              this.setNextAbsence();
          }
        })
    }

    setNextAbsence() {
        var today = new Date();
        today.setHours(0,0,0,0);

        var closestAbs = Enumerable.from(this.modifiedProfile.absences).where(ab => ab.startDate >= today).orderBy(ab => today.getTime() - ab.startDate.getTime()).firstOrDefault(undefined);

        if(closestAbs) {
            this.nextAbsence = `${closestAbs.startDate.toDateString()} - ${closestAbs.endDate.toDateString()}`
        }
    }
    
    addProfession() {
        if(!this.selectedOption) { return; }

        var tag = this.tags.find(tag => tag.id.toString() == this.selectedOption.id);

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
        var absence = new Absence();

        absence.startDate = this.selectedStartDate;
        absence.endDate = this.selectedEndDate;
        absence.profileId = this.modifiedProfile.id;

        this.modifiedProfile.absences.push(absence);

        this.setNextAbsence();
    }
}
