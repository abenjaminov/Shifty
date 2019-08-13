import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <div class="sidebar-container">
        <sh-sidebar></sh-sidebar>
      </div>
      <div class="content-container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Shifty';
}
