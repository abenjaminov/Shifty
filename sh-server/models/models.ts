export class Profile {
    id! : string;
    name!: string;
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