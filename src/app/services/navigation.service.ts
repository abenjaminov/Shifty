import {forwardRef, Inject, Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {Events, EventsService} from "./events.service";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private router: Router,private eventsService: EventsService) {
    this.eventsService.subscribe(Events.UserAuthorized, (user) => {
      this.navigateTo('home');
    })
  }

  navigateIn(path: string) {
    this.router.navigate([this.router.url, `${path}`]);
  }

  navigateTo(path: string) {
    this.router.navigate([`${path}`]);
  }
}
