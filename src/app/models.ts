import { IStateObject } from './services/state.service';

export class Tag {
    id: number;
    name: string;
}

export class Absence {
    id: number;
    profileId: string;
    startDate: Date;
    endDate: Date;
}

export class NonWorkingDay {
    id: number;
    profileId: string;
    day: string;

    constructor(day:string, profileId:string, id?:number) {
        this.day = day;
        this.profileId = profileId;
    }
}

export class Profile implements IStateObject {
    id : string;
    name: string;
    professions: Tag[] = [];
    profilePic:string;
    absences: Absence[] = [];
    nonWorkingDays: NonWorkingDay[] = [];

    // Not mapped
    professionsJoinedText: string;

    isEmpty(): boolean {
        return this.id.indexOf("EMPTY") != -1;
    }
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

    // Not Mapped
    profile?: Profile;
    profession?: Tag;
    room?: Room;
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
    assignmentsByRoom: Map<number/*room.id*/, Assignment[]> = new Map<number, Assignment[]>();
}

export class WeeklySchedule implements IStateObject {
    days: {[day: string] : DailySchedule} = {};
    startDate: Date;
    endDate: Date;
    id: string;
}

export function createEnumList(enumType) {
    let list = Object.keys(enumType);

    return list;
}
