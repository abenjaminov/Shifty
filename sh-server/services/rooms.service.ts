import { Condition, Room, Tag, DailySchedule, ConditionType  } from "../models/models";

import Enumerable from "linq";
import { DbContext } from "../database/database";

export class RoomsService {

    getRoomsWithoutPermanentConditions(rooms: Array<Room>, permanentConditionsForThisDay: Array<Condition>) {
        let roomsInternal: Array<Room> = Object.assign([], rooms.map(r => Object.assign({}, r)));

        for(let room of roomsInternal) {
            room.conditions = room.conditions.filter(c => c.type != ConditionType.Permanent);
        }

        for(let permanentCondition of permanentConditionsForThisDay) {
            let room = roomsInternal.find(r => r.id == permanentCondition.roomId);
    
            if(!room) {
                throw "Room not found id : " + permanentCondition.roomId;
            }
            else {
                let conditionWithSameProfession = room.conditions.find(c => c.professionId == permanentCondition.professionId);
    
                if(conditionWithSameProfession) {
                    room.conditions = room.conditions.filter(x => x.id != conditionWithSameProfession.id)
                }
            }
        }
    
        return roomsInternal;
    }

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

    async getRooms(context: DbContext): Promise<Array<Room>> {
        var rooms = await context.select<Room>(Room, true,true, []);

        let rotationConditions: Array<Condition> = await context.select(Condition,true,false, 
            [{ dataFilters: [{property: 'type', value: ConditionType.Rotation}, {property: 'isDeleted', value: false}]}]) ;

        let rotationRooms = rotationConditions.map(rc => {
            let room = new Room();
            room.id = rc.roomId;
            room.isDynamic = true;
            room.name = rc.description;
            room.conditions = [rc];

            return room;
        })

        rooms.push(...rotationRooms);

        return rooms;
    }
}
