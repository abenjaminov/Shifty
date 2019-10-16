import { ScheduleService } from "../services/schedule.service";
import { LogService } from "../services/logs.service";
import { CacheService } from "../services/cache.service";
import { RoomsService } from "../services/rooms.service";
import { DbContext } from "../database/database";

declare global {
    namespace Express {
        export interface Request {
            dbContext: DbContext;
            tenant: string;
            scheduleService:ScheduleService;
            logService: LogService;
            cacheService: CacheService;
            roomService: RoomsService;
        }

        export interface Response {
            json: (body?: any, cachePrefixToClear?: string) => void;
        }
    }
}

export {};
