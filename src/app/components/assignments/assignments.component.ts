import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { Profile, Tag, createEnumList, AssignmentType, AssignmentImportance, Days, Room, Assignment } from 'src/app/models';
import { ProfilesService } from 'src/app/services/profiles.service';
import { TagsService } from 'src/app/services/tags.service';
import { DropdownOption } from '../dropdown/dropdown.component';
import { RoomsService } from 'src/app/services/rooms.service';
import { AssignmentService } from 'src/app/services/assignments.service';

@Component({
  selector: 'sh-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
  providers: [ProfilesService, TagsService, RoomsService, AssignmentService]
})
export class AssignmentsComponent implements OnInit {

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
    this.init()
  }

  init() {
    this.selectedAssignmentType = undefined;
    this.selectedDay = undefined;
    this.selectedImportanceIndex = 0;
    this.selectedProfile = undefined;
    this.selectedRoom = undefined;
    this.selectedTag = undefined;

    Promise.all([this.tagsService.load(), this.roomsService.load(), this.profilesService.load(), this.assignmentsService.load()]).then(result => {

      this.tags = result[0];
      this.rooms = result[1];
      this.profiles = result[2];

      this.assignmentTypes = createEnumList(AssignmentType).map((item) => {
        return {
          id: item,
          name: item
        };
      })

      this.assignmentImportances = createEnumList(AssignmentImportance);
      this.days = createEnumList(Days).map((item) => {
        return {
          id: item,
          name: item
        };
      });
    });
  }

  addAssignment() {
    var assignment = new Assignment();
    assignment.type = AssignmentType[this.selectedAssignmentType.id];

    if(this.selectedAssignmentType.id == AssignmentType.Room) {
      let data = {
        roomId: this.selectedRoom.id,
        professionId: this.selectedTag.id,
        importance: AssignmentImportance[this.assignmentImportances[this.selectedImportanceIndex]]
      }
      assignment.data = JSON.stringify(data);

      
    }
    else if (this.selectedAssignmentType.id == AssignmentType.Permanent) {
      let data = {
        roomId: this.selectedRoom.id,
        profileId: this.selectedProfile.id,
        day: this.selectedDay.id,
        importance: AssignmentImportance[this.assignmentImportances[this.selectedImportanceIndex]]
      }
      assignment.data = JSON.stringify(data);
    }
    else if(this.selectedAssignmentType.id == AssignmentType.Rotation) {
      
    }

    this.assignmentsService.addAssignment(assignment);
  }
}
