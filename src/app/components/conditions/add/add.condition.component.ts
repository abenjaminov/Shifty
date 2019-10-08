import {Component, Inject, OnInit} from '@angular/core';
import {DropdownOption} from "../../dropdown/dropdown.component";
import {Condition, ConditionImportance, ConditionType, createEnumList, Day, Profile, Room, Tag} from "../../../models";
import {ProfilesService} from "../../../services/profiles.service";
import {TagsService} from "../../../services/tags.service";
import {RoomsService} from "../../../services/rooms.service";
import {ConditionService} from "../../../services/conditions.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {QuestionDialogData} from "../../question-dialog/question-dialog.component";

@Component({
  selector: 'sh-add.condition',
  templateUrl: './add.condition.component.html',
  styleUrls: ['./add.condition.component.scss']
})
export class AddConditionComponent implements OnInit {

  conditionTypes: DropdownOption[];
  selectedConditionType: DropdownOption;

  absentNextDayOptions: string[] = ["Yes", "No"];
  selectedIsLockedForNextDayIndex: number = 1;

  conditionImportances: string[];
  selectedImportanceIndex:number = 0;

  days: DropdownOption[];
  selectedDay: DropdownOption;

  profiles: Profile[]
  selectedProfile: Profile;

  tags: Tag[];
  selectedTag: Tag;

  rooms: Room[];
  selectedRoom: Room;

  description: string = '';

  constructor(
      private profilesService: ProfilesService,
      private tagsService: TagsService,
      private roomsService: RoomsService,
      public conditionsService: ConditionService,
      public dialogRef: MatDialogRef<AddConditionComponent>,
      @Inject(MAT_DIALOG_DATA) public data: QuestionDialogData
  ) { }

  ngOnInit() {
    this.init();
  }

  init() {
    this.selectedConditionType = this.selectedConditionType || undefined;
    this.selectedDay = this.selectedDay || undefined;
    this.selectedImportanceIndex = 0;
    this.selectedIsLockedForNextDayIndex = 1;
    this.selectedProfile = this.selectedProfile || undefined;
    this.selectedRoom = this.selectedRoom || undefined;
    this.selectedTag = this.selectedTag || undefined;

    Promise.all([this.tagsService.load(),
      this.roomsService.load(),
      this.profilesService.load()]).then(result => {

      this.tags = result[0];
      this.rooms = result[1];
      this.profiles = result[2];

      this.conditionTypes = createEnumList(ConditionType).map((item) => {
        return {
          id: item,
          name: item
        };
      })

      this.conditionImportances = createEnumList(ConditionImportance);
      this.days = createEnumList(Day).map((item) => {
        return {
          id: item,
          name: item
        };
      });
    });
  }

  onClose() {
    this.dialogRef.close(undefined);
  }

  addCondition() {
    var condition = new Condition();
    condition.type = ConditionType[this.selectedConditionType.id];
    condition.isLockedForNextDay = this.selectedIsLockedForNextDayIndex == 0;
    condition.professionId = this.selectedTag.id;
    condition.importance = ConditionImportance[this.conditionImportances[this.selectedImportanceIndex]];
    condition.description = '';
    condition.amount = 1;

    if(this.selectedConditionType.id == ConditionType.Room) {
      condition.roomId = this.selectedRoom.id;
    }
    else if (this.selectedConditionType.id == ConditionType.Permanent) {
      condition.roomId = this.selectedRoom.id;
      condition.profileId = this.selectedProfile.id.toString();
      condition.day = Day[this.selectedDay.id];

    }
    else if(this.selectedConditionType.id == ConditionType.Rotation) {
      condition.description = this.description;
      condition.roomId = new Date().getTime() % 10000;
    }

    this.conditionsService.addCondition(condition).then(x => {
      this.dialogRef.close(condition);
    });
  }

}
