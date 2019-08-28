declare namespace Express {
    export interface Request {
        dbContext: any;
        tenant: string;
    }
}

export {};
