"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models/models");
const linq_1 = __importDefault(require("linq"));
class RoomsService {
    populateRoomsWithConditions(roomConditions) {
        let rooms = [];
        let tags = [];
        let prevDailySchedule;
        for (let roomCondition of roomConditions) {
            roomCondition.importance = roomCondition.importance;
            roomCondition.room = rooms.find(r => r.id == roomCondition.roomId);
            roomCondition.profession = tags.find(t => t.id == roomCondition.professionId);
        }
        var conditionsByRoomId = linq_1.default.from(roomConditions).groupBy((ra) => ra.room.id).toDictionary(x => x.key(), y => y);
        rooms.forEach(room => {
            if (conditionsByRoomId.contains(room.id)) {
                room.conditions = conditionsByRoomId.get(room.id).toArray();
            }
        });
    }
    getRooms(context) {
        return __awaiter(this, void 0, void 0, function* () {
            var rooms = yield context.select(models_1.Room, true, true, []);
            let rotationConditions = yield context.select(models_1.Condition, false, false, [{ dataFilters: [{ property: 'type', value: models_1.ConditionType.Rotation }] }]);
            let rotationRooms = rotationConditions.map(rc => {
                let room = new models_1.Room();
                room.id = new Date().getTime();
                room.isDynamic = true;
                room.name = rc.description;
                room.conditions = [rc];
                return room;
            });
            rooms.push(...rotationRooms);
            return rooms;
        });
    }
}
exports.RoomsService = RoomsService;
//# sourceMappingURL=rooms.service.js.map