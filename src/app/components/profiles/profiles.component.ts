import {Component, forwardRef, Inject, OnInit} from '@angular/core';
import {ProfilesService} from "../../services/profiles.service";
import { Profile } from 'src/app/models';
import {NavigationService} from "../../services/navigation.service";
import * as Enumerable from 'linq';

@Component({
  selector: 'sh-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  providers: []
})
export class ProfilesComponent implements OnInit {

  profiles: Array<Profile>;
  public profileToEdit: Profile;

  constructor(
      private profilesService: ProfilesService,
      private navigationService: NavigationService
  ) {

  }
  ngOnInit() {

    this.profilesService.load().then(profiles => {
      this.profiles = profiles;
      profiles.forEach(x => {
        //(x as any).professionsHtml = Enumerable.from(x.professions).select(x => x.name).toArray().join(', ');
      //   this.actionColumn.cellInfos.push({
      //     actions : [{
      //       action: (index) => {
      //         this.onEditProfile(this.profilesService.profiles[index]);
      //       },
      //       icon: "pencil"
      //     }]
      //   });
      //   nameColumn.cellInfos.push({ text: x.name });
      //   professionsColumn.cellInfos.push({ text: x.professions.map(p => p.name).join(', ') });
       })
    });

    //this.columns.push(nameColumn, professionsColumn);
  }

  onEditProfile(profile: Profile) {
    this.navigationService.navigateIn(profile.id.toString());
  }

  onDeleteProfiles(profile: Profile) {

  }
}
