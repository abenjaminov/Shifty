import { Assignment, Room, Tag, DailySchedule  } from "../models/models";

import Enumerable from "linq";

export class RoomsService {

    populateRoomsWithConditions(roomAssignments: Assignment[]) {
        let rooms: Room[] = [];
        let tags: Tag[] = [];

        let prevDailySchedule: DailySchedule;
ים
        for(let roomAssignment of roomAssignments) {
            roomAssignment.importance = roomAssignment.importance;
            roomAssignment.room = rooms.find(r => r.id == roomAssignment.roomId);
            roomAssignment.profession = tags.find(t => t.id == roomAssignment.professionId);
        }

        var assignmentsByRoomId = Enumerable.from(roomAssignments).groupBy((ra) => ra.room.id).toDictionary(x => x.key(), y => y);

        rooms.forEach(room => {
            if(assignmentsByRoomId.contains(room.id)) {
                room.assignments = assignmentsByRoomId.get(room.id).toArray();
            }            
        });
    }
}