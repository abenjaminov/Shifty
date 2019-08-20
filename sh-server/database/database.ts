import dbConnection from './connection';
import { Connection } from 'mysql';

export class DbContext {
    
    connection!: Connection;

    constructor() {
        this.select.bind(this);
    }

    select(table: string, query:string) {
        var selectPromise = new Promise((resolve, reject) => {
            this.connection.query(query, (err: any, result: any, fields: any) => {
    
            })
        });
    
        return selectPromise;
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