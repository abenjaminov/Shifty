import dbConnection from './connection';
import { Connection, QueryOptions } from 'mysql';

import 'reflect-metadata';

type IConstructor = new (...args: any[]) => any;

type IForeignMapping = {
    destType: string;
    destProp: string;
}

export class DbContext {
    
    connection!: Connection;

    constructor() {
        this.select.bind(this);
    }

    select<T extends IConstructor>(type: T, withForeignData: boolean = false): Promise<Array<T>> {
        var mappedProperties = ReflectionHelper.getMappedProperties(type);
        var tableName = ReflectionHelper.getTableName(type);

        var foreignData = Reflect.ownKeys(mappedProperties).map(x => mappedProperties[x.toString()]);
        
        var primaryKey:string = foreignData.find(x => x.startsWith("P")).split(";")[1];

        var foreignDbData = foreignData.filter(x => typeof x === 'object');

        var char = 65;
        var join = "";
        var select = [];

        for(let foreignMap of foreignDbData) {
            var dbConf = foreignMap.db;
            var connTableAlias = dbConf.connAlias;

            var joinWithMain = `LEFT JOIN ${dbConf.connTable} ${connTableAlias} ON ${connTableAlias}.${dbConf.connToMainProp}
                                = Z.${primaryKey}`;
            select.push(`${connTableAlias}.${dbConf.connToMainProp} as ${connTableAlias}_${dbConf.connToMainProp}`);

            char++;
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

        var query = `SELECT Z.*${select.length > 0 ? ',' : ''} ${select.join(",")} FROM ${tableName} Z ${join}`;

        var selectPromise = new Promise<Array<T>>((resolve, reject) => {
            this.connection.query(query, (err: any, result: Array<T>, fields: any) => {
                var distinctResult = this.distinctResult(mappedProperties, primaryKey, result);

                for(let foreignMap of foreignDbData) { 
                    var items = foreignMap.toItemsMap(distinctResult.map(x => x[primaryKey]), result);
                    distinctResult.forEach(resItem => {
                        var thisItems = items.get(resItem[primaryKey]);

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
        var regularPropertyKeys = ownKeys.filter((x:any) => typeof mappedProperties[x] === 'string');

        var items: any[] = Array.from(new Set(result.map((x:any) => x[primaryKey]))).map((pKey:any) => {
            var resItem = result.find((x:any) => x[primaryKey] == pKey);
            var mappedItem:any = {};
            
            for(let regularPropKey of regularPropertyKeys) {
                var prop = mappedProperties[regularPropKey.toString()].split(";")[1];

                mappedItem[regularPropKey] = resItem[prop];
            }

            return mappedItem;
        });

        return items;
    }

    insert<T extends IConstructor>(type: T, item: any): Promise<Array<T>> {
        var table = ReflectionHelper.getTableName(type);

        var mappedProperties = ReflectionHelper.getMappedProperties(type);

        var params: string[] = [];
        var dbProperties:string[] = [];
        
        for(let prop of Reflect.ownKeys(mappedProperties)) {
            params.push(item[prop].toString());
            dbProperties.push(mappedProperties[prop.toString()]);
        }

        var query = "INSERT INTO " + table + "(" + dbProperties.join(",") + ") VALUES ?";
        
        var insertPromise = new Promise<Array<T>>((resolve, reject) => {
            this.connection.query(query, [params], (err: any, result: any, fields: any) => {
                resolve(result);
            });
        });
    
        return insertPromise;
    }

    close() {
        if(!this.connection) return;

        this.connection.end();
    }

    static getContext(): Promise<DbContext> {
        var getContextPromise = new Promise<DbContext>((resolve,reject) => {
            var newContext: DbContext = new DbContext();
    
            dbConnection.getConnection().then((connection : Connection) => {
                newContext.connection = connection;
                
                resolve(newContext);
            }).catch((err: string) => {
                reject(err);
            })
        })
        
        return getContextPromise;
    }
}

interface IMappedPropertiesMetaData {
    [jsonPropName: string] : any
}

export class ReflectionHelper {
    static PROPERTY_METADATA_KEY = Symbol("propertyMetadata");
    static TYPE_META_KEY = Symbol("typeMetadata");

    static getMappedProperties(type: Function): IMappedPropertiesMetaData {
        var mappedProperties = Reflect.getMetadata(ReflectionHelper.PROPERTY_METADATA_KEY, type.prototype);

        return mappedProperties;
    }

    static getTableName(type: Function): string {
        var typeMetaData = Reflect.getMetadata(ReflectionHelper.TYPE_META_KEY, type);

        return typeMetaData.table;
    }
}

export function Table(tableName: string) {
    return (target:any) => {
        // Pull the existing metadata or create an empty object
        const allMetadata = (
            Reflect.getMetadata(ReflectionHelper.TYPE_META_KEY, target)
            ||
            {}
        );
        
        allMetadata["table"] = tableName;

        // Update the metadata
        Reflect.defineMetadata(
            ReflectionHelper.TYPE_META_KEY,
            allMetadata,
            target,
        );
    }
}

export function Mapped(dbColumnName: string | any) {
    return (target: any, propertyKey: string | symbol) => {
        // Pull the existing metadata or create an empty object
        const allMetadata = (
            Reflect.getMetadata(ReflectionHelper.PROPERTY_METADATA_KEY, target)
            ||
            {}
        );
        
        allMetadata[propertyKey] = dbColumnName;

        // Update the metadata
        Reflect.defineMetadata(
            ReflectionHelper.PROPERTY_METADATA_KEY,
            allMetadata,
            target,
        );
    }
}