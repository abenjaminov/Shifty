import {Component, forwardRef, Inject, OnInit} from '@angular/core';
import {ShCellInfo, ShGridColumn} from "../../../shgrid/grid-column/grid-column.component";
import {ProfilesService} from "../../services/profiles.service";
import {ShGridActionColumn} from "../../../shgrid/grid-actions-column/grid-actions-column.component";
import { Profile } from 'src/app/models';

@Component({
  selector: 'sh-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  providers: [ProfilesService]
})
export class ProfilesComponent implements OnInit {

  public actionColumn: ShGridActionColumn;
  private columns: ShGridColumn[] = [];

  public profileToEdit: Profile;

  constructor(
      @Inject(forwardRef(() => ProfilesService)) private profilesService: ProfilesService
  ) {

  }
  ngOnInit() {
    this.actionColumn = { header: { text: "Edit" }, cellInfos: [] };

    var nameColumn: ShGridColumn = new ShGridColumn();
    nameColumn.header = new ShCellInfo();
    nameColumn.header.text = "Name";

    var professionsColumn = new ShGridColumn();
    professionsColumn.header = new ShCellInfo();
    professionsColumn.header.text = "Professions";

    this.profilesService.load().then(profiles => {
      this.profileToEdit = profiles[0];
      profiles.forEach(x => {
        this.actionColumn.cellInfos.push({
          actions : [{
            action: (index) => {
              this.onEditProfile(this.profilesService.profiles[index]);
            },
            icon: "Edit"
          },{
            action: (index) => {
              console.log(index)
            },
            icon: "Delete"
          }]
        });
        nameColumn.cellInfos.push({ text: x.name });
        professionsColumn.cellInfos.push({ text: x.professions.map(p => p.name).join(', ') });
      })
    });

    this.columns.push(nameColumn, professionsColumn);
  }

  onEditProfile(profile: Profile) {
    this.profileToEdit = profile;
  }

  onDeleteProfiles(profile: Profile) {

  }
}
