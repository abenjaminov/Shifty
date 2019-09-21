import {Component, forwardRef, Inject, OnInit} from '@angular/core';
import {ProfilesService} from "../../services/profiles.service";
import { Profile } from 'src/app/models';
import {NavigationService} from "../../services/navigation.service";

@Component({
  selector: 'sh-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  providers: []
})
export class ProfilesComponent implements OnInit {

  //public actionColumn: ShGridActionColumn;
  //private columns: ShGridColumn[] = [];

  public profileToEdit: Profile;

  constructor(
      private profilesService: ProfilesService,
      private navigationService: NavigationService
  ) {

  }
  ngOnInit() {
    //this.actionColumn = { header: { text: "Edit" }, cellInfos: [] };

    // var nameColumn: ShGridColumn = new ShGridColumn();
    // nameColumn.header = new ShCellInfo();
    // nameColumn.header.text = "Name";
    //
    // var professionsColumn = new ShGridColumn();
    // professionsColumn.header = new ShCellInfo();
    // professionsColumn.header.text = "Professions";

    this.profilesService.load().then(profiles => {
      // this.profileToEdit = profiles[0];
      // profiles.forEach(x => {
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
      // })
    });

    //this.columns.push(nameColumn, professionsColumn);
  }

  onEditProfile(profile: Profile) {
    this.navigationService.navigateIn(profile.id.toString());
  }

  onDeleteProfiles(profile: Profile) {

  }
}
