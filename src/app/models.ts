import { IStateObject } from './services/state.service';

export class Tag {
    id: number;
    name: string;
}

export class Profile implements IStateObject {
    id : string | number;
    name: string;
    professions: Tag[];
    profilePic:string;
}

export enum AssignmentType {
    Room = "Room",
    Rotation = "Rotation"
}

export enum AssignmentImportance {
    Required = "Required",
    NiceToHave = "Nice To Have"
}