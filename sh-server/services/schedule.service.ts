import Enumerable from "linq";

export class ScheduleService {

    getWeeklySchedule() {

    }

    getDatesOfWeek(weekStartDay: number = 0): Date[] {
        let datesOfWeek: Date[] = []
        let today = new Date(new Date().setHours(0,0,0,0,));

        let firstDayOfWeek = today.getDate() - today.getDay() + 1;
        datesOfWeek.push(new Date(today.setDate(firstDayOfWeek)));

        for (let index = 1; index < 7; index++) {
            let nextDate = firstDayOfWeek + index;
            var newDate = new Date(today.getDate() + index)    
            datesOfWeek.push(new Date(newDate));
        }

        return datesOfWeek;
    }
}