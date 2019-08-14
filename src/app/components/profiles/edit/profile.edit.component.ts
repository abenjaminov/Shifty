import { Component, Input } from '@angular/core';
import { ProfilesService } from 'src/app/services/profiles.service';
import { Profile } from 'selenium-webdriver/firefox';

@Component({
    selector: 'sh-profile-edit',
    templateUrl: './profile.edit.component.html',
    styleUrls: ['./profile.edit.component.scss'],
    providers: [ProfilesService]
  })
  export class ProfileEditComponent {
    @Input("profile") profileToEdit: Profile;
  }