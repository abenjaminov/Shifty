import {Component, forwardRef, Inject} from '@angular/core';
import {AuthenticationService} from "./services/authentication.service";
import { StateService, AppStatus } from 'src/app/services/state.service';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <sh-loading *ngIf="this.stateService.appState.appStatus == this.AppStatus.loading"></sh-loading>
      <div class="app-grid">
        <div class="sidebar-container" *ngIf="authenticationService.userAuthorized">
          <sh-sidebar></sh-sidebar>
        </div>
        <div class="content-container">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Shifty';
  AppStatus = AppStatus;

  constructor(public authenticationService: AuthenticationService, public stateService: StateService) {}
}
