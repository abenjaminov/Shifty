import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { Profile, Tag, createEnumList, ConditionType, ConditionImportance, Day, Room, Condition } from 'src/app/models';
import { ProfilesService } from 'src/app/services/profiles.service';
import { TagsService } from 'src/app/services/tags.service';
import { DropdownOption } from '../dropdown/dropdown.component';
import { RoomsService } from 'src/app/services/rooms.service';
import { ConditionService } from 'src/app/services/conditions.service';
import { ShGridColumn } from 'src/shgrid/grid-column/grid-column.component';
import { ShGridActionColumn } from 'src/shgrid/grid-actions-column/grid-actions-column.component';
import { CompileShallowModuleMetadata } from '@angular/compiler';

@Component({
  selector: 'sh-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
  providers: [ProfilesService, TagsService, RoomsService, ConditionService]
})
export class ConditionsComponent implements OnInit {

  allConditions: Condition[];
  conditionColumns: ShGridColumn[] = [];
  actionsColumn: ShGridActionColumn;

  conditionTypes: DropdownOption[];
  selectedConditionType: DropdownOption;

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

  constructor(
    @Inject(forwardRef(() => ProfilesService)) private profilesService: ProfilesService,
    @Inject(forwardRef(() => TagsService)) private tagsService: TagsService,
    @Inject(forwardRef(() => RoomsService)) private roomsService: RoomsService,
    @Inject(forwardRef(() => ConditionService)) private conditionsService: ConditionService
  ) { }

  ngOnInit() {
    this.initGridColumns();
    this.init();
  }

  initGridColumns() {
    var conditionTypeColumn: ShGridColumn = { header: { text: "Type" }, cellInfos: [] };
    var roomColumn : ShGridColumn = { header: { text: "Room" }, cellInfos: [] };
    var profileColumn : ShGridColumn = { header: { text: "Profile" }, cellInfos: [] };
    var professionColumn : ShGridColumn = { header: { text: "Profession" }, cellInfos: [] };
    var dayColumn : ShGridColumn = { header: { text: "Day" }, cellInfos: [] };
    var importanceColumn : ShGridColumn = { header: { text: "Importance" }, cellInfos: [] };
    this.actionsColumn = { header: {text: "Actions"}, cellInfos: [] };

    this.conditionColumns.push(conditionTypeColumn, roomColumn,profileColumn,professionColumn,dayColumn,importanceColumn);
  }

  init() {
    this.selectedConditionType = undefined;
    this.selectedDay = undefined;
    this.selectedImportanceIndex = 0;
    this.selectedProfile = undefined;
    this.selectedRoom = undefined;
    this.selectedTag = undefined;

    Promise.all([this.tagsService.load(), 
                 this.roomsService.load(), 
                 this.profilesService.load(), 
                 this.conditionsService.load()]).then(result => {

      this.tags = result[0];
      this.rooms = result[1];
      this.profiles = result[2];
      this.allConditions = result[3];

      this.createGridColumns();

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

  createGridColumns() {
    this.conditionColumns.forEach(ac => {
      ac.cellInfos.length = 0
    });

    var conditionTypeColumn: ShGridColumn = this.conditionColumns[0];
    var roomColumn : ShGridColumn = this.conditionColumns[1];
    var profileColumn : ShGridColumn = this.conditionColumns[2];
    var professionColumn : ShGridColumn = this.conditionColumns[3];
    var dayColumn : ShGridColumn = this.conditionColumns[4];
    var importanceColumn : ShGridColumn = this.conditionColumns[5];
    this.actionsColumn.cellInfos.length = 0;

    for(let condition of this.allConditions) {
      conditionTypeColumn.cellInfos.push({ text: condition.type });

      let profile = this.profiles.find(p => p.id == condition.profileId) || {name: '--'};
      let room = this.rooms.find(r => r.id == condition.roomId) || {name: '--'};
      let profession = this.tags.find(p => p.id == condition.professionId) || {name: '--'};
      let importance = condition.importance || '';
      let day = condition.day || '';

      if(room) {
        roomColumn.cellInfos.push({ text: room.name });
      } else {
        roomColumn.cellInfos.push({ text: "--" });
      }

      if(profile) {
        profileColumn.cellInfos.push({ text: profile.name });
      } else {
        profileColumn.cellInfos.push({ text: "--" });
      }

      if(profession) {
        professionColumn.cellInfos.push({ text: profession.name });
      }
      else {
        professionColumn.cellInfos.push({ text: "--" });
      }

      if(day) {
        dayColumn.cellInfos.push({ text: day });
      }
      else {
        dayColumn.cellInfos.push({ text: "--" });
      }

      if(importance) {
        importanceColumn.cellInfos.push({ text: importance });
      }
      else {
        importanceColumn.cellInfos.push({ text: "--" });
      }

      this.actionsColumn.cellInfos.push({
        actions: [{
          action: (index) => {
            this.onDeleteCondition(this.allConditions[index]);
          },
          icon: "trash"
        }]
      })
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
    condition.amount = 1;

    if(this.selectedConditionType.id == ConditionType.Room) {
      condition.roomId = this.selectedRoom.id,
      condition.professionId = this.selectedTag.id,
      condition.importance = ConditionImportance[this.conditionImportances[this.selectedImportanceIndex]]
    }
    else if (this.selectedConditionType.id == ConditionType.Permanent) {
      condition.roomId = this.selectedRoom.id;
      condition.profileId = this.selectedProfile.id.toString();
      condition.day = Day[this.selectedDay.id];
      condition.importance = ConditionImportance[this.conditionImportances[this.selectedImportanceIndex]]
    }
    else if(this.selectedConditionType.id == ConditionType.Rotation) {
      
    }

    this.conditionsService.addCondition(condition).then(x => {
      this.init();
    });
  }
}
