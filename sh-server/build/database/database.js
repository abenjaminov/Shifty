"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var connection_1 = __importDefault(require("./connection"));
var DbContext = /** @class */ (function () {
    function DbContext() {
        this.select.bind(this);
    }
    DbContext.prototype.select = function (table, query) {
        var _this = this;
        var selectPromise = new Promise(function (resolve, reject) {
            _this.connection.query(query, function (err, result, fields) {
            });
        });
        return selectPromise;
    };
    DbContext.getContext = function () {
        var getContextPromise = new Promise(function (resolve, reject) {
            var newContext = new DbContext();
            connection_1.default.getConnection().then(function (connection) {
                newContext.connection = connection;
                resolve(newContext);
            }).catch(function (err) {
                reject(err);
            });
        });
        return getContextPromise;
    };
    return DbContext;
}());
exports.DbContext = DbContext;
//# sourceMappingURL=database.js.map