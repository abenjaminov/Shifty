import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { Profile, Tag, createEnumList, ConditionType, ConditionImportance, Day, Room, Condition } from 'src/app/models';
import { ProfilesService } from 'src/app/services/profiles.service';
import { TagsService } from 'src/app/services/tags.service';
import { DropdownOption } from '../dropdown/dropdown.component';
import { RoomsService } from 'src/app/services/rooms.service';
import { ConditionService } from 'src/app/services/conditions.service';
import { CompileShallowModuleMetadata } from '@angular/compiler';

@Component({
  selector: 'sh-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
  providers: []
})
export class ConditionsComponent implements OnInit {

  allConditions: Condition[];
  //conditionColumns: ShGridColumn[] = [];
  //: ShGridActionColumn;

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
    public conditionsService: ConditionService
  ) { }

  ngOnInit() {
    //this.initGridColumns();
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
                 this.profilesService.load(), 
                 this.conditionsService.load()]).then(result => {

      this.tags = result[0];
      this.rooms = result[1];
      this.profiles = result[2];
      this.allConditions = result[3];

      this.fixConditionsForDisplay();

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

  addCondition() {
    var condition = new Condition();
    condition.type = ConditionType[this.selectedConditionType.id];
    condition.isLockedForNextDay = this.selectedIsLockedForNextDayIndex == 0;
    condition.professionId = this.selectedTag.id;
    condition.importance = ConditionImportance[this.conditionImportances[this.selectedImportanceIndex]];
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
      this.init();
    });
  }
}
