import mySql, { Connection, MysqlError } from 'mysql';

var getConnection = (tenant:string) => {
    var createConnectionPromise = new Promise<Connection> ((resolve, reject) => {
        var connection: Connection = mySql.createConnection({
            host: '35.246.240.151',
            user: 'root',
            password: 'X7yikbxgckx1',
            database: tenant
        });
        
        connection.connect((err: MysqlError, ...args: any[]) => {
            if(err) reject(err);
            
            resolve(connection);
        })
    });

    return createConnectionPromise;
}

export default { getConnection }