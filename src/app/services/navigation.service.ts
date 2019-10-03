import {Injectable} from '@angular/core';
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
    this.navigateInternal([this.router.url, `${path}`]);
  }

  navigateTo(path: string) {
    this.navigateInternal([`${path}`]);
  }

  navigateInternal(commands: Array<string>) {
    this.router.navigate(commands).then(x => {
      this.eventsService.emit(Events.NavigationEnd);
    });
  }
}
