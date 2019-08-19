var mySQL = require('mysql');

var connection = mySQL.createConnection({
    host: '35.246.240.151',
    user: 'root',
    password: 'X7yikbxgckx1',
    database: "Zedek"
});

connection.connect((err, ...args) => {
    if(err) throw err;

    console.log("Connection to DB established " + args);

    connection.query("Select * from Profiles", (erro, result) => {
        if(erro) throw erro;

        console.log(result);
    })
})

var getConnection = function() {
    var createConnectionPromise = new Promise((resolve, reject) => {
        var connection = mySQL.createConnection({
            host: '35.246.240.151',
            user: 'root',
            password: 'X7yikbxgckx1',
            database: "Zedek"
        });
    
        connection.connect((err, ...args) => {
            if(err) reject(err);

            resolve(connection);
        })
    });

    return createConnectionPromise;
}
module.exports = { getConnection }