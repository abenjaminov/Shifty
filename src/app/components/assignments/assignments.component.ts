import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { Profile, Tag, createEnumList, AssignmentType, AssignmentImportance, Day, Room, Assignment } from 'src/app/models';
import { ProfilesService } from 'src/app/services/profiles.service';
import { TagsService } from 'src/app/services/tags.service';
import { DropdownOption } from '../dropdown/dropdown.component';
import { RoomsService } from 'src/app/services/rooms.service';
import { AssignmentService } from 'src/app/services/assignments.service';
import { ShGridColumn } from 'src/shgrid/grid-column/grid-column.component';
import { ShGridActionColumn } from 'src/shgrid/grid-actions-column/grid-actions-column.component';
import { CompileShallowModuleMetadata } from '@angular/compiler';

@Component({
  selector: 'sh-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
  providers: [ProfilesService, TagsService, RoomsService, AssignmentService]
})
export class AssignmentsComponent implements OnInit {

  allAssignments: Assignment[];
  assignmentColumns: ShGridColumn[] = [];
  actionsColumn: ShGridActionColumn;

  assignmentTypes: DropdownOption[];
  selectedAssignmentType: DropdownOption;

  assignmentImportances: string[];
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
    @Inject(forwardRef(() => AssignmentService)) private assignmentsService: AssignmentService
  ) { }

  ngOnInit() {
    this.initGridColumns();
    this.init();
  }

  initGridColumns() {
    var assignmentTypeColumn: ShGridColumn = { header: { text: "Type" }, cellInfos: [] };
    var roomColumn : ShGridColumn = { header: { text: "Room" }, cellInfos: [] };
    var profileColumn : ShGridColumn = { header: { text: "Profile" }, cellInfos: [] };
    var professionColumn : ShGridColumn = { header: { text: "Profession" }, cellInfos: [] };
    var dayColumn : ShGridColumn = { header: { text: "Day" }, cellInfos: [] };
    var importanceColumn : ShGridColumn = { header: { text: "Importance" }, cellInfos: [] };
    this.actionsColumn = { header: {text: "Actions"}, cellInfos: [] };

    this.assignmentColumns.push(assignmentTypeColumn, roomColumn,profileColumn,professionColumn,dayColumn,importanceColumn);
  }

  init() {
    this.selectedAssignmentType = undefined;
    this.selectedDay = undefined;
    this.selectedImportanceIndex = 0;
    this.selectedProfile = undefined;
    this.selectedRoom = undefined;
    this.selectedTag = undefined;

    Promise.all([this.tagsService.load(), 
                 this.roomsService.load(), 
                 this.profilesService.load(), 
                 this.assignmentsService.load()]).then(result => {

      this.tags = result[0];
      this.rooms = result[1];
      this.profiles = result[2];
      this.allAssignments = result[3];

      this.createGridColumns();

      this.assignmentTypes = createEnumList(AssignmentType).map((item) => {
        return {
          id: item,
          name: item
        };
      })

      this.assignmentImportances = createEnumList(AssignmentImportance);
      this.days = createEnumList(Day).map((item) => {
        return {
          id: item,
          name: item
        };
      });
    });
  }

  createGridColumns() {
    this.assignmentColumns.forEach(ac => {
      ac.cellInfos.length = 0
    });

    var assignmentTypeColumn: ShGridColumn = this.assignmentColumns[0];
    var roomColumn : ShGridColumn = this.assignmentColumns[1];
    var profileColumn : ShGridColumn = this.assignmentColumns[2];
    var professionColumn : ShGridColumn = this.assignmentColumns[3];
    var dayColumn : ShGridColumn = this.assignmentColumns[4];
    var importanceColumn : ShGridColumn = this.assignmentColumns[5];
    this.actionsColumn.cellInfos.length = 0;

    for(let assignment of this.allAssignments) {
      assignmentTypeColumn.cellInfos.push({ text: assignment.type });

      let profile = this.profiles.find(p => p.id == assignment.profileId) || {name: '--'};
      let room = this.rooms.find(r => r.id == assignment.roomId) || {name: '--'};
      let profession = this.tags.find(p => p.id == assignment.professionId) || {name: '--'};
      let importance = assignment.importance || '';
      let day = assignment.day || '';

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
            this.onDeleteAssignment(this.allAssignments[index]);
          },
          icon: "trash"
        }]
      })
    }
  }

  onDeleteAssignment(assignment:Assignment) {
    this.assignmentsService.deleteAssignment(assignment).then(x => {
      this.init();
    })
  }

  addAssignment() {
    var assignment = new Assignment();
    assignment.type = AssignmentType[this.selectedAssignmentType.id];
    assignment.amount = 1;

    if(this.selectedAssignmentType.id == AssignmentType.Room) {
      assignment.roomId = this.selectedRoom.id,
      assignment.professionId = this.selectedTag.id,
      assignment.importance = AssignmentImportance[this.assignmentImportances[this.selectedImportanceIndex]]
    }
    else if (this.selectedAssignmentType.id == AssignmentType.Permanent) {
      assignment.roomId = this.selectedRoom.id;
      assignment.profileId = this.selectedProfile.id.toString();
      assignment.day = Day[this.selectedDay.id];
      assignment.importance = AssignmentImportance[this.assignmentImportances[this.selectedImportanceIndex]]
    }
    else if(this.selectedAssignmentType.id == AssignmentType.Rotation) {
      
    }

    this.assignmentsService.addAssignment(assignment).then(x => {
      this.init();
    });
  }
}
