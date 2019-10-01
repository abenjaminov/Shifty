
import NodeCache from 'node-cache';

const serverCache: NodeCache = new NodeCache();

export class CacheService {

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

    clearByPrefix(prefix: string) {
        let keysToClear = serverCache.keys();

        keysToClear = keysToClear.filter(key => key.startsWith(prefix));

        serverCache.del(keysToClear);
    }
}