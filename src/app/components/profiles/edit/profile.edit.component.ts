import {Component, forwardRef, Inject, Input} from '@angular/core';
import { ProfilesService } from 'src/app/services/profiles.service';
import {ActivatedRoute, Router} from "@angular/router";
import {Profile, Tag} from 'src/app/models';

@Component({
    selector: 'sh-profile-edit',
    templateUrl: './profile.edit.component.html',
    styleUrls: ['./profile.edit.component.scss'],
    providers: [ProfilesService]
  })
  export class ProfileEditComponent {
    profileToEdit: Profile;
    tags: Tag[] = [{ id:0, name: "Tag 1" },{ id:1, name: "Tag 2" },{ id:2, name: "Tag 3" }];

    constructor(
        @Inject(forwardRef(() => ActivatedRoute)) private activatedRoute: ActivatedRoute,
        @Inject(forwardRef(() => ProfilesService)) private profilesService: ProfilesService
    ) {

    }

    ngOnInit() {
        this.profilesService.load().then(x => {
            var profileId = this.activatedRoute.snapshot.params["id"];

            var profileFilter = x.filter(x => x.id == profileId);

            if(profileFilter.length > 0) {
                this.profileToEdit = profileFilter[0];
            }
        })
    }
  }