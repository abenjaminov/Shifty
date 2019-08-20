"use strict";
var dbConnection = require('./connection');
var context = {};
context.select = function () {
};
var getContext = function () {
    var getContextPromise = new Promise(function (resolve, reject) {
        var newContext = Object.assign({}, context);
        dbConnection.getConnection().then(function (connection) {
            newContext.connection = connection;
            resolve(newContext);
        }).catch(function (err) {
            reject(err);
        });
    });
    return getContextPromise;
};
module.exports = { getContext: getContext };
