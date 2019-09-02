import dbConnection from './connection';
import { Connection, QueryOptions } from 'mysql';
import { TypesHelper, twoDigits } from '../models/models';
import { ReflectionHelper, IOneToManyMapping, ISimpleMapping, MappingType, IOneToManyDbMapping, IMappedPropertiesMetaData, InterfaceDescriminator, IOneToOneMapping } from '../models/reflection';

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

    constructor() {
        this.select.bind(this);
    }

    async select<T>(type: IConstructor, 
        withForeignData: boolean = true,
        deepSelect: boolean = false, 
        filters: IFilterStatement[] = []): Promise<Array<T>> {

        var selectPromise = new Promise<Array<T>>((resolve, reject) => {
            var mappedProperties = ReflectionHelper.getMappedProperties(type);
            var tableName = ReflectionHelper.getTableName(type);

            var foreignData = Reflect.ownKeys(mappedProperties).map(x => mappedProperties[x.toString()]);
            
            var primaryDbKey:string = foreignData.find(x => x.isPrimaryKey).dbColumnName;

            if(!primaryDbKey) {
                // TODO : Log
                console.error("General : Type does not have a primary key")
                reject("Context.Select -> No Primary key found for " + tableName);
            }

            var oneToManyMappings: IOneToManyMapping[] = foreignData.filter(x => x.descriminator == InterfaceDescriminator.IOneToManyMapping);            
            var oneToOneMappings: IOneToOneMapping[] = foreignData.filter(x => x.descriminator == InterfaceDescriminator.IOneToOneMapping);

            var join = "";
            var select: Array<string> = [];

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

            var simpleMappedProperties = ReflectionHelper.getSimpleMappedProperties(type);

            var where = '';

            for(let i = 0; i < filters.length; i++) {
                var orFilter = filters[i].dataFilters;

                for(let j = 0; j < orFilter.length; j++) {
                    var andFilter = orFilter[j];

                    var simpleProp = simpleMappedProperties[andFilter.property];
                    var dbValueText = this.connection.escape(this.getDbValueText(simpleProp.type, andFilter.value));

                    where += `Z.${simpleProp.dbColumnName} = ${dbValueText}${j < orFilter.length - 1 ? ' AND ' : ''}`;
                }

                where += i < filters.length - 1 ? " OR " : "" ;
            }

            var query = `SELECT Z.*${select.length > 0 ? ',' : ''} ${select.join(",")} FROM ${tableName} Z ${join} WHERE ${where == '' ? '1 = 1' : where}`;

            this.connection.query(query, (err: any, result: Array<T>, fields: any) => {
                if(err) {
                    // TODO : Log
                    reject(err);
                }

                var distinctResult = this.distinctResult(mappedProperties, primaryDbKey, result);

                for(let foreignMap of oneToManyMappings) { 
                    var items = foreignMap.toItemsMap(distinctResult.map(x => x[primaryDbKey]), result);
                    distinctResult.forEach(resItem => {
                        var thisItems = items.get(resItem[primaryDbKey]);

                        (resItem as any)[foreignMap.jsonProperty] = thisItems;
                    })
                }

                for(let oneToOneMapping of oneToOneMappings) {
                    var itemMap = oneToOneMapping.toItemMap(distinctResult.map(x => x[primaryDbKey]), result);
                    distinctResult.forEach(resItem => {
                        var thisItem = itemMap.get(resItem[primaryDbKey]);

                        (resItem as any)[oneToOneMapping.jsonProperty] = thisItem;
                    })
                }
                
                if(withForeignData && deepSelect) {
                    // TODO : Map one to many
                    typeToDeepTypes.forEach((deepType, key) => {
                        for(let oneToOneMapping of deepType.oneToOneMappings) {
                            let objects = distinctResult.map(dr => dr[deepType.jsonProperty]);
                            if(objects.length > 0) {
                                var ids: any[];
                                if(Array.isArray(objects[0])) {
                                    ids = objects.map(value => value.map((innerValues: any) => innerValues[deepType.keyDbColumn])).reduce((total: any[], o) => total.concat(o));    
                                }
                                else {
                                    ids = objects.map(x => x[deepType.keyDbColumn]);        
                                }

                                var itemMap = oneToOneMapping.toItemMap(ids, result, deepType.typeAlias);

                                objects.forEach((resItem: any) => {
                                    if(Array.isArray(resItem)) {
                                        resItem.forEach((innerResItem: any) => {
                                            var thisItem = itemMap.get(innerResItem[`${deepType.keyDbColumn}`]);
            
                                            (innerResItem as any)[oneToOneMapping.jsonProperty] = thisItem;
                                        })
                                    }
                                    else {
                                        var thisItem = itemMap.get(resItem[`${deepType.typeAlias}_${deepType.keyDbColumn}`]);
            
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
        var ownKeys = Reflect.ownKeys(mappedProperties);
        var regularPropertyKeys = ownKeys.filter((x:any) => mappedProperties[x].descriminator == InterfaceDescriminator.ISimpleMapping);

        var items: any[] = Array.from(new Set(result.map((x:any) => x[primaryKey]))).map((pKey:any) => {
            var resItem = result.find((x:any) => x[primaryKey] == pKey);
            var mappedItem:any = {};
            
            for(let regularPropKey of regularPropertyKeys) {
                var prop = mappedProperties[regularPropKey.toString()].dbColumnName;

                mappedItem[regularPropKey] = resItem[prop];
            }

            return mappedItem;
        });

        return items;
    }

    insert<T>(type: IConstructor, items: any[]): Promise<Array<T>> {
        var table = ReflectionHelper.getTableName(type);
        
        var values: any[] = [];

        var simpleMappedProps = ReflectionHelper.getSimpleMappedProperties(type);

        var params: string[] = [];
        var dbProperties:string[] = [];
        
        for(let prop of Reflect.ownKeys(simpleMappedProps)) {
            if(!simpleMappedProps[prop.toString()].isPrimaryKey) {
                dbProperties.push(simpleMappedProps[prop.toString()].dbColumnName);
            }
        }

        for(let item of items) {
            values.push([]);

            for(let prop of Reflect.ownKeys(simpleMappedProps)) {
                var mappedProp = simpleMappedProps[prop.toString()];
                if(!mappedProp.isPrimaryKey) {
                    values[values.length - 1].push(item[prop] ? this.getDbValueText(mappedProp.type, item[prop]) : null);
                }
            }
        }

        var query = "INSERT INTO " + table + "(" + dbProperties.join(",") + ") VALUES ?";
        
        var insertPromise = new Promise<Array<T>>((resolve, reject) => {
            this.connection.query(query, [values], (err: any, result: any, fields: any) => {
                if(err) reject(err);

                resolve(result);
            });
        });
    
        return insertPromise;
    }

    update<T extends IConstructor>(type: T, item: any): Promise<T> {
        var updatePromise = new Promise<T>((resolve, reject) => {
            var table = ReflectionHelper.getTableName(type);

            var simpleMappedProps = ReflectionHelper.getSimpleMappedProperties(type);

            var set = "";
            var where = "";
            
            for(let prop of Reflect.ownKeys(simpleMappedProps)) {
                var simpleProp: ISimpleMapping = simpleMappedProps[prop.toString()];

                var dbValueText = this.getDbValueText(simpleProp.type, item[prop]);

                where = `${simpleProp.dbColumnName} = ${dbValueText}`;
            }

            var query = `UPDATE ${table} SET ${set} WHERE ${where}`;
            this.connection.query(query, (err: any, result: any, fields: any) => {
                resolve(result);
            });
        });
    
        return updatePromise;
    }

    deleteSimple<T extends IConstructor>(type: T, keyValue: any): Promise<T> {
        var deletePromise = new Promise<T>((resolve, reject) => {
            var simpleMappedProps = ReflectionHelper.getSimpleMappedProperties(type);

            var primaryJsonKey = Reflect.ownKeys(simpleMappedProps).find(x => simpleMappedProps[x.toString()].isPrimaryKey) || '';
            primaryJsonKey = primaryJsonKey.toString();

            var tableName = ReflectionHelper.getTableName(type);

            var primaryKeyMapping: ISimpleMapping = simpleMappedProps[primaryJsonKey];

            var typeText = this.getDbValueText(primaryKeyMapping.type, keyValue);
            var deleteQuery = `DELETE FROM ${tableName} WHERE ${primaryKeyMapping.dbColumnName} = ${typeText}`;

            this.connection.query(deleteQuery, (err,result) => {
                if(err) reject(err);

                resolve(result);
            });
        })

        return deletePromise;
    }

    updateOneToManyMappings<T extends IConstructor>(type: T, item: T): Promise<T> {
        var updateOneToManyPromise = new Promise<T>((resolve, reject) => {
            var oneToManyPropMappings = ReflectionHelper.getOneToManyMappedProperties(type);
            var simpleMappedProps = ReflectionHelper.getSimpleMappedProperties(type);
            
            var mainPrimaryJsonKey = Reflect.ownKeys(simpleMappedProps).find(x => simpleMappedProps[x.toString()].isPrimaryKey) || '';
            mainPrimaryJsonKey = mainPrimaryJsonKey.toString();

            // Build delete from connection table
            // --> Delete ProfilesProfessions (connTable) WHERE ProfileId (connToMainProp) = typetoText(item[primaryKey])
            var ownKeys = Reflect.ownKeys(oneToManyPropMappings);
            var deleteQuery = "DELETE FROM ";

            var mainPrimaryKeyMapping: ISimpleMapping = simpleMappedProps[mainPrimaryJsonKey];

            for(let key of ownKeys) {
                var oneToManyMapping: IOneToManyDbMapping = oneToManyPropMappings[key.toString()].db;
                var typeText = this.getDbValueText(mainPrimaryKeyMapping.type, item[mainPrimaryJsonKey]);
                deleteQuery += `${oneToManyMapping.connTable} WHERE ${oneToManyMapping.connToMainProp} = ${typeText}`;
            }

            // Execute delete
            this.connection.query(deleteQuery, (err,result) => {
                if(err) reject(err);

                // Build insert connection table
                // INSERT INTO ProfilesProfessions (connTable) VALUES(ProfileId [primaryKey value text], ProfessionId [primary key value text])

                var insertsRemaining = 0;

                for(let key of ownKeys) {
                    var insert = "";
                    var oneToManyMapping: IOneToManyMapping = oneToManyPropMappings[key.toString()];
                    insert += `INSERT INTO ${oneToManyMapping.db.connTable} (${oneToManyMapping.db.connToMainProp}, ${oneToManyMapping.db.connToSourceProp}) VALUES ?`;

                    var oneToManyMapValues: any[] = item[key.toString()];

                    // oneToManyMapping.sourceType
                    var sourceType = TypesHelper.typesMapping[oneToManyMapping.sourceType];
                    
                    var simpleSourceTypeMappings = ReflectionHelper.getSimpleMappedProperties(sourceType);
                    var sourcePrimaryJsonKey = Reflect.ownKeys(simpleSourceTypeMappings).find(x => simpleSourceTypeMappings[x.toString()].isPrimaryKey) || '';
                    var sourcePrimaryKeyMapping: ISimpleMapping = simpleSourceTypeMappings[sourcePrimaryJsonKey.toString()]

                    var values = [];

                    for(let value of oneToManyMapValues) {
                        var mainValue = item[mainPrimaryJsonKey.toString()];
                        var sourceValue = value[sourcePrimaryJsonKey];
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
            })
        });

        return updateOneToManyPromise;
    }

    getDbValueText(mappingType: MappingType, value: any): string {
        if(mappingType == MappingType.string) {
            return `${value}`;
        }
        else if (mappingType == MappingType.date) {
            return `${this.toMysqlFormat(value)}`;
        }
        else if(mappingType == MappingType.number) {
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
    }

    queryValuePromise(options: string, values: any): Promise<any> {
        var promise = new Promise<any>((resolve, reject) => {
            this.connection.query(options,values, (err, result) => {
                resolve({err, result});
            })
        })

        return promise;
    }

    queryPromise(options: string): Promise<any> {
        var promise = new Promise<any>((resolve, reject) => {
            this.connection.query(options, (err, result) => {
                resolve({err, result});
            })
        })

        return promise;
    }

    static getContext(tenant: string): Promise<DbContext> {
        var getContextPromise = new Promise<DbContext>((resolve,reject) => {
            var newContext: DbContext = new DbContext();
    
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