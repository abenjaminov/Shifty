import mySql, { Connection, MysqlError } from 'mysql';
import fs from 'fs';

var getConnection = (tenant:string) => {
    var createConnectionPromise = new Promise<Connection> ((resolve, reject) => {
        console.log(__dirname);
        var connection: Connection = mySql.createConnection({
            multipleStatements: true,
            host: '35.246.240.151',
            user: 'root',
            password: 'X7yikbxgckx1',
            database: tenant,
            ssl: {
                ca: fs.readFileSync(__dirname + '/certificates/server-ca.pem'),
                key: fs.readFileSync(__dirname + '/certificates/client-key.pem'),
                cert: fs.readFileSync(__dirname + '/certificates/client-cert.pem')
            }
        });
        
        connection.connect((err: MysqlError, ...args: any[]) => {
            if(err) reject(err);
            
            resolve(connection);
        })
    });

    return createConnectionPromise;
}

export default { getConnection }