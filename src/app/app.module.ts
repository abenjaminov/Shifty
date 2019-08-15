import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HomeComponent } from './components/home/home.component';
import { SHGridModule } from 'src/shgrid/shgrid.module';
import { ViewComponent } from './components/view/view.component';
import { RouterModule} from "@angular/router";
import { ProfilesComponent } from './components/profiles/profiles.component';
import { StateService } from './services/state.service';
import { ProfileEditComponent } from './components/profiles/edit/profile.edit.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import {NavigationService} from "./services/navigation.service";
import {AngularFontAwesomeModule} from "angular-font-awesome";

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HomeComponent,
    ViewComponent,
    ProfilesComponent,
    ProfileEditComponent,
    DropdownComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SHGridModule,
    RouterModule,
    AngularFontAwesomeModule
  ],
  providers: [StateService, NavigationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
