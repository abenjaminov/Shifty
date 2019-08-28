import { Condition, Room, Tag, DailySchedule  } from "../models/models";

import Enumerable from "linq";

export class RoomsService {

    populateRoomsWithConditions(roomConditions: Condition[]) {
        let rooms: Room[] = [];
        let tags: Tag[] = [];

        let prevDailySchedule: DailySchedule;
ים
        for(let roomAssignment of roomConditions) {
            roomAssignment.importance = roomAssignment.importance;
            roomAssignment.room = rooms.find(r => r.id == roomAssignment.roomId);
            roomAssignment.profession = tags.find(t => t.id == roomAssignment.professionId);
        }

        var conditionsByRoomId = Enumerable.from(roomConditions).groupBy((ra) => ra.room.id).toDictionary(x => x.key(), y => y);

        rooms.forEach(room => {
            if(conditionsByRoomId.contains(room.id)) {
                room.conditions = conditionsByRoomId.get(room.id).toArray();
            }            
        });
    }
}