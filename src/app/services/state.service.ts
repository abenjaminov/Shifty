import {Injectable} from '@angular/core';
import {Condition, DailySchedule, Profile, Room, Tag, WeeklySchedule} from '../models';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CacheService} from './cache.service';
import {AuthenticationService} from "./authentication.service";
import {Events, EventsService} from "./events.service";
import {HttpResult, HttpService} from "./http.service";

export interface IStateObject {
  id:string | number;
}

interface ApiControllerRoute {
  path: string;
}

interface ApiConfig {
  controller : string;
  routes: Array<ApiControllerRoute>;
}

class StateMap {
  data: any[] | any;
  apiConfig : ApiConfig;
  cacheName: string;
  mapToState: (data: any) => any;
  deleteFromState: (key: any) => boolean;
}

export enum AppStatus {
  loading = "loading",
  ready = "Ready",
  error = "Error"
}

class AppState {
  private _appStatus: AppStatus = AppStatus.loading;
  get appStatus() {
    return this._appStatus;
  }

  set appStatus(status: AppStatus) {
    setTimeout(x => {
      this._appStatus = status;
    });
  }

  runningRequests: Map<any,string> = new Map<any, string>();
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
  public appState: AppState = new AppState();

  private serviceMap: Map<IConstructor, StateMap> = new Map<IConstructor,StateMap>();

  constructor(
    private httpService: HttpService,
    private eventsService: EventsService
    ) {

    this.initServiceMap();
    this.loadApp();

    (window as any).AppState = this.appState;

    this.eventsService.subscribe(Events.TryLogin, () => {
      this.addLoading(Events.TryLogin, "stateService.subscribe to TryLogin");
    });

    this.eventsService.subscribe(Events.UserAuthorized, () => {
      this.removeLoading(Events.TryLogin);
    });

    this.eventsService.subscribe(Events.UserUnAuthorized, () => {
      this.clearLoading();
    });

    this.eventsService.subscribe(Events.LoggedOut, () => {
      this.clearLoading();
    })
  }

  private initServiceMap() {
    this.serviceMap.set(Tag, {
      data : this.appState.tags,
      cacheName : 'tags',
      apiConfig :  { controller : 'tags', routes: [] },
      mapToState: data => {
        let dataCopy = Object.assign([], data).map(dc => Object.assign(new Tag(), dc));
        this.appState.tags.length = 0;
        this.appState.tags.push(...dataCopy);
        return this.appState.tags;
      },
      deleteFromState: key => {
        var index = this.appState.tags.findIndex(x => x.id == key);
        if(index != -1) {
          this.appState.tags = this.appState.tags.splice(index,1);
          return true;
        }
        return false;
      }
    });

    this.serviceMap.set(Profile, {
      data: this.appState.profiles,
      cacheName : 'profiles',
      apiConfig : { controller : 'profiles', routes: [] },
      mapToState: data => {
        let dataCopy = Object.assign([], data).map(dc => Object.assign(new Profile(), dc));
        this.appState.profiles.length = 0;
        this.appState.profiles.push(...dataCopy);
        return this.appState.profiles;
      },
      deleteFromState: key => {
        var index = this.appState.profiles.findIndex(x => x.id == key);
        if(index != -1) {
          this.appState.profiles = this.appState.profiles.splice(index,1);
          return true;
        }
        return false;
      }
    });

    this.serviceMap.set(Room, {
      data: this.appState.rooms,
      cacheName : 'rooms',
      apiConfig : { controller : 'rooms', routes: [] },
      mapToState: data => {
        let dataCopy = Object.assign([], data).map(dc => Object.assign(new Room(), dc));
        this.appState.rooms.length = 0;
        this.appState.rooms.push(...dataCopy);
        return this.appState.rooms;
      },
      deleteFromState: key => {
        var index = this.appState.rooms.findIndex(x => x.id == key);
        if(index != -1) {
          this.appState.rooms = this.appState.rooms.splice(index,1);
          return true;
        }
        return false;
      }
    });

    this.serviceMap.set(Condition, {
      data: this.appState.conditions,
      cacheName : 'conditions',
      apiConfig : { controller : 'conditions', routes: [] },
      mapToState: data => {
        let dataCopy = Object.assign([], data).map(dc => Object.assign(new Condition(), dc));
        this.appState.conditions.length = 0;
        this.appState.conditions.push(...dataCopy);
        return this.appState.conditions;
      },
      deleteFromState: key => {
        var index = this.appState.conditions.findIndex(x => x.id == key);
        if(index != -1) {
          this.appState.conditions = this.appState.conditions.splice(index,1);
          return true;
        }
        return false;
      }
    });

    this.serviceMap.set(WeeklySchedule, {
      data: this.appState.weeklySchedules,
      cacheName : 'schedule',
      apiConfig : { controller : 'schedule',
                    routes: []},
      mapToState: (data: WeeklySchedule) => {
        var keys = Object.keys(data.days)

        keys.forEach(key => {
          data.days[key] = Object.assign(new DailySchedule(), data.days[key]);
        });

        this.appState.weeklySchedules.set(data.id, data);
        return this.appState.weeklySchedules.get(data.id);
      },
      deleteFromState: key => {
        if(this.appState.weeklySchedules.has(key)) {
          this.appState.weeklySchedules.delete(key);
          return true;
        }
        return false;
      }
    });
  }

