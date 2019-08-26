import { Assignment, Room } from "../models/models";

export class RoomsService {

    populateRoomsWithConditions(roomAssignments: Assignment[]) {
        var rooms: Room[] = [];
        for(let roomAssignment of roomAssignments) {
            var assignmentData = JSON.parse(roomAssignment.data);
            roomAssignment.importance = assignmentData.importance;
            roomAssignment.room = rooms.find(r => r.id == assignmentData.roomId);
        }
    }
}