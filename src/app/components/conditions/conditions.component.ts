import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { Profile, Tag, createEnumList, ConditionType, ConditionImportance, Day, Room, Condition } from 'src/app/models';
import { ProfilesService } from 'src/app/services/profiles.service';
import { TagsService } from 'src/app/services/tags.service';
import { DropdownOption } from '../dropdown/dropdown.component';
import { RoomsService } from 'src/app/services/rooms.service';
import { ConditionService } from 'src/app/services/conditions.service';
import { CompileShallowModuleMetadata } from '@angular/compiler';
import {MatDialog} from "@angular/material/dialog";
import {QuestionDialogComponent} from "../question-dialog/question-dialog.component";
import {AddConditionComponent} from "./add/add.condition.component";

@Component({
  selector: 'sh-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
  providers: []
})
export class ConditionsComponent implements OnInit {

  rooms: Room[];
  profiles: Profile[];
  tags: Tag[];
  allConditions: Condition[];
  permanentConditions: Condition[];
  roomConditions: Condition[];

  permanentOpen: boolean;

  constructor(
    private profilesService: ProfilesService,
    private tagsService: TagsService,
    private roomsService: RoomsService,
    public conditionsService: ConditionService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    //this.initGridColumns();
    this.init();
  }

  init() {
    Promise.all([this.tagsService.load(),
                 this.roomsService.load(),
                 this.profilesService.load(),
                 this.conditionsService.load()]).then(result => {

      this.tags = result[0];
      this.rooms = result[1];
      this.profiles = result[2];
      this.allConditions = result[3];

      this.permanentConditions = this.conditionsService.permanentConditions;
      this.roomConditions = this.conditionsService.roomConditions;

      this.fixConditionsForDisplay();
    });
  }

  fixConditionsForDisplay() {
    for(let condition of this.allConditions) {

      condition.profile = this.profiles.find(p => p.id == condition.profileId);
      condition.room = this.rooms.find(r => r.id == condition.roomId);
      condition.profession = this.tags.find(p => p.id == condition.professionId);
    }
  }

  onDeleteCondition(condition:Condition) {
    this.conditionsService.deleteCondition(condition).then(x => {
      this.init();
    })
  }

  onAddCondition() {
    const dialogRef = this.dialog.open(AddConditionComponent);

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
          this.init();
      }
    });
  }

  togglePermanent() {
    this.permanentOpen = !this.permanentOpen;
  }
}
