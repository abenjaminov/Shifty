"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = __importDefault(require("mysql"));
var getConnection = function () {
    var createConnectionPromise = new Promise(function (resolve, reject) {
        var connection = mysql_1.default.createConnection({
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
exports.default = { getConnection: getConnection };
//# sourceMappingURL=connection.js.map