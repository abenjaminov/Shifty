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
import { HttpClientModule } from '@angular/common/http';
import { LoadingComponent } from './components/loading/loading.component';
import { AssignmentsComponent } from './components/assignments/assignments.component'

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HomeComponent,
    ViewComponent,
    ProfilesComponent,
    ProfileEditComponent,
    DropdownComponent,
    LoadingComponent,
    AssignmentsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SHGridModule,
    RouterModule,
    AngularFontAwesomeModule,
    HttpClientModule
  ],
  providers: [StateService, NavigationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
