import { Component, OnInit } from '@angular/core';
import {AuthenticationService, LoginData} from "../../services/authentication.service";
import {AppStatus, StateService} from "../../services/state.service";


@Component({
  selector: 'sh-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginData: LoginData = new LoginData();

  constructor(private authenticationService: AuthenticationService, private stateService: StateService) { }

  ngOnInit() {
  }

  onLoginClicked() {
    // TODO : Check input is ok
    this.authenticationService.tryLogin(this.loginData);

  }
}
