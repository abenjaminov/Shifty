import {Injectable, Inject, forwardRef} from '@angular/core';
import {IShService, ServiceState} from "./models";
import {Profile} from "../models";
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class ProfilesService implements IShService<Profile>
{
  state: ServiceState;

  constructor(
    @Inject(forwardRef(() => StateService))  private stateService: StateService
    ) { }

  get profiles() {
    return this.stateService.getState(Profile);
  }

  load(): Promise<Profile[]> {
    this.state = ServiceState.loading;
    
    var result = this.stateService.fetch<Profile>("/profiles").then(x => {
      this.state = ServiceState.ready;

      return x;
    });

    return result;
  }

  saveProfile(profile: Profile) {

  }
}
