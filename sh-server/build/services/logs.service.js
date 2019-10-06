"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
var LoggerTypes;
(function (LoggerTypes) {
    LoggerTypes[LoggerTypes["console"] = 0] = "console";
})(LoggerTypes = exports.LoggerTypes || (exports.LoggerTypes = {}));
class LogService {
    constructor(name) {
        this.init(LoggerTypes.console);
    }
    init(loggerType) {
        this.logger = this.getLogger(loggerType);
    }
    getLogger(loggerType) {
        if (loggerType == undefined) {
            return this.logger;
        }
        else {
            if (loggerType == LoggerTypes.console) {
                return new ConsoleLogger();
            }
        }
    }
    info(message) {
        this.logger.info(message);
    }
    error(message, exception) {
        this.logger.error(message, exception);
    }
    warning(message, exception) {
        this.logger.warning(message, exception);
    }
}
exports.LogService = LogService;
class ConsoleLogger {
    info(message) {
        console.log(colors_1.default.bgWhite(message));
    }
    error(message, exception) {
        console.log(colors_1.default.bold(colors_1.default.bgRed(message)));
    }
    warning(message, exception) {
        console.log(colors_1.default.bgYellow(message));
    }
}
//# sourceMappingURL=logs.service.js.map