import { Injectable, Inject, forwardRef } from '@angular/core';
import { IShService, ServiceState } from './models';
import { Assignment } from '../models';
import { StateService, IStateObject } from './state.service';

@Injectable()
export class AssignmentService implements IShService<Assignment> {
  state: ServiceState;

  constructor(
    @Inject(forwardRef(() => StateService))  private stateService: StateService
    ) { }

  get assignments(): Assignment[] {
    return this.stateService.getState(Assignment) as Assignment[];
  }

  load(): Promise<Assignment[]> {
    this.state = ServiceState.loading;
    
    var result = this.stateService.fetchMany(Assignment).then((x:Assignment[]) => {
      this.state = ServiceState.ready;

      return x;
    });

    return result;
  }

  saveAssignment(assignment: Assignment) : Promise<IStateObject> {
    return this.stateService.saveObject(Assignment, assignment);
  }

  addAssignment(assignment: Assignment): Promise<IStateObject> {
    return this.stateService.insertObject(Assignment, assignment);
  }

  deleteAssignment(assignment:Assignment) : Promise<boolean> {
    return this.stateService.deleteObject(Assignment, assignment.id);
  }
}
