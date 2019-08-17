import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { StateService, AppStatus } from 'src/app/services/state.service';

@Component({
  selector: 'sh-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  AppStatus = AppStatus;

  constructor(
    @Inject(forwardRef(() => StateService))  private stateService: StateService
  ) { 
  }

  ngOnInit() {
    
  }
}
