import { IStateObject } from './services/state.service';

export class Tag {
    id: number;
    name: string;
}

export class Profile implements IStateObject {
    id : string | number;
    name: string;
    professions: Tag[] = [];
    profilePic:string;
}

export class Room implements IStateObject {
    id: number;
    name: string;
    conditions: Condition[] = [];
}

export class Condition implements IStateObject {
    id:number;
    type: ConditionType;
    amount: number = 1;
    roomId?: number;
    professionId?: number;
    importance?: ConditionImportance;
    day?: Day;
    profileId?: string;
    isLockedForNextDay?: boolean = false;
}

export class Assignment implements IStateObject {
    profession: Tag;
    importance: ConditionImportance
    condition: Condition;
    profile:Profile;
    id: number;
}

export enum ConditionType {
    Room = "Room",
    Rotation = "Rotation",
    Permanent = "Permanent"
}

export enum ConditionImportance {
    Required = "Required",
    NiceToHave = "Nice To Have"
}

export enum Day {
    Sunday = "Sunday",
    Monday = "Monday",
    Tuesday = "Tuesday",
    Wednesday = "Wednesday",
    Thursday = "Thursday",
    Friday = "Friday",
    Saturday = "Saturday"
}

export class DailySchedule {
    day!: Day
    date!: Date;
    assignments: Assignment[] = [];

    // Not mapped
    dateString:string;
    isToday: boolean;


}

export class WeeklySchedule implements IStateObject {
    days: {[day: string] : DailySchedule} = {};
    startDate: Date;
    endDate: Date;
    id: string | number;
}

export function createEnumList(enumType) {
    let list = Object.keys(enumType);

    return list;
}
