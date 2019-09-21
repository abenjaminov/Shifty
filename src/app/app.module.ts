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
import { ConditionsComponent } from './components/conditions/conditions.component';
import { ToggleComponent } from './components/toggle/toggle.component'
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatButtonModule} from "@angular/material/button";
import { AbsentComponent } from './components/absent/absent.component';
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";

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
    ConditionsComponent,
    ToggleComponent,
    AbsentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SHGridModule,
    RouterModule,
    AngularFontAwesomeModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatButtonModule,
    MatBottomSheetModule
  ],
  entryComponents: [AbsentComponent],
  providers: [StateService, NavigationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
