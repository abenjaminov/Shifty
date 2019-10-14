import dbConnection from './connection';
import { Connection, QueryOptions, Query } from 'mysql';
import { TypesHelper, twoDigits } from '../models/models';
import { ReflectionHelper, IOneToManyMapping, ISimpleMapping, MappingType, IOneToManyDbMapping, IMappedPropertiesMetaData, InterfaceDescriminator, IOneToOneMapping } from '../models/reflection';
import { stringify } from 'querystring';
import { LogService } from '../services/logs.service';

interface IConstructor {
    [key:string] : any;
    new (...args: any[]) : any
}

// dataFilters[0] And dataFilters[1] And dataFilters[2]
export interface IFilterStatement {
    dataFilters: IDataFilter[];
}

export interface IDataFilter {
    property:string;
    value: any;
}

export interface DeepType {
    typeName: string;
    typeAlias: string;
    keyDbColumn: string;
    jsonProperty:string,
    oneToOneMappings: Array<IOneToOneMapping>;
    oneToManyMappings: Array<IOneToManyMapping>;
}

export class DbContext {
    
    connection!: Connection;
    logService: LogService;

    constructor() {
        this.select.bind(this);

        this.logService = new LogService("Databse Context");
    }

    async select<T>(type: IConstructor, 
        withForeignData: boolean = true,
        deepSelect: boolean = false, 
        filters: IFilterStatement[] = []): Promise<Array<T>> {

        let selectPromise = new Promise<Array<T>>((resolve, reject) => {
            let mappedProperties = ReflectionHelper.getMappedProperties(type);
            let tableName = ReflectionHelper.getTableName(type);

            let foreignData = Reflect.ownKeys(mappedProperties).map(x => mappedProperties[x.toString()]);
            
            let primaryDbKey:string = foreignData.find(x => x.isPrimaryKey).dbColumnName;

            if(!primaryDbKey) {
                // TODO : Log
                console.error("General : Type does not have a primary key")
                reject("Context.Select -> No Primary key found for " + tableName);
            }

            let oneToManyMappings: IOneToManyMapping[] = foreignData.filter(x => x.descriminator == InterfaceDescriminator.IOneToManyMapping);            
            let oneToOneMappings: IOneToOneMapping[] = foreignData.filter(x => x.descriminator == InterfaceDescriminator.IOneToOneMapping);

            let join = "";
            let select: Array<string> = [];

            if(withForeignData) {
                var typeToDeepTypes: Map<string, DeepType> = new Map<string, DeepType>();

                // Build the join statements
                join += this.applyOneToManyMappings(type,"Z", primaryDbKey, select, typeToDeepTypes);

                join += this.applyOneToOneMappings(type,"Z", select, typeToDeepTypes);

                if(deepSelect) {
                    typeToDeepTypes.forEach((type, key) => {
                        let currentType = TypesHelper.typesMapping[type.typeName];
                        let joinMany = this.applyOneToManyMappings(currentType, type.typeAlias, type.keyDbColumn, select, new Map<string, DeepType>());
                        let joinType = this.applyOneToOneMappings(currentType,type.typeAlias, select,new Map<string, DeepType>());

                        let oneToOneDeepMapping = ReflectionHelper.getMappingsByType(currentType, InterfaceDescriminator.IOneToOneMapping);
                        let oneToManyDeepMapping = ReflectionHelper.getMappingsByType(currentType, InterfaceDescriminator.IOneToManyMapping);

                        type.oneToOneMappings.push(...oneToOneDeepMapping);
                        type.oneToManyMappings.push(...oneToManyDeepMapping);

                        join += joinMany;
                        join += joinType;
                    });
                }
            }

            let simpleMappedProperties = ReflectionHelper.getSimpleMappedProperties(type);

            let where = '';

            for(let i = 0; i < filters.length; i++) {
                let orFilter = filters[i].dataFilters;

                for(let j = 0; j < orFilter.length; j++) {
                    let andFilter = orFilter[j];

                    let simpleProp = simpleMappedProperties[andFilter.property];
                    let dbValueText = this.connection.escape(this.getDbValueText(simpleProp.type, andFilter.value, true));

                    where += `Z.${simpleProp.dbColumnName} = ${dbValueText}${j < orFilter.length - 1 ? ' AND ' : ''}`;
                }

                where += i < filters.length - 1 ? " OR " : "" ;
            }

            let query = `SELECT Z.*${select.length > 0 ? ',' : ''} ${select.join(",")} FROM ${tableName} Z ${join} WHERE ${where == '' ? '1 = 1' : where}`;

            this.connection.query(query, (err: any, result: Array<T>, fields: any) => {
                if(err) {
                    // TODO : Log
                    reject(err);
                }

                let distinctResult = this.distinctResult(mappedProperties, primaryDbKey, result);

                for(let foreignMap of oneToManyMappings) { 
                    let items = foreignMap.toItemsMap(distinctResult.map(x => x[primaryDbKey]), result);
                    distinctResult.forEach(resItem => {
                        let thisItems = items.get(resItem[primaryDbKey]);

                        (resItem as any)[foreignMap.jsonProperty] = thisItems;
                    })
                }

                for(let oneToOneMapping of oneToOneMappings) {
                    let itemMap = oneToOneMapping.toItemMap(distinctResult.map(x => x[primaryDbKey]), result);
                    distinctResult.forEach(resItem => {
                        let thisItem = itemMap.get(resItem[primaryDbKey]);

                        (resItem as any)[oneToOneMapping.jsonProperty] = thisItem;
                    })
                }
                
                if(withForeignData && deepSelect) {
                    // TODO : Map one to many
                    typeToDeepTypes.forEach((deepType, key) => {
                        for(let oneToOneMapping of deepType.oneToOneMappings) {
                            let objects = distinctResult.map(dr => dr[deepType.jsonProperty]);
                            if(objects.length > 0) {
                                let ids: any[];
                                if(Array.isArray(objects[0])) {
                                    ids = objects.map(value => value.map((innerValues: any) => innerValues[deepType.keyDbColumn])).reduce((total: any[], o) => total.concat(o));    
                                }
                                else {
                                    ids = objects.map(x => x[deepType.keyDbColumn]);        
                                }

                                let itemMap = oneToOneMapping.toItemMap(ids, result, deepType.typeAlias);

                                objects.forEach((resItem: any) => {
                                    if(Array.isArray(resItem)) {
                                        resItem.forEach((innerResItem: any) => {
                                            let thisItem = itemMap.get(innerResItem[`${deepType.keyDbColumn}`]);
            
                                            (innerResItem as any)[oneToOneMapping.jsonProperty] = thisItem;
                                        })
                                    }
                                    else {
                                        let thisItem = itemMap.get(resItem[`${deepType.typeAlias}_${deepType.keyDbColumn}`]);
            
                                        (resItem as any)[oneToOneMapping.jsonProperty] = thisItem;
                                    }
                                })
                            }
                        }
                    });
                }

                resolve(distinctResult);
            });
        });
    
        return selectPromise;
    }

