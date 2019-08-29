import { Table, Mapped, MappingType, IComplexMapping } from "./reflection";

var roomToConditionsMapping: IComplexMapping = {
    property: "conditions",
    sourceType: "Condition",
    db: {
        sourceTable: "Conditions",
        sourceProp: "id",
        sourceAlias: "cond",
        sourceAdditionalData: ["amount", "day", "importance", "isLockedForNextDay", "professionId","profileId", "roomId","type"],

        connTable: "Conditions",
        connAlias: "conn_cond",
        connToSourceProp: "id",
        connToMainProp: "roomId"
    },
    toItemsMap: (primaryKeyValues: number[],  results: any[]) => {
        var map: Map<number, Condition[]> = new Map<number, Condition[]>();

        for(let id of primaryKeyValues) {
            var conditionsResult = results.filter(x => x.id == id && x["cond_roomId"] != null);
            var conditions = [];
            for(let cond of conditionsResult) {
                var condition: Condition = {
                    id: cond["cond_id"],
                    amount: cond["cond_amount"],
                    day: cond["cond_day"],
                    importance: cond["cond_importance"],
                    isLockedForNextDay: cond["cond_isLockedForNextDay"],
                    professionId: cond["cond_professionId"],
                    profileId: cond["cond_profileId"],
                    roomId: cond["cond_roomId"],
                    type: cond["cond_type"]
                };

                conditions.push(condition);
            }

            map.set(id, conditions);
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
    @Mapped(roomToConditionsMapping) conditions: Condition[] = [];
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

@Table("Conditions")
export class Condition {
    @Mapped({ dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id:number;
    @Mapped({ dbColumnName: "type", type: MappingType.string }) type: ConditionType;
    @Mapped({ dbColumnName: "amount", type:MappingType.number}) amount: number = 1;
    @Mapped({ dbColumnName: "roomId", type:MappingType.number}) roomId?: number;
    @Mapped({ dbColumnName: "professionId", type:MappingType.number}) professionId?: number;
    @Mapped({ dbColumnName: "importance", type: MappingType.string}) importance?: ConditionImportance;
    @Mapped({ dbColumnName: "day", type: MappingType.string}) day?: Day;
    @Mapped({ dbColumnName: "profileId", type:MappingType.string}) profileId?: string;
    @Mapped({ dbColumnName: "isLockedForNextDay", type:MappingType.boolean}) isLockedForNextDay?: boolean;
    // TODO : Info

    constructor(_profession: Tag, _amount:number, _importance: ConditionImportance) {
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

export class Condition {
    @Mapped({ dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id: number;
    @Mapped({ dbColumnName: "conditionId", type: MappingType.number }) conditionId: number;
    @Mapped({ dbColumnName: "profileId", type: MappingType.string }) profileId: number;
    @Mapped({ dbColumnName: "date", type: MappingType.date }) date: Date;

    // Not mapped
    condition: Condition;
    profile: Profile;
}

export class TypesHelper {
    static typesMapping: {[typeName:string] : Function} = {"Tag" : Tag,
                                                           "Condition": Condition};
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
}

export class WeeklySchedule {
    days: {[day:string] : DailySchedule} = {};
    startDate: Date;
    endDate: Date;
}
