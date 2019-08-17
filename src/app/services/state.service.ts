import {Injectable, Inject, forwardRef} from '@angular/core';
import { Profile, Tag } from '../models';
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
  objects: any;
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

  initServiceMap() {
    //Object.freeze(this.appState.tags);
    this.serviceMap.set(Tag, {
      objects : this.appState.tags,
      cacheName : 'tags',
      apiConfig :  { controller : 'tags' }
    });

    //Object.freeze(this.appState.profiles);
    this.serviceMap.set(Profile, {
      objects: this.appState.profiles,
      cacheName : 'profiles',
      apiConfig : { controller : 'profiles' }
    });

  }

  loadApp() {
    this.appState.appStatus = AppStatus.ready;
  }

  fetchMany(T:IConstructor) : Promise<IStateObject[]>{
      var result = new Promise<IStateObject[]>((resolve, reject) => {
      
       var mappedState = this.getStateMap(T);

       var url = `/api/${mappedState.apiConfig.controller}`;

      var cache = this.cacheService.getOrCreate(mappedState.cacheName);

      var cachedObjects = cache.get(url);
      if(cachedObjects) {

        mappedState.objects.length = 0;
        mappedState.objects.push(...cachedObjects);

        resolve(mappedState.objects);

        return;
      }

      this.httpClient.get(url).toPromise().then((result:HttpResult) => {
        mappedState.objects.length = 0;
        mappedState.objects.push(...result.data);

        cache.set(url, Object.assign([], mappedState.objects));

        resolve(mappedState.objects);
      }).catch(error => {
        reject(error);
      })
    });

    return result;
  }

  getState(T: IConstructor): IStateObject[] {
    return this.getStateMap(T).objects;
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
        this.httpClient.put(`/api/${stateMap.apiConfig.controller}`, obj).toPromise().then(x => {
          
          this.cacheService.clear(stateMap.cacheName)

          oldObject = obj;
          resolve(obj);
        }).catch(error => {
          reject(error);
        })
      }
    });

    return result;
  }
}
