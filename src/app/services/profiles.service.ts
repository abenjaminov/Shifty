import {Injectable} from '@angular/core';
import {IShService, ServiceState} from "./models";
import {Profile} from "../models";

@Injectable({
  providedIn: 'root'
})
export class ProfilesService implements IShService<Profile>
{
  state: ServiceState;

  constructor() { }

  load(): Promise<Profile[]> {
    this.state = ServiceState.loading;
    var result = new Promise<Profile[]>((resolve, reject) => {
      let profiles:Profile[] = [];

      profiles.push({ name: "Asaf Benjaminov",professions:[{ id:0, name: "Senior" },{ id:1, name: "Intern" }] })
      profiles.push({ name: "Asaf Benjaminov",professions:[{ id:1, name: "Intern" }] })

      this.state = ServiceState.ready;
      resolve(profiles);
    });

    return result;
  }
}
