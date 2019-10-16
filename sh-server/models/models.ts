import { Table, Mapped, MappingType, IOneToManyMapping, IOneToOneMapping, InterfaceDescriminator } from "./reflection";
import { profileNonWorkingDayMapping, profileAbsenceMapping, profileProfessionsMapping } from "./profile-mappings.config";

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
    toItemMap: (primaryKeyValues: number[],  results: any[], alias?: string) => {
        alias = alias ? (alias + "_") : "";
        var map: Map<number, Profile> = new Map<number, Profile>();

        for(let id of primaryKeyValues) {
            var professionResult = results.find(x => x[`${alias}id`] == id && 
                                                  x["profilec_id"] != null && 
                                                  x[`${alias}profileId`] != null && 
                                                  x[`${alias}profileId`] == x["profilec_id"]);
            var profile: Profile = undefined;

            if(professionResult) {
                profile = new Profile() ;
                profile.id = professionResult["profilec_id"],
                profile.name = professionResult["profilec_name"],
                profile.professions = [],
                profile.profilePic = ""
            }

            map.set(id, profile);
        }

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
                    description: cond["cond_description"],
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

@Table("Profiles")
export class Profile {
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "id", type: MappingType.string, isPrimaryKey:true }) id! : string;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "name", type: MappingType.string, isPrimaryKey:false }) name!: string;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "username", type: MappingType.string, isPrimaryKey:false }) username?: string;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "isAssignable", type: MappingType.boolean, isPrimaryKey:false }) isAssignable?: string;
    @Mapped(profileProfessionsMapping) professions: Tag[] = [];
    @Mapped(profileAbsenceMapping) absences: Absence[] = [];
    @Mapped(profileNonWorkingDayMapping) nonWorkingDays: NonWorkingDay[] = [];

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

    private static emptyTag: Tag;
    static Empty(): Tag {
        if(!Tag.emptyTag) {
            Tag.emptyTag = new Tag();
            Tag.emptyTag.id = -1;
            Tag.emptyTag.name = "Empty Tag";
        }

        return Tag.emptyTag;
    }
}

@Table("Rooms")
export class Room {
    @Mapped({descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id! : number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "name", type: MappingType.string, isPrimaryKey:false }) name!: string;
    @Mapped(roomToConditionsMapping) conditions: Condition[] = [];

    // Not mapped from DB
    isDynamic: boolean;
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
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "description", type: MappingType.string }) description:string;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "type", type: MappingType.string }) type: ConditionType;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "amount", type:MappingType.number}) amount: number = 1;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "roomId", type:MappingType.number}) roomId?: number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "professionId", type:MappingType.number}) professionId?: number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "importance", type: MappingType.string}) importance?: ConditionImportance;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "day", type: MappingType.string}) day?: Day;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "profileId", type:MappingType.string}) profileId?: string;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "isLockedForNextDay", type:MappingType.boolean}) isLockedForNextDay?: boolean;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "isDeleted", type:MappingType.boolean}) isDeleted?: boolean;
    
    @Mapped(conditionToProfileMapping) profile?: Profile;
    @Mapped(conditionToProfessionMapping) profession?: Tag;

    constructor(_profession: Tag, _amount:number, _importance: ConditionImportance) {
        this.profession = _profession;
        this.amount = _amount;
        this.importance = _importance;
    }

    // Not mapped
    room?: Room;
    
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

@Table("Absences")
export class Absence {
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id: number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "profileId", type: MappingType.string }) profileId: string;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "startDate", type: MappingType.date }) startDate: Date;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "endDate", type: MappingType.date }) endDate: Date;
}

@Table("NonWorkingDays")
export class NonWorkingDay {
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id: number;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "profileId", type: MappingType.string }) profileId: string;
    @Mapped({ descriminator: InterfaceDescriminator.ISimpleMapping,dbColumnName: "day", type: MappingType.string}) day?: Day;
}

export class TypesHelper {
    static typesMapping: {[typeName:string] : Function} = { "Tag" : Tag,
                                                           "Condition": Condition,
                                                           "Profile" : Profile,
                                                            "Profession" : Tag,
                                                            "Absence" : Absence,
                                                            "NonWorkingDay": NonWorkingDay };
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
    id: string;
    days: {[day:string] : DailySchedule} = {};
    startDate: Date;
    endDate: Date;
    numberOfAssignments: number;
}

/**
 * You first need to create a formatting function to pad numbers to two digits…
 **/
export function twoDigits(d: number) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}


