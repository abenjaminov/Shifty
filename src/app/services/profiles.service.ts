import {Injectable, Inject, forwardRef} from '@angular/core';
import {ServiceState} from "./models";
import {Profile} from "../models";
import { StateService, IStateObject } from './state.service';
import * as Enumerable from "linq";

@Injectable()
export class ProfilesService
{
  state: ServiceState;

  constructor(
      private stateService: StateService
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

  fixProfiles(profiles: Array<Profile>) {
    profiles.forEach((profile, index) => {
      profiles[index] = Object.assign(new Profile(), profile);
      profiles[index].professionsJoinedText = Enumerable.from(profile.professions).select(x => x.name).toArray().join(', ');
      if(profiles[index].absences && profiles[index].absences.length > 0) {
        for(let absence of profiles[index].absences) {
          absence.startDate = new Date(Date.parse(absence.startDate.toString()));
          absence.endDate = new Date(Date.parse(absence.endDate.toString()));
        }
      }
    })
  }
}
