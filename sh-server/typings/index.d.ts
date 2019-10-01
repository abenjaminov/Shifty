import { ScheduleService } from "../services/schedule.service";
import { LogService } from "../services/logs.service";
import { CacheService } from "../services/cache.service";

declare global {
    namespace Express {
        export interface Request {
            dbContext: any;
            tenant: string;
            scheduleService:ScheduleService;
            logService: LogService;
            cacheService: CacheService;
        }

        export interface Response {
            json: (body?: any, cachePrefixToClear?: string) => void;
        }
    }
}

export {};
