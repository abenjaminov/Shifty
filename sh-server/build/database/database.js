"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("./connection"));
const models_1 = require("../models/models");
const reflection_1 = require("../models/reflection");
const logs_service_1 = require("../services/logs.service");
class DbContext {
    constructor() {
        this.select.bind(this);
        this.logService = new logs_service_1.LogService("Databse Context");
    }
    select(type, withForeignData = true, deepSelect = false, filters = []) {
        return __awaiter(this, void 0, void 0, function* () {
            let selectPromise = new Promise((resolve, reject) => {
                let mappedProperties = reflection_1.ReflectionHelper.getMappedProperties(type);
                let tableName = reflection_1.ReflectionHelper.getTableName(type);
                let foreignData = Reflect.ownKeys(mappedProperties).map(x => mappedProperties[x.toString()]);
                let primaryDbKey = foreignData.find(x => x.isPrimaryKey).dbColumnName;
                if (!primaryDbKey) {
                    // TODO : Log
                    console.error("General : Type does not have a primary key");
                    reject("Context.Select -> No Primary key found for " + tableName);
                }
                let oneToManyMappings = foreignData.filter(x => x.descriminator == reflection_1.InterfaceDescriminator.IOneToManyMapping);
                let oneToOneMappings = foreignData.filter(x => x.descriminator == reflection_1.InterfaceDescriminator.IOneToOneMapping);
                let join = "";
                let select = [];
                if (withForeignData) {
                    var typeToDeepTypes = new Map();
                    // Build the join statements
                    join += this.applyOneToManyMappings(type, "Z", primaryDbKey, select, typeToDeepTypes);
                    join += this.applyOneToOneMappings(type, "Z", select, typeToDeepTypes);
                    if (deepSelect) {
                        typeToDeepTypes.forEach((type, key) => {
                            let currentType = models_1.TypesHelper.typesMapping[type.typeName];
                            let joinMany = this.applyOneToManyMappings(currentType, type.typeAlias, type.keyDbColumn, select, new Map());
                            let joinType = this.applyOneToOneMappings(currentType, type.typeAlias, select, new Map());
                            let oneToOneDeepMapping = reflection_1.ReflectionHelper.getMappingsByType(currentType, reflection_1.InterfaceDescriminator.IOneToOneMapping);
                            let oneToManyDeepMapping = reflection_1.ReflectionHelper.getMappingsByType(currentType, reflection_1.InterfaceDescriminator.IOneToManyMapping);
                            type.oneToOneMappings.push(...oneToOneDeepMapping);
                            type.oneToManyMappings.push(...oneToManyDeepMapping);
                            join += joinMany;
                            join += joinType;
                        });
                    }
                }
                let simpleMappedProperties = reflection_1.ReflectionHelper.getSimpleMappedProperties(type);
                let where = '';
                for (let i = 0; i < filters.length; i++) {
                    let orFilter = filters[i].dataFilters;
                    for (let j = 0; j < orFilter.length; j++) {
                        let andFilter = orFilter[j];
                        let simpleProp = simpleMappedProperties[andFilter.property];
                        let dbValueText = this.connection.escape(this.getDbValueText(simpleProp.type, andFilter.value, true));
                        where += `Z.${simpleProp.dbColumnName} = ${dbValueText}${j < orFilter.length - 1 ? ' AND ' : ''}`;
                    }
                    where += i < filters.length - 1 ? " OR " : "";
                }
                let query = `SELECT Z.*${select.length > 0 ? ',' : ''} ${select.join(",")} FROM ${tableName} Z ${join} WHERE ${where == '' ? '1 = 1' : where}`;
                this.connection.query(query, (err, result, fields) => {
                    if (err) {
                        // TODO : Log
                        reject(err);
                    }
                    let distinctResult = this.distinctResult(mappedProperties, primaryDbKey, result);
                    for (let foreignMap of oneToManyMappings) {
                        let items = foreignMap.toItemsMap(distinctResult.map(x => x[primaryDbKey]), result);
                        distinctResult.forEach(resItem => {
                            let thisItems = items.get(resItem[primaryDbKey]);
                            resItem[foreignMap.jsonProperty] = thisItems;
                        });
                    }
                    for (let oneToOneMapping of oneToOneMappings) {
                        let itemMap = oneToOneMapping.toItemMap(distinctResult.map(x => x[primaryDbKey]), result);
                        distinctResult.forEach(resItem => {
                            let thisItem = itemMap.get(resItem[primaryDbKey]);
                            resItem[oneToOneMapping.jsonProperty] = thisItem;
                        });
                    }
                    if (withForeignData && deepSelect) {
                        // TODO : Map one to many
                        typeToDeepTypes.forEach((deepType, key) => {
                            for (let oneToOneMapping of deepType.oneToOneMappings) {
                                let objects = distinctResult.map(dr => dr[deepType.jsonProperty]);
                                if (objects.length > 0) {
                                    let ids;
                                    if (Array.isArray(objects[0])) {
                                        ids = objects.map(value => value.map((innerValues) => innerValues[deepType.keyDbColumn])).reduce((total, o) => total.concat(o));
                                    }
                                    else {
                                        ids = objects.map(x => x[deepType.keyDbColumn]);
                                    }
                                    let itemMap = oneToOneMapping.toItemMap(ids, result, deepType.typeAlias);
                                    objects.forEach((resItem) => {
                                        if (Array.isArray(resItem)) {
                                            resItem.forEach((innerResItem) => {
                                                let thisItem = itemMap.get(innerResItem[`${deepType.keyDbColumn}`]);
                                                innerResItem[oneToOneMapping.jsonProperty] = thisItem;
                                            });
                                        }
                                        else {
                                            let thisItem = itemMap.get(resItem[`${deepType.typeAlias}_${deepType.keyDbColumn}`]);
                                            resItem[oneToOneMapping.jsonProperty] = thisItem;
                                        }
                                    });
                                }
                            }
                        });
                    }
                    resolve(distinctResult);
                });
            });
            return selectPromise;
        });
    }
    applyOneToOneMappings(type, mainAlias, select, deepTypes) {
        let join = "";
        let oneToOneMappings = reflection_1.ReflectionHelper.getMappingsByType(type, reflection_1.InterfaceDescriminator.IOneToOneMapping);
        for (let oneToOneMapping of oneToOneMappings) {
            let dbConf = oneToOneMapping.db;
            let joinWithMain = `LEFT JOIN ${dbConf.sourceTable} ${dbConf.sourceAlias} ON ${dbConf.sourceAlias}.${dbConf.sourceProp}
                                        = ${mainAlias}.${dbConf.mainProp}`;
            select.push(`${dbConf.sourceAlias}.${dbConf.sourceProp} as ${dbConf.sourceAlias}_${dbConf.sourceProp}`);
            for (let col of dbConf.sourceAdditionalData) {
                select.push(`${dbConf.sourceAlias}.${col} as ${dbConf.sourceAlias}_${col}`);
            }
            join += " " + joinWithMain + " ";
            //this.applyDeepTypes(oneToOneMapping,oneToOneMapping.db.mainProp, deepTypes);
            deepTypes.set(oneToOneMapping.sourceType, {
                keyDbColumn: oneToOneMapping.db.mainProp,
                jsonProperty: oneToOneMapping.jsonProperty,
                typeName: oneToOneMapping.sourceType,
                typeAlias: oneToOneMapping.db.sourceAlias,
                oneToManyMappings: [],
                oneToOneMappings: []
            });
        }
        return join;
    }
    applyOneToManyMappings(type, mainAlias, primaryDbKey, select, deepTypes) {
        let oneToManyMappings = reflection_1.ReflectionHelper.getMappingsByType(type, reflection_1.InterfaceDescriminator.IOneToManyMapping);
        let join = "";
        for (let oneToManyMapping of oneToManyMappings) {
            let dbConf = oneToManyMapping.db;
            let connTableAlias = dbConf.connAlias;
            let joinWithMain = `LEFT JOIN ${dbConf.connTable} ${connTableAlias} ON ${connTableAlias}.${dbConf.connToMainProp}
                                        = ${mainAlias}.${primaryDbKey}`;
            select.push(`${connTableAlias}.${dbConf.connToMainProp} as ${connTableAlias}_${dbConf.connToMainProp}`);
            let sourceTableAlias = dbConf.sourceAlias;
            let joinSourceToCon = `LEFT JOIN ${dbConf.sourceTable} ${sourceTableAlias} ON ${sourceTableAlias}.${dbConf.sourceProp}
                                        = ${connTableAlias}.${dbConf.connToSourceProp}`;
            select.push(`${sourceTableAlias}.${dbConf.sourceProp} as ${sourceTableAlias}_${dbConf.sourceProp}`);
            select.push(`${connTableAlias}.${dbConf.connToSourceProp} as ${connTableAlias}_${dbConf.connToSourceProp}`);
            for (let col of dbConf.sourceAdditionalData) {
                select.push(`${sourceTableAlias}.${col} as ${sourceTableAlias}_${col}`);
            }
            join += " " + joinWithMain + " " + joinSourceToCon;
            deepTypes.set(oneToManyMapping.sourceType, {
                keyDbColumn: primaryDbKey,
                jsonProperty: oneToManyMapping.jsonProperty,
                typeName: oneToManyMapping.sourceType,
                typeAlias: oneToManyMapping.db.sourceAlias,
                oneToManyMappings: [],
                oneToOneMappings: []
            });
        }
        return join;
    }
    distinctResult(mappedProperties, primaryKey, result) {
        let ownKeys = Reflect.ownKeys(mappedProperties);
        let regularPropertyKeys = ownKeys.filter((x) => mappedProperties[x].descriminator == reflection_1.InterfaceDescriminator.ISimpleMapping);
        let items = Array.from(new Set(result.map((x) => x[primaryKey]))).map((pKey) => {
            let resItem = result.find((x) => x[primaryKey] == pKey);
            let mappedItem = {};
            for (let regularPropKey of regularPropertyKeys) {
                let prop = mappedProperties[regularPropKey.toString()].dbColumnName;
                mappedItem[regularPropKey] = resItem[prop];
            }
            return mappedItem;
        });
        return items;
    }
    insert(type, items) {
        return __awaiter(this, void 0, void 0, function* () {
            if (items.length == 0) {
                return [];
            }
            let table = reflection_1.ReflectionHelper.getTableName(type);
            let values = [];
            let simpleMappedProps = reflection_1.ReflectionHelper.getSimpleMappedProperties(type);
            let dbProperties = [];
            for (let prop of Reflect.ownKeys(simpleMappedProps)) {
                if (!simpleMappedProps[prop.toString()].isPrimaryKey) {
                    dbProperties.push(simpleMappedProps[prop.toString()].dbColumnName);
                }
            }
            for (let item of items) {
                values.push([]);
                let primaryProp = Reflect.ownKeys(simpleMappedProps).find(smp => simpleMappedProps[smp.toString()].isPrimaryKey).toString();
                if (item[primaryProp] != undefined) {
                    yield this.update(type, item);
                }
                for (let prop of Reflect.ownKeys(simpleMappedProps)) {
                    let mappedProp = simpleMappedProps[prop.toString()];
                    if (!mappedProp.isPrimaryKey) {
                        values[values.length - 1].push(item[prop] != undefined ? this.getDbValueText(mappedProp.type, item[prop], true) : null);
                    }
                }
            }
            let query = "INSERT INTO " + table + "(" + dbProperties.join(",") + ") VALUES ?";
            let result = yield this.queryToPromise(query, [values]);
            return result;
        });
    }
    updateOrInsert(type, items) {
        return __awaiter(this, void 0, void 0, function* () {
            let table = reflection_1.ReflectionHelper.getTableName(type);
            let itemsToInsert = [];
            let values = [];
            let simpleMappedProps = reflection_1.ReflectionHelper.getSimpleMappedProperties(type);
            let updateCommands = [];
            let primaryProp = Reflect.ownKeys(simpleMappedProps).find(smp => simpleMappedProps[smp.toString()].isPrimaryKey).toString();
            if (items.length > 0) {
                for (let item of items) {
                    values.push([]);
                    if (item[primaryProp] != undefined) {
                        let updateQuery = yield this.update(type, item, true);
                        updateCommands.push(updateQuery);
                    }
                    else {
                        itemsToInsert.push(item);
                    }
                }
                let promises = [this.queryToPromise(updateCommands.join(' ')), this.insert(type, itemsToInsert)];
                yield Promise.all(promises);
            }
            return "No Items";
        });
    }
    update(type, item, execute) {
        return __awaiter(this, void 0, void 0, function* () {
            let table = reflection_1.ReflectionHelper.getTableName(type);
            let simpleMappedProps = reflection_1.ReflectionHelper.getSimpleMappedProperties(type);
            let set = [];
            let where = "";
            for (let prop of Reflect.ownKeys(simpleMappedProps)) {
                let simpleProp = simpleMappedProps[prop.toString()];
                let dbValueText = this.getDbValueText(simpleProp.type, item[prop]);
                if (simpleProp.isPrimaryKey) {
                    where = `${simpleProp.dbColumnName} = ${dbValueText}`;
                }
                else {
                    set.push(`${simpleProp.dbColumnName} = ${dbValueText}`);
                }
            }
            let query = `UPDATE ${table} SET ${set.join(',')} WHERE ${where};`;
            if (!execute) {
                return query;
            }
            else {
                let result = yield this.queryToPromise(query);
                return result;
            }
        });
    }
    deleteConnections(type, connProp, connValue, valuesToKeep) {
        return __awaiter(this, void 0, void 0, function* () {
            let simpleMappedProps = reflection_1.ReflectionHelper.getSimpleMappedProperties(type);
            let tableName = reflection_1.ReflectionHelper.getTableName(type);
            let connectionKeyMapping = simpleMappedProps[connProp];
            let typeText = this.getDbValueText(connectionKeyMapping.type, connValue);
            let deleteQuery = `DELETE FROM ${tableName} WHERE ${connectionKeyMapping.dbColumnName} = ${typeText}`;
            if (valuesToKeep && valuesToKeep.length > 0) {
                let primaryJsonKey = Reflect.ownKeys(simpleMappedProps).find(x => simpleMappedProps[x.toString()].isPrimaryKey);
                primaryJsonKey = primaryJsonKey.toString();
                let primaryKeyMapping = simpleMappedProps[primaryJsonKey];
                let valuesToKeepQueryAddition = [];
                for (let valueToKeep of valuesToKeep) {
                    let addition = `${primaryKeyMapping.dbColumnName} <> ${this.getDbValueText(primaryKeyMapping.type, valueToKeep)}`;
                    valuesToKeepQueryAddition.push(addition);
                }
                deleteQuery += ` AND ${valuesToKeepQueryAddition.join(' AND ')}`;
            }
            yield this.queryToPromise(deleteQuery);
        });
    }
    deleteSimple(type, keyValue) {
        let deletePromise = new Promise((resolve, reject) => {
            let simpleMappedProps = reflection_1.ReflectionHelper.getSimpleMappedProperties(type);
            let primaryJsonKey = Reflect.ownKeys(simpleMappedProps).find(x => simpleMappedProps[x.toString()].isPrimaryKey) || '';
            primaryJsonKey = primaryJsonKey.toString();
            let tableName = reflection_1.ReflectionHelper.getTableName(type);
            let primaryKeyMapping = simpleMappedProps[primaryJsonKey];
            let typeText = this.getDbValueText(primaryKeyMapping.type, keyValue);
            let deleteQuery = `DELETE FROM ${tableName} WHERE ${primaryKeyMapping.dbColumnName} = ${typeText}`;
            this.connection.query(deleteQuery, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
        return deletePromise;
    }
    updateOneToManyMappings(type, item) {
        let updateOneToManyPromise = new Promise((resolve, reject) => {
            let oneToManyPropMappings = reflection_1.ReflectionHelper.getOneToManyMappedProperties(type);
            let simpleMappedProps = reflection_1.ReflectionHelper.getSimpleMappedProperties(type);
            let mainPrimaryJsonKey = Reflect.ownKeys(simpleMappedProps).find(x => simpleMappedProps[x.toString()].isPrimaryKey) || '';
            mainPrimaryJsonKey = mainPrimaryJsonKey.toString();
            // Build delete from connection table
            // --> Delete ProfilesProfessions (connTable) WHERE ProfileId (connToMainProp) = typetoText(item[primaryKey])
            let ownKeys = Reflect.ownKeys(oneToManyPropMappings).filter(ownKey => oneToManyPropMappings[ownKey.toString()].db.connTable != oneToManyPropMappings[ownKey.toString()].db.sourceTable);
            let mainPrimaryKeyMapping = simpleMappedProps[mainPrimaryJsonKey];
            let deletePromises = [];
            for (let key of ownKeys) {
                let oneToManyMapping = oneToManyPropMappings[key.toString()].db;
                let typeText = this.getDbValueText(mainPrimaryKeyMapping.type, item[mainPrimaryJsonKey]);
                let deleteQuery = `DELETE FROM ${oneToManyMapping.connTable} WHERE ${oneToManyMapping.connToMainProp} = ${typeText}`;
                deletePromises.push(this.queryToPromise(deleteQuery));
            }
            // Execute delete
            Promise.all(deletePromises).then((result) => {
                // Build insert connection table
                // INSERT INTO ProfilesProfessions (connTable) VALUES(ProfileId [primaryKey value text], ProfessionId [primary key value text])
                let insertsRemaining = 0;
                for (let key of ownKeys) {
                    let insert = "";
                    let oneToManyMapping = oneToManyPropMappings[key.toString()];
                    insert += `INSERT INTO ${oneToManyMapping.db.connTable} (${oneToManyMapping.db.connToMainProp}, ${oneToManyMapping.db.connToSourceProp}) VALUES ?`;
                    let oneToManyMapValues = item[key.toString()];
                    // oneToManyMapping.sourceType
                    let sourceType = models_1.TypesHelper.typesMapping[oneToManyMapping.sourceType];
                    let simpleSourceTypeMappings = reflection_1.ReflectionHelper.getSimpleMappedProperties(sourceType);
                    let sourcePrimaryJsonKey = Reflect.ownKeys(simpleSourceTypeMappings).find(x => simpleSourceTypeMappings[x.toString()].isPrimaryKey) || '';
                    let sourcePrimaryKeyMapping = simpleSourceTypeMappings[sourcePrimaryJsonKey.toString()];
                    let values = [];
                    for (let value of oneToManyMapValues) {
                        let mainValue = item[mainPrimaryJsonKey.toString()];
                        let sourceValue = value[sourcePrimaryJsonKey];
                        values.push([mainValue, sourceValue]);
                    }
                    insertsRemaining++;
                    this.connection.query(insert, [values], (err, result) => {
                        insertsRemaining--;
                        if (err)
                            reject(err);
                        if (insertsRemaining == 0) {
                            resolve();
                        }
                    });
                }
            }).catch(err => {
                reject(err);
            });
        });
        return updateOneToManyPromise;
    }
    queryToPromise(query, values) {
        let result = new Promise((resolve, reject) => {
            if (query == "") {
                resolve([]);
            }
            this.connection.query(query, values, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
        return result;
    }
    getDbValueText(mappingType, value, raw) {
        if (value == undefined || value == null) {
            return null;
        }
        if (mappingType == reflection_1.MappingType.string) {
            return raw ? `${value}` : `'${value}'`;
        }
        else if (mappingType == reflection_1.MappingType.date) {
            return raw ? `${this.toMysqlFormat(value)}` : `'${this.toMysqlFormat(value)}'`;
        }
        else if (mappingType == reflection_1.MappingType.number) {
            return value;
        }
        else if (mappingType == reflection_1.MappingType.boolean) {
            return value;
        }
        return '';
    }
    /**
     * …and then create the method to output the date string as desired.
     * Some people hate using prototypes this way, but if you are going
     * to apply this to more than one Date object, having it as a prototype
     * makes sense.
     **/
    toMysqlFormat(date) {
        return date.getUTCFullYear() + "-" + models_1.twoDigits(1 + date.getUTCMonth()) + "-" + models_1.twoDigits(date.getUTCDate());
    }
    ;
    close() {
        if (!this.connection)
            return;
        this.connection.end();
        this.connection = undefined;
    }
    queryValuePromise(options, values) {
        let promise = new Promise((resolve, reject) => {
            this.connection.query(options, values, (err, result) => {
                resolve({ err, result });
            });
        });
        return promise;
    }
    static getContext(tenant) {
        let getContextPromise = new Promise((resolve, reject) => {
            let newContext = new DbContext();
            connection_1.default.getConnection(tenant).then((connection) => {
                newContext.connection = connection;
                resolve(newContext);
            }).catch((err) => {
                reject(err);
            });
        });
        return getContextPromise;
    }
}
exports.DbContext = DbContext;
//# sourceMappingURL=database.js.map