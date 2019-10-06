"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const fs_1 = __importDefault(require("fs"));
var getConnection = (tenant) => {
    var createConnectionPromise = new Promise((resolve, reject) => {
        var connection = mysql_1.default.createConnection({
            multipleStatements: true,
            host: '35.246.240.151',
            user: 'root',
            password: 'X7yikbxgckx1',
            database: tenant,
            ssl: {
                ca: fs_1.default.readFileSync(__dirname + '/certificates/server-ca.pem'),
                key: fs_1.default.readFileSync(__dirname + '/certificates/client-key.pem'),
                cert: fs_1.default.readFileSync(__dirname + '/certificates/client-cert.pem')
            }
        });
        connection.connect((err, ...args) => {
            if (err)
                reject(err);
            resolve(connection);
        });
    });
    return createConnectionPromise;
};
exports.default = { getConnection };
//# sourceMappingURL=connection.js.map