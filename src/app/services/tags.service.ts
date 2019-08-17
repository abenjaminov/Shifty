import { Injectable, Inject, forwardRef } from '@angular/core';
import { IShService, ServiceState } from './models';
import { Tag, Profile } from '../models';
import { StateService } from './state.service';

@Injectable()
export class TagsService implements IShService<Tag> {
  
  state: ServiceState;

  get tags(): Tag[] {
    return this.stateService.getState(Tag) as Tag[];
  }

  constructor(
    @Inject(forwardRef(() => StateService))  private stateService: StateService
    ) { }

  load(): Promise<Tag[]> {
    this.state = ServiceState.loading;
    
    var result = this.stateService.fetchMany(Tag).then((x:Tag[]) => {
      this.state = ServiceState.ready;

      return x;
    });

    return result;
  }
}
