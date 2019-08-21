import dbConnection from './connection';
import { Connection, QueryOptions } from 'mysql';

import 'reflect-metadata';

type IConstructor = new (...args: any[])=> any;

export class DbContext {
    
    connection!: Connection;

    constructor() {
        this.select.bind(this);
    }

    select<T extends IConstructor>(query:string, withForeignData?: boolean): Promise<Array<T>> {
        var selectPromise = new Promise<Array<T>>((resolve, reject) => {
            this.connection.query(query, (err: any, result: Array<T>, fields: any) => {
                resolve(result);
            });
        });
    
        return selectPromise;
    }

    insert<T extends IConstructor>(type: T, table: string, item: any): Promise<Array<T>> {
        
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
    [jsonPropName: string] : string
}

export class ReflectionHelper {
    static PROPERTY_METADATA_KEY = Symbol("propertyMetadata");

    static getMappedProperties(type: Function): IMappedPropertiesMetaData {
        var mappedProperties = Reflect.getMetadata(ReflectionHelper.PROPERTY_METADATA_KEY, type.prototype);

        return mappedProperties;
    }
}

export function Mapped(dbColumnName: string) {
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