import { ScheduleService } from "../services/schedule.service";

declare global {
    namespace Express {
        export interface Request {
            dbContext: any;
            tenant: string;
            scheduleService:ScheduleService;
        }
    }
}

export {};
