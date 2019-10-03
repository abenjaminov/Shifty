import {EventEmitter, Injectable} from '@angular/core';
import {createEnumList} from "../models";
import {Subscription} from "rxjs";

export enum Events {
  UserAuthorized = "UserAuthorized",
  NavigationEnd = "NavigationEnd",
  LoggedOut = "LoggedOut"
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  eventEmitters: { [eventName:string] : EventEmitter<any> } = {};

  constructor() {
    let enumList = createEnumList(Events);

    for(let enumValue of enumList) {
      this.eventEmitters[enumValue] = new EventEmitter<any>();
    }
  }

  subscribe(event: Events, callback: Function): Subscription {
    return this.eventEmitters[event].subscribe(callback);
  }

  emit(event: Events, data?: any) {
    this.eventEmitters[event].emit(data);
  }
}
