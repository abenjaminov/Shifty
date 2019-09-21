import colors from 'colors'

interface ILogger {
    info: (message:string) => void;
    error: (message:string, exception?: any) => void;
    warning: (message:string, exception?: any) => void;
}

export enum LoggerTypes {
    console = 0
}

export class LogService {
    private logger: ILogger;
    private name: string;

    constructor(name: string) {
        this.init(LoggerTypes.console);
    }

    init(loggerType: LoggerTypes) {
        this.logger = this.getLogger(loggerType);
    }

    private getLogger(loggerType: LoggerTypes) {
        if(loggerType == undefined) {
            return this.logger;
        }
        else {
            if(loggerType == LoggerTypes.console) {
                return new ConsoleLogger();
            }
        }
    }

    info(message:string) {
        this.logger.info(message);
    }

    error(message:string, exception?:any) {
        this.logger.error(message, exception);
    }

    warning(message:string, exception?:any) {
        this.logger.warning(message, exception);
    }
}

class ConsoleLogger implements ILogger {
    info(message:string) {
        console.log(colors.bgWhite(message));
    }

    error(message:string, exception?:any) {
        console.log(colors.bold(colors.bgRed(message)));
    }

    warning(message:string, exception?:any) {
        console.log(colors.bgYellow(message));
    }
}