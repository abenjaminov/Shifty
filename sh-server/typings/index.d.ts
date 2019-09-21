import { ScheduleService } from "../services/schedule.service";
import { LogService } from "../services/logs.service";

declare global {
    namespace Express {
        export interface Request {
            dbContext: any;
            tenant: string;
            scheduleService:ScheduleService;
            logService: LogService;
        }
    }
}

export {};
