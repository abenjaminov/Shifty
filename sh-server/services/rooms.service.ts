import { Assignment, Room, Tag, DailySchedule} from "../models/models";

export class RoomsService {

    populateRoomsWithConditions(roomAssignments: Assignment[]) {
        var rooms: Room[] = [];
        var tags: Tag[] = [];

        var prevDailySchedule: DailySchedule;

        for(let roomAssignment of roomAssignments) {
            var assignmentData = JSON.parse(roomAssignment.data);
            roomAssignment.importance = assignmentData.importance;
            roomAssignment.room = rooms.find(r => r.id == assignmentData.roomId);
            roomAssignment.profession = tags.find(t => t.id == assignmentData.professionId);
        }
    }
}