import {Component, forwardRef, Inject, Input} from '@angular/core';
import { ProfilesService } from 'src/app/services/profiles.service';
import {ActivatedRoute, Router} from "@angular/router";
import {Profile, Tag} from 'src/app/models';
import {DropdownOption} from "../../dropdown/dropdown.component";
import { TagsService } from 'src/app/services/tags.service';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
    selector: 'sh-profile-edit',
    templateUrl: './profile.edit.component.html',
    styleUrls: ['./profile.edit.component.scss'],
    providers: [ProfilesService, TagsService]
  })
  export class ProfileEditComponent {
    profileToEdit: Profile;
    newProfile : Profile;
    tags: Tag[] = [];
    selectedOption: DropdownOption;

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
              this.newProfile = Object.assign({}, this.profileToEdit);

              var tags = result[1];
              var profileTagIds = this.newProfile.professions ? this.newProfile.professions.map(p => p.id) : [];

              this.tags = tags.filter(t => profileTagIds.indexOf(t.id) == -1)
          }
        })
    }

    addProfession() {
        if(!this.selectedOption) { return; }

        var tag = this.tags.find(tag => tag.id.toString() == this.selectedOption.id);

        if(!this.newProfile.professions) {
            this.newProfile.professions = [];
        }

        this.newProfile.professions.push(tag);
    }

    removeProfession(tag: Tag) {
      if(!tag) { return; }

        var index = this.newProfile.professions.indexOf(tag);

        if(index > -1) {
          this.newProfile.professions.splice(index,1);
        }
    }

    onSaveClicked() {
        this.profilesService.saveProfile(this.newProfile).then(x => {
          this.navigationService.navigateTo("/profiles");
        });
    }

    profileNameChanged($event) {
      this.newProfile.name = $event.target.value;
    }
}
