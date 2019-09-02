import { Injectable, Inject, forwardRef } from '@angular/core';
import { IShService, ServiceState } from './models';
import { Room, Tag, Profile } from '../models';
import { StateService, IStateObject } from './state.service';

@Injectable()
export class RoomsService implements IShService<Room> {
  state: ServiceState;

  constructor(
    @Inject(forwardRef(() => StateService))  private stateService: StateService
    ) { }

  get rooms(): Room[] {
    return this.stateService.getState(Room) as Room[];
  }

  load(): Promise<Room[]> {
    this.state = ServiceState.loading;
    
    var result = this.stateService.fetch<Room[]>(Room).then((x:Room[]) => {
      this.state = ServiceState.ready;

      return x;
    });

    return result;
  }

  saveRoom(room: Room) : Promise<IStateObject> {
    return this.stateService.saveObject(Room, room);
  }
}
