import Enumerable from "linq";

export class ScheduleService {

    getWeeklySchedule(startDate? :Date) {
        var datesOfWeek = this.getDatesOfWeek(startDate);

        
    }

    getDatesOfWeek(startDate? :Date): Date[] {
        let datesOfWeek: Date[] = []

        if(!startDate) {
            startDate = new Date(new Date().setHours(0,0,0,0,));
        }
        

        let firstDayOfWeek = startDate.getDate() - startDate.getDay() + 1;
        datesOfWeek.push(new Date(startDate.setDate(firstDayOfWeek)));

        for (let index = 1; index < 7; index++) {
            var newDate = new Date(startDate.getDate() + index)    
            datesOfWeek.push(new Date(newDate));
        }

        return datesOfWeek;
    }
}