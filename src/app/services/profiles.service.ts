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
    
    var result = this.stateService.fetch<Profile[]>(Profile).then((profiles:Profile[]) => {
      this.fixProfiles(profiles);

      this.state = ServiceState.ready;

      return profiles;
    });

    return result;
  }

  saveProfile(profile: Profile) : Promise<IStateObject> {
    return this.stateService.saveObject(Profile, profile);
  }

  fixProfiles(profiles: any) {
    for(let profile of profiles) {
      profile = Object.assign(new Profile(), profile);

      if(profile.absences && profile.absences.length > 0) {
        for(let absence of profile.absences) {
          absence.startDate = new Date(Date.parse(absence.startDate));
          absence.endDate = new Date(Date.parse(absence.endDate));
        }
      }
    }
}
}
