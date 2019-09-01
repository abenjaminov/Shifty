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
  weeklySchedules: WeeklySchedule[];
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
      apiConfig :  { controller : 'tags' }
    });

    this.serviceMap.set(Profile, {
      data: this.appState.profiles,
      cacheName : 'profiles',
      apiConfig : { controller : 'profiles' }
    });

    this.serviceMap.set(Room, {
      data: this.appState.rooms,
      cacheName : 'rooms',
      apiConfig : { controller : 'rooms' }
    });

    this.serviceMap.set(Condition, {
      data: this.appState.conditions,
      cacheName : 'conditions',
      apiConfig : { controller : 'conditions' }
    });

    this.serviceMap.set(WeeklySchedule, {
      data: this.appState.weeklySchedules,
      cacheName : 'schedule',
      apiConfig : { controller : 'schedule' }
    });
  }

  loadApp() {
    this.appState.appStatus = AppStatus.ready;
  }

  fetch(T: IConstructor) : Promise<IStateObject> {
    let result = new Promise<IStateObject>((resolve, reject) => {
        this.appState.appStatus = AppStatus.loading;

        let mappedState = this.getStateMap(T);

        let url = `/api/${mappedState.apiConfig.controller}`;

        let cache = this.cacheService.getOrCreate(mappedState.cacheName);

        let cachedObject = cache.get(url);
        if(cachedObject) {

          mappedState.data = cachedObject;

          this.appState.appStatus = AppStatus.ready;

          resolve(mappedState.data);

          return;
        }

        this.httpClient.get(url).toPromise().then((result:HttpResult) => {
          mappedState.data = result.data;

          cache.set(url, mappedState.data);

          resolve(mappedState.data);
        }).catch(error => {
          reject(error);
        }).finally(() => {
          this.appState.appStatus = AppStatus.ready;
        })
    });

    return result;
  }

  fetchMany(T:IConstructor) : Promise<IStateObject[]>{
      let result = new Promise<IStateObject[]>((resolve, reject) => {
        this.appState.appStatus = AppStatus.loading;

         var mappedState = this.getStateMap(T);

         var url = `/api/${mappedState.apiConfig.controller}`;

        var cache = this.cacheService.getOrCreate(mappedState.cacheName);

        var cachedObjects = cache.get(url);
        if(cachedObjects) {

          mappedState.data.length = 0;
          mappedState.data.push(...cachedObjects);

          this.appState.appStatus = AppStatus.ready;

          resolve(mappedState.data);

          return;
        }

        this.httpClient.get(url).toPromise().then((result:HttpResult) => {
          mappedState.data.length = 0;
          mappedState.data.push(...result.data);

          cache.set(url, Object.assign([], mappedState.data));

          resolve(mappedState.data);
        }).catch(error => {
          reject(error);
        }).finally(() => {
          this.appState.appStatus = AppStatus.ready;
        })
    });

    return result;
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
