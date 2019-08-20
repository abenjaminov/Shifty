"use strict";
var mySQL = require('mysql');
var getConnection = function () {
    var createConnectionPromise = new Promise(function (resolve, reject) {
        var connection = mySQL.createConnection({
            host: '35.246.240.151',
            user: 'root',
            password: 'X7yikbxgckx1',
            database: "Zedek"
        });
        connection.connect(function (err) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (err)
                reject(err);
            resolve(connection);
        });
    });
    return createConnectionPromise;
};
module.exports = { getConnection: getConnection };
