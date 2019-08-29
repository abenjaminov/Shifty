import { Injectable, Inject, forwardRef } from '@angular/core';
import { IShService, ServiceState } from './models';
import { Condition } from '../models';
import { StateService, IStateObject } from './state.service';

@Injectable()
export class ConditionService implements IShService<Condition> {
  state: ServiceState;

  constructor(
    @Inject(forwardRef(() => StateService))  private stateService: StateService
    ) { }

  get conditions(): Condition[] {
    return this.stateService.getState(Condition) as Condition[];
  }

  load(): Promise<Condition[]> {
    this.state = ServiceState.loading;
    
    var result = this.stateService.fetchMany(Condition).then((x:Condition[]) => {
      this.state = ServiceState.ready;

      return x;
    });

    return result;
  }

  saveCondition(condition: Condition) : Promise<IStateObject> {
    return this.stateService.saveObject(Condition, condition);
  }

  addCondition(condition: Condition): Promise<IStateObject> {
    return this.stateService.insertObject(Condition, condition);
  }

  deleteCondition(condition:Condition) : Promise<boolean> {
    return this.stateService.deleteObject(Condition, condition.id);
  }
}
