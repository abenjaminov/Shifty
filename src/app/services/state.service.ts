import {Injectable} from '@angular/core';
import { Profile, Tag } from '../models';

export enum AppStatus {
  loading = "loading",
  ready = "Ready"
}

class AppState {
  appStatus: AppStatus = AppStatus.loading;
  profiles: Profile[] = [];
  tags: Tag[] = [];
}

export interface IConstructor {
  new (...args: any[]): any;
}

@Injectable({
  providedIn: 'root'
})
export class StateService
{
  private appState: AppState = new AppState();

  private serviceMap: Map<IConstructor, any> = new Map<IConstructor,any>();

  constructor() { 
    this.initServiceMap();
    this.loadApp();

    (window as any).ShState = this.appState;
  }

  initServiceMap() {
    this.serviceMap.set(Tag, this.appState.tags);
    this.serviceMap.set(Profile, this.appState.profiles);
  }

  loadApp() {
    this.appState.appStatus = AppStatus.ready;
  }

  fetch<T>(url:string) : Promise<Profile[]>{
    var result = new Promise<Profile[]>((resolve, reject) => {

      this.appState.profiles.push({ id:0, name: "Asaf Benjaminov",professions:[{ id:0, name: "Senior" },{ id:1, name: "Intern" }] })
      this.appState.profiles.push({ id:1, name: "Israel israeli",professions:[{ id:1, name: "Intern" }] })

      resolve(this.appState.profiles);
    });

    return result;
  }

  getState(T: IConstructor) {
    if(this.serviceMap.has(T)) {
      return this.serviceMap.get(T);
    }

    throw new Error("State does not have a correct map");
  }
}
