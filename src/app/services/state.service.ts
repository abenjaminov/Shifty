import {Injectable, Inject, forwardRef} from '@angular/core';
import {Profile, Tag, Room, Condition, WeeklySchedule} from '../models';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache.service';

interface HttpResult {
  data: any;
}

export interface IStateObject {
  id:string | number;
}

interface ApiConfig {
  controller : string;
}

class StateMap {
  data: any[] | any;
  apiConfig : ApiConfig;
  cacheName: string;
  mapToState: (data: any) => void;
}

export enum AppStatus {
  loading = "loading",
  ready = "Ready"
}

class AppState {
  appStatus: AppStatus = AppStatus.loading;
  profiles: Profile[] = [];
  tags: Tag[] = [];
  rooms: Room[] = [];
  conditions: Condition[] = [];
  weeklySchedules: Map<string, WeeklySchedule> = new Map<string, WeeklySchedule>();
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

  private serviceMap: Map<IConstructor, StateMap> = new Map<IConstructor,StateMap>();

  constructor(
    @Inject(forwardRef(() => HttpClient)) private httpClient: HttpClient,
    @Inject(forwardRef(() => CacheService)) private cacheService: CacheService
    ) {

    this.initServiceMap();
    this.loadApp();

    (window as any).ShState = this.appState;
  }

  private initServiceMap() {
    this.serviceMap.set(Tag, {
      data : this.appState.tags,
      cacheName : 'tags',
      apiConfig :  { controller : 'tags' },
      mapToState: data => {
        this.appState.tags.length = 0;
        this.appState.tags.push(...data);
      }
    });

    this.serviceMap.set(Profile, {
      data: this.appState.profiles,
      cacheName : 'profiles',
      apiConfig : { controller : 'profiles' },
      mapToState: data => {
        this.appState.profiles.length = 0;
        this.appState.profiles.push(...data);
      }
    });

    this.serviceMap.set(Room, {
      data: this.appState.rooms,
      cacheName : 'rooms',
      apiConfig : { controller : 'rooms' },
      mapToState: data => {
        this.appState.rooms.length = 0;
        this.appState.rooms.push(...data);
      }
    });

    this.serviceMap.set(Condition, {
      data: this.appState.conditions,
      cacheName : 'conditions',
      apiConfig : { controller : 'conditions' },
      mapToState: data => {
        this.appState.conditions.length = 0;
        this.appState.conditions.push(...data);
      }
    });

    this.serviceMap.set(WeeklySchedule, {
      data: this.appState.weeklySchedules,
      cacheName : 'schedule',
      apiConfig : { controller : 'schedule' },
      mapToState: (data: WeeklySchedule) => {
        this.appState.weeklySchedules.set(data.id, data);
      }
    });
  }

  loadApp() {
    this.appState.appStatus = AppStatus.ready;
  }

  async fetch<RT>(T: IConstructor) : Promise<RT> {
      this.appState.appStatus = AppStatus.loading;

    let result = await this.fetchInternal(T).catch(error => {
        // TODO : Display error
        console.error(error);
        return undefined;
    });

      this.appState.appStatus = AppStatus.ready;

      return result;
  }

  async fetchInternal<RT>(T:IConstructor) : Promise<RT> {
    let mappedState = this.getStateMap(T);

    let url = `/api/${mappedState.apiConfig.controller}`;

    let cache = this.cacheService.getOrCreate(mappedState.cacheName);

    let cachedData = cache.get(url);
    if(cachedData) {

      mappedState.mapToState(cachedData);

      this.appState.appStatus = AppStatus.ready;

      return mappedState.data;
    }

    let result: HttpResult = await this.httpClient.get<HttpResult>(url).toPromise<HttpResult>();

    mappedState.mapToState(result.data)

    cache.set(url, Object.assign([], mappedState.data));

    return mappedState.data;
  }

  getState(T: IConstructor): IStateObject[] {
    return this.getStateMap(T).data;
  }

  getApiConf(T: IConstructor): ApiConfig {
    return this.getStateMap(T).apiConfig;
  }

  getStateMap(T: IConstructor) {
    if(this.serviceMap.has(T)) {
      return this.serviceMap.get(T);
    }

    throw new Error("State map does not have a correct map");
  }

  objectExists(T: IConstructor, obj: IStateObject) : IStateObject {
    var objects = this.getState(T);

    var object = objects.find(x => x.id == obj.id);

    return object
  }

  saveObject(T: IConstructor, obj: IStateObject): Promise<IStateObject> {
    var result = new Promise<IStateObject>((resolve, reject) => {
      var oldObject = this.objectExists(T, obj);

      var stateMap = this.getStateMap(T);

      if(oldObject) {
        this.appState.appStatus = AppStatus.loading;

        this.httpClient.put(`/api/${stateMap.apiConfig.controller}`, obj).toPromise().then(x => {

          this.cacheService.clear(stateMap.cacheName)

          oldObject = obj;
          resolve(obj);
        }).catch(error => {
          reject(error);
        }).finally(() => {
          this.appState.appStatus = AppStatus.ready;
        })
      }
    });

    return result;
  }

  insertObject(T: IConstructor, obj: IStateObject): Promise<IStateObject> {
    var result = new Promise<IStateObject>((resolve, reject) => {

      var stateMap = this.getStateMap(T);

      this.appState.appStatus = AppStatus.loading;

      this.httpClient.post(`/api/${stateMap.apiConfig.controller}`, obj).toPromise().then(x => {

        this.cacheService.clear(stateMap.cacheName)

        stateMap.data.push(obj);
        resolve(obj);
      }).catch(error => {
        reject(error);
      }).finally(() => {
        this.appState.appStatus = AppStatus.ready;
      })

    });

    return result;
  }

  deleteObject(T: IConstructor, id: any): Promise<boolean> {
    var result = new Promise<boolean>((resolve,reject) => {
      var stateMap = this.getStateMap(T);
      this.appState.appStatus = AppStatus.loading;

      this.httpClient.delete(`/api/${stateMap.apiConfig.controller}/${id}`).toPromise().then(x => {
        this.appState.appStatus = AppStatus.ready;
        this.cacheService.clear(stateMap.cacheName);

        var index = stateMap.data.findIndex(x => x.id == id);
        stateMap.data = stateMap.data.splice(index,1);

        resolve(true);
      }).catch(error => {
        reject(error);
      }).finally(() => {
        this.appState.appStatus = AppStatus.ready;
      })
    });

    return result;
  }
}