  loadApp() {
    this.appState.appStatus = AppStatus.ready;
  }

  async fetch<RT>(T: IConstructor, params?:Array<string>) : Promise<RT> {
    const loadingKey = `${T.name}; ${JSON.stringify(params)}`

    this.addLoading(loadingKey, 'stateService.fetch');

    let result = await this.fetchInternal<RT>(T, params);

    this.removeLoading(loadingKey);

      return result;
  }

  async fetchInternal<RT>(T:IConstructor, params?:Array<string>) : Promise<RT> {
    let mappedState = this.getStateMap(T);

    let url = `/api/${mappedState.apiConfig.controller}`;

    let data: HttpResult = await this.httpService.get(mappedState.cacheName,url,params);

    let mappedData = mappedState.mapToState(data)

    return mappedData;
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

  getCacheName(T: IConstructor) {
    return this.getStateMap(T).cacheName;
  }

  objectExists(T: IConstructor, obj: IStateObject) : IStateObject {
    var objects = this.getState(T);

    var object = objects.find(x => x.id == obj.id);

    return object
  }

  async saveObject(T: IConstructor, obj: IStateObject): Promise<IStateObject> {
      var oldObject = this.objectExists(T, obj);

      var stateMap = this.getStateMap(T);

      if(oldObject) {
        const loadingKey = `${T.name}; ${obj.id}`;
        this.addLoading(loadingKey, "stateService.saveObject");

        let result = await this.httpService.put(stateMap.cacheName,`/api/${stateMap.apiConfig.controller}`, obj);

        oldObject = obj;
        this.removeLoading(loadingKey);

        return obj;
      }
  }

  async insertObject(T: IConstructor, obj: IStateObject): Promise<IStateObject> {

      var stateMap = this.getStateMap(T);
      let loadingKey = `${T.name}; ${JSON.stringify(obj)}`;

      this.addLoading(loadingKey, "stateService.insertObject");

      let result = await this.httpService.post(stateMap.cacheName, `/api/${stateMap.apiConfig.controller}`, obj);

      stateMap.data.push(obj);

      this.removeLoading(loadingKey);

      return obj;
  }

  async deleteObject(T: IConstructor, id: any): Promise<boolean> {
      let stateMap = this.getStateMap(T);
      let loadingKey = `${T.name}; ${id}`;

      this.addLoading(loadingKey, "stateService.deleteObject");

      let result = await this.httpService.delete(stateMap.cacheName,`/api/${stateMap.apiConfig.controller}`,id );

      this.removeLoading(loadingKey);

      stateMap.deleteFromState(id);

      return true;
  }

  public addLoading(id:any, description: string) {
    this.appState.appStatus = AppStatus.loading;

    this.appState.runningRequests.set(id, description);
  }

  public removeLoading(id:any) {
    if(this.appState.runningRequests.has(id)) {
      this.appState.runningRequests.delete(id)

      if(this.appState.runningRequests.size == 0) {
        this.appState.appStatus = AppStatus.ready;
      }
    }
  }

  private clearLoading() {
    this.appState.runningRequests.clear();
    this.appState.appStatus = AppStatus.ready;
  }
}
