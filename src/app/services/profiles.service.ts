import {Injectable, Inject, forwardRef} from '@angular/core';
import {IShService, ServiceState} from "./models";
import {Profile} from "../models";
import { StateService, IStateObject } from './state.service';

@Injectable()
export class ProfilesService implements IShService<Profile>
{
  state: ServiceState;

  constructor(
    @Inject(forwardRef(() => StateService))  private stateService: StateService
    ) { }

  get profiles(): Profile[] {
    return this.stateService.getState(Profile) as Profile[];
  }

  load(): Promise<Profile[]> {
    this.state = ServiceState.loading;
    
    var result = this.stateService.fetchMany(Profile, "/api/profiles","profiles").then((x:Profile[]) => {
      this.state = ServiceState.ready;

      return x;
    });

    return result;
  }

  saveProfile(profile: Profile) : Promise<IStateObject> {
    return this.stateService.saveObject(Profile, profile);
  }
}
