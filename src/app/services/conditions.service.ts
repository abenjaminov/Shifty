import {Injectable} from '@angular/core';
import {ServiceState} from './models';
import {Condition, ConditionType} from '../models';
import {IStateObject, StateService} from './state.service';
import * as Enumerable from 'linq';

@Injectable()
export class ConditionService {
  state: ServiceState;

  constructor(
      private stateService: StateService
    ) { }

  get conditions(): Condition[] {
    return this.stateService.getState(Condition) as Condition[];
  }

  get permanentConditions(): Condition[] {
    return Enumerable.from(this.stateService.appState.conditions).where(condition => condition.type == ConditionType.Permanent).toArray();
  }

  get roomConditions(): Condition[] {
    return Enumerable.from(this.stateService.appState.conditions).where(condition => condition.type == ConditionType.Room).toArray();
  }

  load(): Promise<Condition[]> {
    this.state = ServiceState.loading;
    
    var result = this.stateService.fetch<Condition[]>(Condition).then((x:Condition[]) => {
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
