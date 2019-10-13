import {Component, forwardRef, Inject, OnInit} from '@angular/core';
import {ProfilesService} from "../../services/profiles.service";
import { Profile } from 'src/app/models';
import {NavigationService} from "../../services/navigation.service";
import * as Enumerable from 'linq';
import {SharedService} from "../../services/shared.service";
import {Subject} from "rxjs";

@Component({
  selector: 'sh-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  providers: []
})
export class ProfilesComponent implements OnInit {

  profiles: Array<Profile>;
  public profileToEdit: Profile;
  searchTerm$: Subject<string>

  constructor(
      private profilesService: ProfilesService,
      private navigationService: NavigationService,
      private sharedService: SharedService
  ) {

  }
  ngOnInit() {

    this.profilesService.load().then(profiles => {
      this.profiles = profiles;
      this.searchTerm$ = this.sharedService.getSearchTerm();

      this.sharedService.search(this.searchTerm$).subscribe(text => this.onSearchChanged(text));
    });
  }

  onSearchChanged(text:string) {
    this.profiles = this.profilesService.profiles.filter(p => p.name.toLowerCase().startsWith(text.toLocaleLowerCase()) || p.professions.filter(pr => pr.name.toLocaleLowerCase().startsWith(text.toLocaleLowerCase())).length > 0)
  }

  onEditProfile(profile: Profile) {
    this.navigationService.navigateIn(profile.id.toString());
  }

  onDeleteProfiles(profile: Profile) {

  }
}
