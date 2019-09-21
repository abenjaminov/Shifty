import { Injectable, Inject, forwardRef } from '@angular/core';
import { ServiceState } from './models';
import { Tag, Profile } from '../models';
import { StateService } from './state.service';

@Injectable()
export class TagsService {
  
  state: ServiceState;

  get tags(): Tag[] {
    return this.stateService.getState(Tag) as Tag[];
  }

  constructor(
      private stateService: StateService
    ) { }

  load(): Promise<Tag[]> {
    this.state = ServiceState.loading;
    
    var result = this.stateService.fetch<Tag[]>(Tag).then((x:Tag[]) => {
      this.state = ServiceState.ready;

      return x;
    });

    return result;
  }
}
