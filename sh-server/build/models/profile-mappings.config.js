"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reflection_1 = require("./reflection");
const models_1 = require("./models");
const linq_1 = __importDefault(require("linq"));
exports.profileNonWorkingDayMapping = {
    descriminator: reflection_1.InterfaceDescriminator.IOneToManyMapping,
    jsonProperty: "nonWorkingDays",
    sourceType: "NonWorkingDay",
    db: {
        descriminator: reflection_1.InterfaceDescriminator.IOneToManyDbMapping,
        sourceTable: "NonWorkingDays",
        sourceProp: "id",
        sourceAlias: "nwd",
        sourceAdditionalData: ["profileId", "day"],
        connTable: "NonWorkingDays",
        connAlias: "conn_nwd",
        connToSourceProp: "id",
        connToMainProp: "profileId"
    },
    toItemsMap: (primaryKeyValues, results) => {
        var map = new Map();
        for (let id of primaryKeyValues) {
            var nonWorkingDays = linq_1.default.from(results).where(x => x.id == id && x["nwd_id"] != null).distinct(x => x["nwd_id"]).toArray();
            var nonWorkingDayInstances = [];
            for (let nonWorkingDay of nonWorkingDays) {
                let nonWorkingDayInstance = {
                    id: nonWorkingDay["nwd_id"],
                    profileId: nonWorkingDay["nwd_profileId"],
                    day: nonWorkingDay["nwd_day"]
                };
                nonWorkingDayInstances.push(nonWorkingDayInstance);
            }
            map.set(id, nonWorkingDayInstances);
        }
        return map;
    }
};
exports.profileAbsenceMapping = {
    descriminator: reflection_1.InterfaceDescriminator.IOneToManyMapping,
    jsonProperty: "absences",
    sourceType: "Absence",
    db: {
        descriminator: reflection_1.InterfaceDescriminator.IOneToManyDbMapping,
        sourceTable: "Absences",
        sourceProp: "id",
        sourceAlias: "abs",
        sourceAdditionalData: ["profileId", "startDate", "endDate"],
        connTable: "Absences",
        connAlias: "conn_abs",
        connToSourceProp: "id",
        connToMainProp: "profileId"
    },
    toItemsMap: (primaryKeyValues, results) => {
        var map = new Map();
        for (let id of primaryKeyValues) {
            var absences = linq_1.default.from(results).where(x => x.id == id && x["abs_id"] != null).distinct(x => x["abs_id"]).toArray();
            var absenceInstances = [];
            for (let abstence of absences) {
                let absInstance = {
                    id: abstence["abs_id"],
                    profileId: abstence["abs_profileId"],
                    startDate: abstence["abs_startDate"],
                    endDate: abstence["abs_endDate"]
                };
                absenceInstances.push(absInstance);
            }
            map.set(id, absenceInstances);
        }
        return map;
    }
};
exports.profileProfessionsMapping = {
    descriminator: reflection_1.InterfaceDescriminator.IOneToManyMapping,
    jsonProperty: "professions",
    sourceType: "Tag",
    db: {
        descriminator: reflection_1.InterfaceDescriminator.IOneToManyDbMapping,
        sourceTable: "Professions",
        sourceProp: "id",
        sourceAlias: "prof",
        sourceAdditionalData: ["name"],
        connTable: "ProfilesProfessions",
        connAlias: "PP",
        connToSourceProp: "ProfessionId",
        connToMainProp: "ProfileId",
    },
    toItemsMap: (primaryKeyValues, results) => {
        var map = new Map();
        for (let id of primaryKeyValues) {
            var professions = linq_1.default.from(results).where(x => x.id == id && x["prof_id"] != null).distinct(x => x["prof_id"]).toArray();
            var tags = [];
            for (let prof of professions) {
                var tag = new models_1.Tag();
                tag.id = prof["prof_id"];
                tag.name = prof["prof_name"];
                tags.push(tag);
            }
            map.set(id, tags);
        }
        return map;
    }
};
//# sourceMappingURL=profile-mappings.config.js.map