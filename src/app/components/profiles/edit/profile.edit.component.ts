import {Component, forwardRef, Inject, Input} from '@angular/core';
import { ProfilesService } from 'src/app/services/profiles.service';
import {ActivatedRoute, Router} from "@angular/router";
import {Profile, Tag} from 'src/app/models';
import {DropdownOption} from "../../dropdown/dropdown.component";
import { TagsService } from 'src/app/services/tags.service';

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
        @Inject(forwardRef(() => TagsService)) private tagsService: TagsService
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
              var profileTagIds = this.newProfile.professions.map(p => p.id);

              this.tags = tags.filter(t => profileTagIds.indexOf(t.id) == -1)
          }
        })
    }

    addProfession() {
        if(!this.selectedOption) { return; }

        var tag = this.tags.find(tag => tag.id.toString() == this.selectedOption.id);

        this.newProfile.professions.push(tag);
    }

    onSaveClicked() {
        this.profilesService.saveProfile(this.newProfile);

        this.init();
    }
}
