import { Table, Mapped, MappingType, IOneToManyMapping, IOneToOneMapping, InterfaceDescriminator } from "./reflection";

var conditionToProfileMapping: IOneToOneMapping = {
    descriminator: InterfaceDescriminator.IOneToOneMapping,
    jsonProperty: "profile",
    sourceType: "Profile",
    db: {
        descriminator: InterfaceDescriminator.IOneToOneDbMapping,
        sourceTable: "Profiles",
        sourceProp: "id",
        mainProp: "profileId",
        sourceAlias: "profilec",
        sourceAdditionalData : ["name"]
    },
    toItemMap: (primaryKeyValues: number[],  results: any[]) => {
        var map: Map<number, Profile> = new Map<number, Profile>();

        return map;
    }
}

var conditionToProfessionMapping: IOneToOneMapping = {
    descriminator: InterfaceDescriminator.IOneToOneMapping,
    jsonProperty: "profession",
    sourceType: "Profession",
    db: {
        descriminator: InterfaceDescriminator.IOneToOneDbMapping,
        sourceTable: "Professions",
        sourceProp: "id",
        mainProp: "professionId",
        sourceAlias: "professionc",
        sourceAdditionalData : ["name"]
    },
    toItemMap: (primaryKeyValues: number[],  results: any[], alias?: string) => {
        alias = alias ? (alias + "_") : "";
        var map: Map<number, Tag> = new Map<number, Tag>();

        for(let id of primaryKeyValues) {
            var professionResult = results.find(x => x[`${alias}id`] == id && 
                                                  x["professionc_id"] != null && 
                                                  x[`${alias}professionId`] != null && 
                                                  x[`${alias}professionId`] == x["professionc_id"]);
            var profession: Tag = undefined;

            if(professionResult) {
                profession = {
                    id: professionResult["professionc_id"],
                    name: professionResult["professionc_name"]
                };
            }

            map.set(id, profession);
        }

        return map;
    }
}

var roomToConditionsMapping: IOneToManyMapping = {
    descriminator: InterfaceDescriminator.IOneToManyMapping,
    jsonProperty: "conditions",
    sourceType: "Condition",
    db: {
        descriminator: InterfaceDescriminator.IOneToManyDbMapping,
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

var profileProfessionsMapping: IOneToManyMapping = {
    descriminator: InterfaceDescriminator.IOneToManyMapping,
    jsonProperty: "professions",
    sourceType: "Tag",
    db : {
        descriminator: InterfaceDescriminator.IOneToManyDbMapping,
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
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "id", type: MappingType.string, isPrimaryKey:true }) id! : string;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "name", type: MappingType.string, isPrimaryKey:false }) name!: string;
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
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping, dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id! : number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "name", type: MappingType.string, isPrimaryKey:false }) name!: string;
}

@Table("Rooms")
export class Room {
    @Mapped({descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id! : number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "name", type: MappingType.string, isPrimaryKey:false }) name!: string;
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
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id:number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "type", type: MappingType.string }) type: ConditionType;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "amount", type:MappingType.number}) amount: number = 1;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "roomId", type:MappingType.number}) roomId?: number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "professionId", type:MappingType.number}) professionId?: number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "importance", type: MappingType.string}) importance?: ConditionImportance;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "day", type: MappingType.string}) day?: Day;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "profileId", type:MappingType.string}) profileId?: string;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "isLockedForNextDay", type:MappingType.boolean}) isLockedForNextDay?: boolean;
    // TODO : Info

    @Mapped(conditionToProfileMapping) profile?: Profile;
    @Mapped(conditionToProfessionMapping) profession?: Tag;

    constructor(_profession: Tag, _amount:number, _importance: ConditionImportance) {
        this.profession = _profession;
        this.amount = _amount;
        this.importance = _importance;
    }

    // Not mapped
    room?: Room;

    // Not mapped - Permanent type
    
}

@Table("Assignments")
export class Assignment {
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id: number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "conditionId", type: MappingType.number }) conditionId: number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "profileId", type: MappingType.string }) profileId: string;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "date", type: MappingType.date }) date: Date;

    // Not mapped
    condition: Condition;
    profile: Profile;
}

export class TypesHelper {
    static typesMapping: {[typeName:string] : Function} = {"Tag" : Tag,
                                                           "Condition": Condition,
                                                           "Profile" : Profile,
                                                            "Profession" : Tag};
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
