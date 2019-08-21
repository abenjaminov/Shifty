import { Mapped } from "../database/database";


export class Profile {
    @Mapped("Id") id! : string;
    @Mapped("Name") name!: string;
    professions: Tag[] = [];
    profilePic:string = "";
}

export class Tag {
    id!: number;
    name!: string;
}

export class Room {
    id!: number;
    name!: string;
    conditions: any[] = [];
}