import { Table, Mapped, MappingType, IComplexMapping } from "./reflection";

var roomToAssignmentsMapping: IComplexMapping = {
    property: "assignments",
    sourceType: "Assignment",
    db: {
        sourceTable: "Assignments",
        sourceProp: "id",
        sourceAlias: "asgn",
        sourceAdditionalData: ["amount", "day", "importance", "isLockedForNextDay", "professionId","profileId", "roomId","type"],

        connTable: "Assignments",
        connAlias: "conn_asgn",
        connToSourceProp: "id",
        connToMainProp: "roomId"
    },
    toItemsMap: (primaryKeyValues: number[],  results: any[]) => {
        var map: Map<number, Assignment[]> = new Map<number, Assignment[]>();

        for(let id of primaryKeyValues) {
            var assignmentsResult = results.filter(x => x.id == id && x["asgn_roomId"] != null);
            var assignments = [];
            for(let asgn of assignmentsResult) {
                var assignment: Assignment = {
                    id: asgn["asgn_id"],
                    amount: asgn["asgn_amount"],
                    day: asgn["asgn_day"],
                    importance: asgn["asgn_importance"],
                    isLockedForNextDay: asgn["asgn_isLockedForNextDay"],
                    professionId: asgn["asgn_professionId"],
                    profileId: asgn["asgn_profileId"],
                    roomId: asgn["asgn_roomId"],
                    type: asgn["asgn_type"]
                };

                assignments.push(assignment);
            }

            map.set(id, assignments);
        }

        return map;
    }
}

var profileProfessionsMapping: IComplexMapping = {
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

@Table("Rooms")
export class Room {
    @Mapped({dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id! : number;
    @Mapped({ dbColumnName: "name", type: MappingType.string, isPrimaryKey:false }) name!: string;
    @Mapped(roomToAssignmentsMapping) assignments: Assignment[] = [];
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
    @Mapped({ dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id:number;
    @Mapped({ dbColumnName: "type", type: MappingType.string }) type: AssignmentType;
    @Mapped({ dbColumnName: "amount", type:MappingType.number}) amount: number = 1;
    @Mapped({ dbColumnName: "roomId", type:MappingType.number}) roomId?: number;
    @Mapped({ dbColumnName: "professionId", type:MappingType.number}) professionId?: number;
    @Mapped({ dbColumnName: "importance", type: MappingType.string}) importance?: AssignmentImportance;
    @Mapped({ dbColumnName: "day", type: MappingType.string}) day?: Day;
    @Mapped({ dbColumnName: "profileId", type:MappingType.string}) profileId?: string;
    @Mapped({ dbColumnName: "isLockedForNextDay", type:MappingType.boolean}) isLockedForNextDay?: boolean;
    // TODO : Info

    constructor(_profession: Tag, _amount:number, _importance: AssignmentImportance) {
        this.profession = _profession;
        this.amount = _amount;
        this.importance = _importance;
    }

    // Not mapped
    room?: Room;
    profession?: Tag

    // Not mapped - Permanent type
    profile?: Profile;
}

export class TypesHelper {
    static typesMapping: {[typeName:string] : Function} = {"Tag" : Tag,
                                                           "Assignment": Assignment};
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
    days: {[day:string] : DailySchedule} = {};
    startDate: Date;
    endDate: Date;
}