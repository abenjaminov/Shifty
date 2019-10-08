"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Profile_1, Tag_1;
Object.defineProperty(exports, "__esModule", { value: true });
const reflection_1 = require("./reflection");
const profile_mappings_config_1 = require("./profile-mappings.config");
var conditionToProfileMapping = {
    descriminator: reflection_1.InterfaceDescriminator.IOneToOneMapping,
    jsonProperty: "profile",
    sourceType: "Profile",
    db: {
        descriminator: reflection_1.InterfaceDescriminator.IOneToOneDbMapping,
        sourceTable: "Profiles",
        sourceProp: "id",
        mainProp: "profileId",
        sourceAlias: "profilec",
        sourceAdditionalData: ["name"]
    },
    toItemMap: (primaryKeyValues, results, alias) => {
        alias = alias ? (alias + "_") : "";
        var map = new Map();
        for (let id of primaryKeyValues) {
            var professionResult = results.find(x => x[`${alias}id`] == id &&
                x["profilec_id"] != null &&
                x[`${alias}profileId`] != null &&
                x[`${alias}profileId`] == x["profilec_id"]);
            var profile = undefined;
            if (professionResult) {
                profile = new Profile();
                profile.id = professionResult["profilec_id"],
                    profile.name = professionResult["profilec_name"],
                    profile.professions = [],
                    profile.profilePic = "";
            }
            map.set(id, profile);
        }
        return map;
    }
};
var conditionToProfessionMapping = {
    descriminator: reflection_1.InterfaceDescriminator.IOneToOneMapping,
    jsonProperty: "profession",
    sourceType: "Profession",
    db: {
        descriminator: reflection_1.InterfaceDescriminator.IOneToOneDbMapping,
        sourceTable: "Professions",
        sourceProp: "id",
        mainProp: "professionId",
        sourceAlias: "professionc",
        sourceAdditionalData: ["name"]
    },
    toItemMap: (primaryKeyValues, results, alias) => {
        alias = alias ? (alias + "_") : "";
        var map = new Map();
        for (let id of primaryKeyValues) {
            var professionResult = results.find(x => x[`${alias}id`] == id &&
                x["professionc_id"] != null &&
                x[`${alias}professionId`] != null &&
                x[`${alias}professionId`] == x["professionc_id"]);
            var profession = undefined;
            if (professionResult) {
                profession = {
                    id: professionResult["professionc_id"],
                    name: professionResult["professionc_name"]
                };
            }
            map.set(id, profession);
        }
        return map;
    }
};
var roomToConditionsMapping = {
    descriminator: reflection_1.InterfaceDescriminator.IOneToManyMapping,
    jsonProperty: "conditions",
    sourceType: "Condition",
    db: {
        descriminator: reflection_1.InterfaceDescriminator.IOneToManyDbMapping,
        sourceTable: "Conditions",
        sourceProp: "id",
        sourceAlias: "cond",
        sourceAdditionalData: ["amount", "day", "importance", "isLockedForNextDay", "professionId", "profileId", "roomId", "type"],
        connTable: "Conditions",
        connAlias: "conn_cond",
        connToSourceProp: "id",
        connToMainProp: "roomId"
    },
    toItemsMap: (primaryKeyValues, results) => {
        var map = new Map();
        for (let id of primaryKeyValues) {
            var conditionsResult = results.filter(x => x.id == id && x["cond_roomId"] != null);
            var conditions = [];
            for (let cond of conditionsResult) {
                var condition = {
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
};
let Profile = Profile_1 = class Profile {
    constructor() {
        this.professions = [];
        this.absences = [];
        this.nonWorkingDays = [];
        this.profilePic = "";
    }
    get isEmpty() {
        return this.id.indexOf("EMPTY") != -1;
    }
    static Empty(number) {
        var profile = new Profile_1();
        profile.id = "EMPTY PROFILE " + number;
        profile.name = "Empty Profile " + number;
        profile.professions = [];
        return profile;
    }
};
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "id", type: reflection_1.MappingType.string, isPrimaryKey: true })
], Profile.prototype, "id", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "name", type: reflection_1.MappingType.string, isPrimaryKey: false })
], Profile.prototype, "name", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "username", type: reflection_1.MappingType.string, isPrimaryKey: false })
], Profile.prototype, "username", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "isAssigned", type: reflection_1.MappingType.boolean, isPrimaryKey: false })
], Profile.prototype, "isAssigned", void 0);
__decorate([
    reflection_1.Mapped(profile_mappings_config_1.profileProfessionsMapping)
], Profile.prototype, "professions", void 0);
__decorate([
    reflection_1.Mapped(profile_mappings_config_1.profileAbsenceMapping)
], Profile.prototype, "absences", void 0);
__decorate([
    reflection_1.Mapped(profile_mappings_config_1.profileNonWorkingDayMapping)
], Profile.prototype, "nonWorkingDays", void 0);
Profile = Profile_1 = __decorate([
    reflection_1.Table("Profiles")
], Profile);
exports.Profile = Profile;
let Tag = Tag_1 = class Tag {
    static Empty() {
        if (!Tag_1.emptyTag) {
            Tag_1.emptyTag = new Tag_1();
            Tag_1.emptyTag.id = -1;
            Tag_1.emptyTag.name = "Empty Tag";
        }
        return Tag_1.emptyTag;
    }
};
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "id", type: reflection_1.MappingType.number, isPrimaryKey: true })
], Tag.prototype, "id", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "name", type: reflection_1.MappingType.string, isPrimaryKey: false })
], Tag.prototype, "name", void 0);
Tag = Tag_1 = __decorate([
    reflection_1.Table("Professions")
], Tag);
exports.Tag = Tag;
let Room = class Room {
    constructor() {
        this.conditions = [];
    }
};
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "id", type: reflection_1.MappingType.number, isPrimaryKey: true })
], Room.prototype, "id", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "name", type: reflection_1.MappingType.string, isPrimaryKey: false })
], Room.prototype, "name", void 0);
__decorate([
    reflection_1.Mapped(roomToConditionsMapping)
], Room.prototype, "conditions", void 0);
Room = __decorate([
    reflection_1.Table("Rooms")
], Room);
exports.Room = Room;
var ConditionType;
(function (ConditionType) {
    ConditionType["Room"] = "Room";
    ConditionType["Rotation"] = "Rotation";
    ConditionType["Permanent"] = "Permanent";
})(ConditionType = exports.ConditionType || (exports.ConditionType = {}));
var ConditionImportance;
(function (ConditionImportance) {
    ConditionImportance["Required"] = "Required";
    ConditionImportance["NiceToHave"] = "Nice To Have";
})(ConditionImportance = exports.ConditionImportance || (exports.ConditionImportance = {}));
let Condition = class Condition {
    constructor(_profession, _amount, _importance) {
        this.amount = 1;
        this.profession = _profession;
        this.amount = _amount;
        this.importance = _importance;
    }
};
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "id", type: reflection_1.MappingType.number, isPrimaryKey: true })
], Condition.prototype, "id", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "description", type: reflection_1.MappingType.string })
], Condition.prototype, "description", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "type", type: reflection_1.MappingType.string })
], Condition.prototype, "type", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "amount", type: reflection_1.MappingType.number })
], Condition.prototype, "amount", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "roomId", type: reflection_1.MappingType.number })
], Condition.prototype, "roomId", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "professionId", type: reflection_1.MappingType.number })
], Condition.prototype, "professionId", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "importance", type: reflection_1.MappingType.string })
], Condition.prototype, "importance", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "day", type: reflection_1.MappingType.string })
], Condition.prototype, "day", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "profileId", type: reflection_1.MappingType.string })
], Condition.prototype, "profileId", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "isLockedForNextDay", type: reflection_1.MappingType.boolean })
], Condition.prototype, "isLockedForNextDay", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "isDeleted", type: reflection_1.MappingType.boolean })
], Condition.prototype, "isDeleted", void 0);
__decorate([
    reflection_1.Mapped(conditionToProfileMapping)
], Condition.prototype, "profile", void 0);
__decorate([
    reflection_1.Mapped(conditionToProfessionMapping)
], Condition.prototype, "profession", void 0);
Condition = __decorate([
    reflection_1.Table("Conditions")
], Condition);
exports.Condition = Condition;
let Assignment = class Assignment {
};
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "id", type: reflection_1.MappingType.number, isPrimaryKey: true })
], Assignment.prototype, "id", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "conditionId", type: reflection_1.MappingType.number })
], Assignment.prototype, "conditionId", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "profileId", type: reflection_1.MappingType.string })
], Assignment.prototype, "profileId", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "date", type: reflection_1.MappingType.date })
], Assignment.prototype, "date", void 0);
Assignment = __decorate([
    reflection_1.Table("Assignments")
], Assignment);
exports.Assignment = Assignment;
let Absence = class Absence {
};
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "id", type: reflection_1.MappingType.number, isPrimaryKey: true })
], Absence.prototype, "id", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "profileId", type: reflection_1.MappingType.string })
], Absence.prototype, "profileId", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "startDate", type: reflection_1.MappingType.date })
], Absence.prototype, "startDate", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "endDate", type: reflection_1.MappingType.date })
], Absence.prototype, "endDate", void 0);
Absence = __decorate([
    reflection_1.Table("Absences")
], Absence);
exports.Absence = Absence;
let NonWorkingDay = class NonWorkingDay {
};
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "id", type: reflection_1.MappingType.number, isPrimaryKey: true })
], NonWorkingDay.prototype, "id", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "profileId", type: reflection_1.MappingType.string })
], NonWorkingDay.prototype, "profileId", void 0);
__decorate([
    reflection_1.Mapped({ descriminator: reflection_1.InterfaceDescriminator.ISimpleMapping, dbColumnName: "day", type: reflection_1.MappingType.string })
], NonWorkingDay.prototype, "day", void 0);
NonWorkingDay = __decorate([
    reflection_1.Table("NonWorkingDays")
], NonWorkingDay);
exports.NonWorkingDay = NonWorkingDay;
class TypesHelper {
}
TypesHelper.typesMapping = { "Tag": Tag,
    "Condition": Condition,
    "Profile": Profile,
    "Profession": Tag,
    "Absence": Absence,
    "NonWorkingDay": NonWorkingDay };
exports.TypesHelper = TypesHelper;
var Day;
(function (Day) {
    Day["Sunday"] = "Sunday";
    Day["Monday"] = "Monday";
    Day["Tuesday"] = "Tuesday";
    Day["Wednesday"] = "Wednesday";
    Day["Thursday"] = "Thursday";
    Day["Friday"] = "Friday";
    Day["Saturday"] = "Saturday";
})(Day = exports.Day || (exports.Day = {}));
class DailySchedule {
    constructor() {
        this.assignments = [];
    }
}
exports.DailySchedule = DailySchedule;
class WeeklySchedule {
    constructor() {
        this.days = {};
    }
}
exports.WeeklySchedule = WeeklySchedule;
/**
 * You first need to create a formatting function to pad numbers to two digits…
 **/
function twoDigits(d) {
    if (0 <= d && d < 10)
        return "0" + d.toString();
    if (-10 < d && d < 0)
        return "-0" + (-1 * d).toString();
    return d.toString();
}
exports.twoDigits = twoDigits;
//# sourceMappingURL=models.js.map