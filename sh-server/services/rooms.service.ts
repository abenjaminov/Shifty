import { Condition, Room, Tag, DailySchedule  } from "../models/models";

import Enumerable from "linq";

export class RoomsService {

    populateRoomsWithConditions(roomConditions: Condition[]) {
        let rooms: Room[] = [];
        let tags: Tag[] = [];

        let prevDailySchedule: DailySchedule;

        for(let roomCondition of roomConditions) {
            roomCondition.importance = roomCondition.importance;
            roomCondition.room = rooms.find(r => r.id == roomCondition.roomId);
            roomCondition.profession = tags.find(t => t.id == roomCondition.professionId);
        }

        var conditionsByRoomId = Enumerable.from(roomConditions).groupBy((ra) => ra.room.id).toDictionary(x => x.key(), y => y);

        rooms.forEach(room => {
            if(conditionsByRoomId.contains(room.id)) {
                room.conditions = conditionsByRoomId.get(room.id).toArray();
            }            
        });
    }
}
