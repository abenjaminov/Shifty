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

export class Room {
    id: number;
    name: string;
    conditions: Condition[] = [];
}

export class Condition {
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

export class Condition {
    profession: Tag;
    importance: ConditionImportance
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
    conditions: Condition[] = [];

    // Not mapped
    dateString:string;
    isToday: boolean;

    setDateString() {
        var dateParts = this.date.toDateString().split(' ');
        this.dateString = `${dateParts[1]} ${dateParts[2]}`;
    }
}

export class WeeklySchedule {
    days: {[day:string] : DailySchedule} = {};
    startDate: Date;
    endDate: Date;


}

export function createEnumList(enumType) {
    let list = Object.keys(enumType);

    return list;
}
