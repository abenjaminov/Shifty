import { Table, Mapped, MappingType } from "./reflection";

var profileProfessionsMapping = {
    property: "professions",
    sourceType: "Tag",
    db : {
        sourceTable: "Professions",
        sourceProp:"id", 
        sourceAlias: "prof",
        sourceAdditionalData: ["name"],

        connTable: "ProfilesProfessions", 
        connAlias: "PP",
        connToSourceProp: "ProfessionId",

        connToMainProp: "ProfileId",
    },
    toItemsMap: (primaryKeyValues: string[], results: any[]) => {
        var map: Map<string, Tag[]> = new Map<string, Tag[]>();

        for(let id of primaryKeyValues) {
            var professions = results.filter(x => x.id == id && x["prof_id"] != null);
            var tags = [];
            for(let prof of professions) {
                var tag = new Tag();
                tag.id = prof["prof_id"];
                tag.name = prof["prof_name"];

                tags.push(tag);
            }

            map.set(id, tags);
        }

        return map;
    }
}

@Table("Profiles")
export class Profile {
    @Mapped({ dbColumnName: "id", type: MappingType.string, isPrimaryKey:true }) id! : string;
    @Mapped({ dbColumnName: "name", type: MappingType.string, isPrimaryKey:false }) name!: string;
    @Mapped(profileProfessionsMapping) professions: Tag[] = [];
    profilePic:string = "";

    get isEmpty() {
        return this.id.indexOf("EMPTY") != -1;
    }

    static Empty(number: number): Profile {
        var profile = new Profile();
        profile.id = "EMPTY PROFILE " + number;
        profile.name = "Empty Profile " + number;
        profile.professions = [];

        return profile;
    }
}

@Table("Professions")
export class Tag {
    @Mapped({ dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id! : number;
    @Mapped({ dbColumnName: "name", type: MappingType.string, isPrimaryKey:false }) name!: string;
}

export class Room {
    id!: number;
    name!: string;
    conditions: Condition[] = [];
}

export class Condition
{
    constructor(public tag: Tag,public amount: number, public importance: AssignmentImportance)
    {
    }
}

export enum AssignmentType {
    Room = "Room",
    Rotation = "Rotation",
    Permanent = "Permanent"
}

export enum AssignmentImportance {
    Required = "Required",
    NiceToHave = "Nice To Have"
}

@Table("Assignments")
export class Assignment {
    @Mapped({ dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id!:number;
    @Mapped({ dbColumnName: "type", type: MappingType.string, isPrimaryKey:false }) type!: AssignmentType;
    @Mapped({ dbColumnName: "data", type: MappingType.string, isPrimaryKey:false }) data!: string;

    // Not mapped
    room?: Room;

    // Room type
    profession?: Tag
    importance?: AssignmentImportance;

    // Not mapped - Permanent type
    day?: string
    profile?: Profile;

    // Not mapped - Rotation type
    isLockedForNextDay?: boolean;
}

export class TypesHelper {
    static typesMapping: {[typeName:string] : Function} = {"Tag" : Tag};
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
}

export class WeeklySchedule {
    days: DailySchedule[] = [];
    startDate: Date;
    endDate: Date;
}