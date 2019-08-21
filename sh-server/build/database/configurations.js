"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModuleConfiguration = /** @class */ (function () {
    function ModuleConfiguration(tableName) {
        this.tableName = tableName;
    }
    Object.defineProperty(ModuleConfiguration.prototype, "selectAllQuery", {
        get: function () {
            return "SELECT * FROM " + this.tableName;
        },
        enumerable: true,
        configurable: true
    });
    ModuleConfiguration.prototype.selectQuery = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        var joinedFields = fields.join(', ');
        return "SELECT " + joinedFields + " FROM " + this.tableName;
    };
    return ModuleConfiguration;
}());
exports.ModuleConfiguration = ModuleConfiguration;
var DataBaseConfig = /** @class */ (function () {
    function DataBaseConfig() {
    }
    return DataBaseConfig;
}());
exports.DataBaseConfig = DataBaseConfig;
var ShConfig = new DataBaseConfig();
exports.ShConfig = ShConfig;
ShConfig.Profiles = new ModuleConfiguration("Profiles");
//# sourceMappingURL=configurations.js.map