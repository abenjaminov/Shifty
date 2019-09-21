import {Component, forwardRef, Inject} from '@angular/core';
import {AuthenticationService} from "./services/authentication.service";
import {StateService} from "./services/state.service";

@Component({
  selector: 'app-root',
  template: `
    <div>
      <sh-loading></sh-loading>
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

  constructor(public authenticationService: AuthenticationService, public stateService: StateService) {}
}