    private applyOneToOneMappings(type: Function,mainAlias: string, select: string[], deepTypes: Map<string, DeepType>) {
        let join = "";
        let oneToOneMappings: Array<IOneToOneMapping> = ReflectionHelper.getMappingsByType(type, InterfaceDescriminator.IOneToOneMapping);

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

    private applyOneToManyMappings(type: Function, mainAlias: string, primaryDbKey: string, select: Array<string>,deepTypes: Map<string, DeepType>) {
        let oneToManyMappings: Array<IOneToManyMapping> = ReflectionHelper.getMappingsByType(type, InterfaceDescriminator.IOneToManyMapping);

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

    distinctResult(mappedProperties: IMappedPropertiesMetaData, primaryKey: string, result: any) {
        let ownKeys = Reflect.ownKeys(mappedProperties);
        let regularPropertyKeys = ownKeys.filter((x:any) => mappedProperties[x].descriminator == InterfaceDescriminator.ISimpleMapping);

        let items: any[] = Array.from(new Set(result.map((x:any) => x[primaryKey]))).map((pKey:any) => {
            let resItem = result.find((x:any) => x[primaryKey] == pKey);
            let mappedItem:any = {};
            
            for(let regularPropKey of regularPropertyKeys) {
                let prop = mappedProperties[regularPropKey.toString()].dbColumnName;

                mappedItem[regularPropKey] = resItem[prop];
            }

            return mappedItem;
        });

        return items;
    }

    async insert<T>(type: IConstructor, items: any[]): Promise<Array<T>> {
        if(items.length == 0) { return [] }
        let table = ReflectionHelper.getTableName(type);
        
        let values: any[] = [];

        let simpleMappedProps = ReflectionHelper.getSimpleMappedProperties(type);

        let dbProperties:string[] = [];
        
        for(let prop of Reflect.ownKeys(simpleMappedProps)) {
            if(!simpleMappedProps[prop.toString()].isPrimaryKey) {
                dbProperties.push(simpleMappedProps[prop.toString()].dbColumnName);
            }
        }

        for(let item of items) {
            values.push([]);
            let primaryProp = Reflect.ownKeys(simpleMappedProps).find(smp => simpleMappedProps[smp.toString()].isPrimaryKey).toString();

            if(item[primaryProp] != undefined) {
                await this.update(type, item,true);
            }

            for(let prop of Reflect.ownKeys(simpleMappedProps)) {
                let mappedProp = simpleMappedProps[prop.toString()];
                if(!mappedProp.isPrimaryKey) {
                    values[values.length - 1].push(item[prop] != undefined ? this.getDbValueText(mappedProp.type, item[prop], true) : null);
                }
            }
        }

        let query = "INSERT INTO " + table + "(" + dbProperties.join(",") + ") VALUES ?";

        let result = await this.queryToPromise(query,[values]);

        return result;
    }

    async updateOrInsert<T extends IConstructor>(type: T, items:Array<any>) {
        let table = ReflectionHelper.getTableName(type);

        let itemsToInsert: Array<any> = [];
        let values: any[] = [];

        let simpleMappedProps = ReflectionHelper.getSimpleMappedProperties(type);

        let updateCommands = [];

        let primaryProp = Reflect.ownKeys(simpleMappedProps).find(smp => simpleMappedProps[smp.toString()].isPrimaryKey).toString();

        if(items.length > 0) {
            for(let item of items) {
                values.push([]);
                if(item[primaryProp] != undefined) {
                    let updateQuery = await this.update(type, item, false);
                    updateCommands.push(updateQuery);
                }
                else {
                    itemsToInsert.push(item);
                }
            }
    
            let promises: Promise<any>[] = [this.queryToPromise(updateCommands.join(' ')), this.insert(type, itemsToInsert)];
    
            await Promise.all(promises)
        }

        return "No Items";
    }

    async update<T extends IConstructor>(type: T, item: any, execute?:boolean): Promise<string> {
            let table = ReflectionHelper.getTableName(type);

            let simpleMappedProps = ReflectionHelper.getSimpleMappedProperties(type);

            let set = [];
            let where = "";
            
            for(let prop of Reflect.ownKeys(simpleMappedProps)) {
                let simpleProp: ISimpleMapping = simpleMappedProps[prop.toString()];

                let dbValueText = this.getDbValueText(simpleProp.type, item[prop]);

                if(simpleProp.isPrimaryKey) {
                    where = `${simpleProp.dbColumnName} = ${dbValueText}`;
                }
                else {
                    set.push(`${simpleProp.dbColumnName} = ${dbValueText}`);
                }
            }

            let query = `UPDATE ${table} SET ${set.join(',')} WHERE ${where};`;

            if(!execute) {
                return query;
            }
            else {
                let result = await this.queryToPromise(query);

                return result;
            }
    }

    async deleteConnections<T extends IConstructor>(type: T, connProp:string, connValue:any, valuesToKeep?: any[]) {
        let simpleMappedProps = ReflectionHelper.getSimpleMappedProperties(type);
        let tableName = ReflectionHelper.getTableName(type);

        let connectionKeyMapping: ISimpleMapping = simpleMappedProps[connProp];
        let typeText = this.getDbValueText(connectionKeyMapping.type, connValue);
        let deleteQuery = `DELETE FROM ${tableName} WHERE ${connectionKeyMapping.dbColumnName} = ${typeText}`;

        if(valuesToKeep && valuesToKeep.length > 0) {
            let primaryJsonKey = Reflect.ownKeys(simpleMappedProps).find(x => simpleMappedProps[x.toString()].isPrimaryKey);
            primaryJsonKey = primaryJsonKey.toString();

            let primaryKeyMapping: ISimpleMapping = simpleMappedProps[primaryJsonKey];

            let valuesToKeepQueryAddition = [];

            for(let valueToKeep of valuesToKeep) {
                let addition = `${primaryKeyMapping.dbColumnName} <> ${this.getDbValueText(primaryKeyMapping.type, valueToKeep)}`
                valuesToKeepQueryAddition.push(addition);
            }

            deleteQuery += ` AND ${valuesToKeepQueryAddition.join(' AND ')}`;
        }

        await this.queryToPromise(deleteQuery);
    }

    deleteSimple<T extends IConstructor>(type: T, keyValue: any): Promise<T> {
        let deletePromise = new Promise<T>((resolve, reject) => {
            let simpleMappedProps = ReflectionHelper.getSimpleMappedProperties(type);

            let primaryJsonKey = Reflect.ownKeys(simpleMappedProps).find(x => simpleMappedProps[x.toString()].isPrimaryKey) || '';
            primaryJsonKey = primaryJsonKey.toString();

            let tableName = ReflectionHelper.getTableName(type);

            let primaryKeyMapping: ISimpleMapping = simpleMappedProps[primaryJsonKey];

            let typeText = this.getDbValueText(primaryKeyMapping.type, keyValue);
            let deleteQuery = `DELETE FROM ${tableName} WHERE ${primaryKeyMapping.dbColumnName} = ${typeText}`;

            this.connection.query(deleteQuery, (err,result) => {
                if(err) reject(err);

                resolve(result);
            });
        })

        return deletePromise;
    }

    updateOneToManyMappings<T extends IConstructor>(type: T, item: T): Promise<T> {
        let updateOneToManyPromise = new Promise<T>((resolve, reject) => {
            let oneToManyPropMappings = ReflectionHelper.getOneToManyMappedProperties(type);
            let simpleMappedProps = ReflectionHelper.getSimpleMappedProperties(type);
            
            let mainPrimaryJsonKey = Reflect.ownKeys(simpleMappedProps).find(x => simpleMappedProps[x.toString()].isPrimaryKey) || '';
            mainPrimaryJsonKey = mainPrimaryJsonKey.toString();

            // Build delete from connection table
            // --> Delete ProfilesProfessions (connTable) WHERE ProfileId (connToMainProp) = typetoText(item[primaryKey])
            let ownKeys = Reflect.ownKeys(oneToManyPropMappings).filter(ownKey => oneToManyPropMappings[ownKey.toString()].db.connTable != oneToManyPropMappings[ownKey.toString()].db.sourceTable);

            let mainPrimaryKeyMapping: ISimpleMapping = simpleMappedProps[mainPrimaryJsonKey];

            let deletePromises = [];

            for(let key of ownKeys) {
                let oneToManyMapping: IOneToManyDbMapping = oneToManyPropMappings[key.toString()].db;

                let typeText = this.getDbValueText(mainPrimaryKeyMapping.type, item[mainPrimaryJsonKey]);
                let deleteQuery = `DELETE FROM ${oneToManyMapping.connTable} WHERE ${oneToManyMapping.connToMainProp} = ${typeText}`;

                deletePromises.push(this.queryToPromise(deleteQuery));
            }

            // Execute delete
            Promise.all(deletePromises).then((result) => {
                // Build insert connection table
                // INSERT INTO ProfilesProfessions (connTable) VALUES(ProfileId [primaryKey value text], ProfessionId [primary key value text])

                let insertsRemaining = 0;

                for(let key of ownKeys) {
                    let insert = "";
                    let oneToManyMapping: IOneToManyMapping = oneToManyPropMappings[key.toString()];
                    insert += `INSERT INTO ${oneToManyMapping.db.connTable} (${oneToManyMapping.db.connToMainProp}, ${oneToManyMapping.db.connToSourceProp}) VALUES ?`;

                    let oneToManyMapValues: any[] = item[key.toString()];

                    // oneToManyMapping.sourceType
                    let sourceType = TypesHelper.typesMapping[oneToManyMapping.sourceType];
                    
                    let simpleSourceTypeMappings = ReflectionHelper.getSimpleMappedProperties(sourceType);
                    let sourcePrimaryJsonKey = Reflect.ownKeys(simpleSourceTypeMappings).find(x => simpleSourceTypeMappings[x.toString()].isPrimaryKey) || '';
                    let sourcePrimaryKeyMapping: ISimpleMapping = simpleSourceTypeMappings[sourcePrimaryJsonKey.toString()]

                    let values = [];

                    for(let value of oneToManyMapValues) {
                        let mainValue = item[mainPrimaryJsonKey.toString()];
                        let sourceValue = value[sourcePrimaryJsonKey];
                        values.push([mainValue, sourceValue]);
                    }
                    insertsRemaining++;

                    this.connection.query(insert,[values], (err,result) => {
                        insertsRemaining--;

                        if(err) reject(err);

                        if(insertsRemaining == 0) {
                            resolve()
                        }
                    });
                }
            }).catch(err => {
                reject(err);
            })
        });

        return updateOneToManyPromise;
    }

    queryToPromise(query: string, values? : any): Promise<any> {
        let result = new Promise<any>((resolve, reject) => {
            if(query == "") { resolve([]) }

            this.connection.query(query,values, (err, result) => {
                if(err) reject(err);

                resolve(result);
            })
        })

        return result;
    }

    getDbValueText(mappingType: MappingType, value: any, raw?: boolean): string {
        if(value == undefined || value == null) {
            return null;
        }
        
        if(mappingType == MappingType.string) {
            return raw ? `${value}` : `'${value}'`;
        }
        else if (mappingType == MappingType.date) {
            return raw ? `${this.toMysqlFormat(value)}` : `'${this.toMysqlFormat(value)}'`;
        }
        else if(mappingType == MappingType.number) {
            return value;
        }
        else if(mappingType == MappingType.boolean) {
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
    toMysqlFormat(date: Date) {
        return date.getUTCFullYear() + "-" + twoDigits(1 + date.getUTCMonth()) + "-" + twoDigits(date.getUTCDate());
    };

    close() {
        if(!this.connection) return;

        this.connection.end();
        this.connection = undefined;
    }

    queryValuePromise(options: string, values: any): Promise<any> {
        let promise = new Promise<any>((resolve, reject) => {
            this.connection.query(options,values, (err, result) => {
                resolve({err, result});
            })
        })

        return promise;
    }

    static getContext(tenant: string): Promise<DbContext> {
        let getContextPromise = new Promise<DbContext>((resolve,reject) => {
            let newContext: DbContext = new DbContext();
    
            dbConnection.getConnection(tenant).then((connection : Connection) => {
                newContext.connection = connection;
                
                resolve(newContext);
            }).catch((err: string) => {
                reject(err);
            })
        })
        
        return getContextPromise;
    }
}