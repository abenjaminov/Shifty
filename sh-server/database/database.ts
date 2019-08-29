import dbConnection from './connection';
import { Connection, QueryOptions } from 'mysql';
import { TypesHelper } from '../models/models';
import { ReflectionHelper, IOneToManyMapping, IMapping, MappingType, IOneToManyDbMapping, IMappedPropertiesMetaData } from '../models/reflection';

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

export class DbContext {
    
    connection!: Connection;

    constructor() {
        this.select.bind(this);
    }

    async select<T>(type: IConstructor, 
        withForeignData: boolean = true, 
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

            var foreignDbData: IOneToManyMapping[] = foreignData.filter(x => x.property);

            var join = "";
            var select = [];
            if(withForeignData) {
                // Build the join statements
                for(let foreignMap of foreignDbData) {
                    var dbConf = foreignMap.db;
                    var connTableAlias = dbConf.connAlias;

                    var joinWithMain = `LEFT JOIN ${dbConf.connTable} ${connTableAlias} ON ${connTableAlias}.${dbConf.connToMainProp}
                                        = Z.${primaryDbKey}`;
                    select.push(`${connTableAlias}.${dbConf.connToMainProp} as ${connTableAlias}_${dbConf.connToMainProp}`);

                    var sourceTableAlias = dbConf.sourceAlias;

                    var joinSourceToCon = `LEFT JOIN ${dbConf.sourceTable} ${sourceTableAlias} ON ${sourceTableAlias}.${dbConf.sourceProp}
                                        = ${connTableAlias}.${dbConf.connToSourceProp}`;
                    
                    select.push(`${sourceTableAlias}.${dbConf.sourceProp} as ${sourceTableAlias}_${dbConf.sourceProp}`);
                    select.push(`${connTableAlias}.${dbConf.connToSourceProp} as ${connTableAlias}_${dbConf.connToSourceProp}`);

                    for(let col of dbConf.sourceAdditionalData) {
                        select.push(`${sourceTableAlias}.${col} as ${sourceTableAlias}_${col}`);
                    }

                    join += " " + joinWithMain + " " + joinSourceToCon;
                }
            }

            var simpleMappedProperties = ReflectionHelper.getSimpleMappedProperties(type);

            var where = '';

            for(let i = 0; i < filters.length; i++) {
                var orFilter = filters[i].dataFilters;

                for(let j = 0; j < orFilter.length; j++) {
                    var andFilter = orFilter[j];

                    var simpleProp = simpleMappedProperties[andFilter.property];
                    var dbValueText = this.getDbValueText(simpleProp.type, andFilter.value);

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

                for(let foreignMap of foreignDbData) { 
                    var items = foreignMap.toItemsMap(distinctResult.map(x => x[primaryDbKey]), result);
                    distinctResult.forEach(resItem => {
                        var thisItems = items.get(resItem[primaryDbKey]);

                        (resItem as any)[foreignMap.property] = thisItems;
                    })
                }
                
                resolve(distinctResult);
            });
        });
    
        return selectPromise;
    }

    distinctResult(mappedProperties: IMappedPropertiesMetaData, primaryKey: string, result: any) {
        var ownKeys = Reflect.ownKeys(mappedProperties);
        var regularPropertyKeys = ownKeys.filter((x:any) => mappedProperties[x].dbColumnName);

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
            dbProperties.push(simpleMappedProps[prop.toString()].dbColumnName);
        }

        for(let item of items) {
            for(let prop of Reflect.ownKeys(simpleMappedProps)) {
                values.push([]);
    
                if(!simpleMappedProps[prop.toString()].isPrimaryKey) {
                    values[values.length - 1].push(item[prop] ? item[prop].toString() : null);
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
                var simpleProp: IMapping = simpleMappedProps[prop.toString()];

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

            var primaryKeyMapping: IMapping = simpleMappedProps[primaryJsonKey];

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

            var mainPrimaryKeyMapping: IMapping = simpleMappedProps[mainPrimaryJsonKey];

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
                    var sourcePrimaryKeyMapping: IMapping = simpleSourceTypeMappings[sourcePrimaryJsonKey.toString()]

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
        if(mappingType == MappingType.string || mappingType == MappingType.date) {
            return`'${value}'`
        }
        else if(mappingType == MappingType.number) {
            return `${value}`
        }

        return '';
    }

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