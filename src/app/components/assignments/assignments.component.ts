import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { Profile, Tag, createEnumList, AssignmentType, AssignmentImportance, Days, Room } from 'src/app/models';
import { ProfilesService } from 'src/app/services/profiles.service';
import { TagsService } from 'src/app/services/tags.service';
import { DropdownOption } from '../dropdown/dropdown.component';
import { RoomsService } from 'src/app/services/rooms.service';

@Component({
  selector: 'sh-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
  providers: [ProfilesService, TagsService, RoomsService]
})
export class AssignmentsComponent implements OnInit {

  assignmentTypes: DropdownOption[];
  selectedAssignmentType: DropdownOption;

  assignmentImportances: string[];
  selectedImportanceIndex:number = 0;

  days: DropdownOption[];
  selectedDay: DropdownOption;

  profiles: Profile[]
  selectedProfile: Profile[];

  tags: Tag[];
  selectedTag: Tag;

  rooms: Room[];
  selectedRoom: Room;

  constructor(
    @Inject(forwardRef(() => ProfilesService)) private profilesService: ProfilesService,
    @Inject(forwardRef(() => TagsService)) private tagsService: TagsService,
    @Inject(forwardRef(() => RoomsService)) private roomsService: RoomsService,
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

    Promise.all([this.tagsService.load(), this.roomsService.load(), this.profilesService.load()]).then(result => {

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
    if(this.selectedAssignmentType.id == AssignmentType.Room) {
      var importance = this.assignmentImportances[this.selectedImportanceIndex];
      this.selectedRoom.conditions.push({ profession: this.selectedTag, importance: AssignmentImportance[importance] });

      this.roomsService.saveRoom(this.selectedRoom).then(room => {
        this.init();
      });
    }
    else if (this.selectedAssignmentType.id == AssignmentType.Permanent) {

    }
    else if(this.selectedAssignmentType.id == AssignmentType.Rotation) {
      
    }
  }
}
