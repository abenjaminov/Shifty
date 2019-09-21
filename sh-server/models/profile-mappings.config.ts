import { IOneToManyMapping, InterfaceDescriminator } from "./reflection";
import { NonWorkingDay, Absence, Tag } from "./models";
import Enumerable from "linq";

export var profileNonWorkingDayMapping: IOneToManyMapping = {
    descriminator: InterfaceDescriminator.IOneToManyMapping,
    jsonProperty: "nonWorkingDays",
    sourceType: "NonWorkingDay",
    db : {
        descriminator: InterfaceDescriminator.IOneToManyDbMapping,
        sourceTable: "NonWorkingDays",
        sourceProp: "id",
        sourceAlias: "nwd",
        sourceAdditionalData: ["profileId", "day"],

        connTable: "NonWorkingDays",
        connAlias: "conn_nwd",
        connToSourceProp: "id",
        connToMainProp: "profileId"
    },
    toItemsMap: (primaryKeyValues: string[], results: any[]) => {
        var map: Map<string, NonWorkingDay[]> = new Map<string, NonWorkingDay[]>();

        for(let id of primaryKeyValues) {
            var nonWorkingDays = Enumerable.from(results).where(x => x.id == id && x["nwd_id"] != null).distinct(x => x["nwd_id"]).toArray();
            var nonWorkingDayInstances: NonWorkingDay[] = [];
            for(let nonWorkingDay of nonWorkingDays) {
                let nonWorkingDayInstance: NonWorkingDay = {
                    id : nonWorkingDay["nwd_id"],
                    profileId : nonWorkingDay["nwd_profileId"],
                    day : nonWorkingDay["nwd_day"]
                }
                nonWorkingDayInstances.push(nonWorkingDayInstance);
            }

            map.set(id, nonWorkingDayInstances);
        }

        return map;
    }
}

export var profileAbsenceMapping: IOneToManyMapping = {
    descriminator: InterfaceDescriminator.IOneToManyMapping,
    jsonProperty: "absences",
    sourceType: "Absence",
    db : {
        descriminator: InterfaceDescriminator.IOneToManyDbMapping,
        sourceTable: "Absences",
        sourceProp: "id",
        sourceAlias: "abs",
        sourceAdditionalData: ["profileId", "startDate", "endDate"],

        connTable: "Absences",
        connAlias: "conn_abs",
        connToSourceProp: "id",
        connToMainProp: "profileId"
    },
    toItemsMap: (primaryKeyValues: string[], results: any[]) => {
        var map: Map<string, Absence[]> = new Map<string, Absence[]>();

        for(let id of primaryKeyValues) {
            var absences = Enumerable.from(results).where(x => x.id == id && x["abs_id"] != null).distinct(x => x["abs_id"]).toArray();
            var absenceInstances: Absence[] = [];
            for(let abstence of absences) {
                let absInstance: Absence = {
                    id : abstence["abs_id"],
                    profileId : abstence["abs_profileId"],
                    startDate : abstence["abs_startDate"],
                    endDate : abstence["abs_endDate"]
                }
                absenceInstances.push(absInstance);
            }

            map.set(id, absenceInstances);
        }

        return map;
    }
}

export var profileProfessionsMapping: IOneToManyMapping = {
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
            var professions = Enumerable.from(results).where(x => x.id == id && x["prof_id"] != null).distinct(x => x["prof_id"]).toArray();
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