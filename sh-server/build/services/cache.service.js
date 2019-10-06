"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cache_1 = __importDefault(require("node-cache"));
const serverCache = new node_cache_1.default();
class CacheService {
    setValue(key, value) {
        let success = serverCache.set(key, value);
    }
    getValue(key) {
        let value = serverCache.get(key);
        return value;
    }
    clear() {
        serverCache.flushAll();
    }
    clearByPrefix(prefix) {
        let keysToClear = serverCache.keys();
        keysToClear = keysToClear.filter(key => key.startsWith(prefix));
        serverCache.del(keysToClear);
    }
}
exports.CacheService = CacheService;
//# sourceMappingURL=cache.service.js.map