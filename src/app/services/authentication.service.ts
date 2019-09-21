import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Events, EventsService} from "./events.service";
import {NavigationService} from "./navigation.service";
import {MatSnackBar} from "@angular/material/snack-bar";

export class LoginData {
  customerCode: string = "";
  username: string = "";
  password: string = "";
}

export class AuthorizedUserData {
  token:string;
  username: string;
  customerCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public authedUserData: AuthorizedUserData;
  public userAuthorized: boolean = false;

  constructor(
      private httpClient: HttpClient,
      private eventsService: EventsService,
      private navigationService: NavigationService,
      private snackBar: MatSnackBar
  ) {
    this.authedUserData = JSON.parse(sessionStorage.getItem("authorizedUser"));

    if(!this.authedUserData) {
      this.navigationService.navigateTo('login');
    }
    else {
      this.userAuthorized = true;
    }
  }

  tryLogin(loginData: LoginData) {
    this.httpClient.post('/api/login', loginData, {}).toPromise().then((result: AuthorizedUserData) => {
      this.authedUserData = result;
      this.userAuthorized = true;

      sessionStorage.setItem("authorizedUser", JSON.stringify(this.authedUserData));

      this.eventsService.emit(Events.UserAuthorized, this.authedUserData);
    }).catch(error => {

    });
  }

  logout(initiated: boolean, reason?:string) {
    this.userAuthorized = false;
    this.authedUserData = undefined;
    sessionStorage.clear();
    this.navigationService.navigateTo('login');

    if(!initiated) {
      this.snackBar.open(reason,"Ok");
    }

    this.eventsService.emit(Events.LoggedOut);
  }
}
