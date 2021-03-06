import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HomeComponent } from './components/home/home.component';
import { ViewComponent } from './components/view/view.component';
import { RouterModule} from "@angular/router";
import { ProfilesComponent } from './components/profiles/profiles.component';
import { ProfileEditComponent } from './components/profiles/edit/profile.edit.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import {HttpClient, HttpClientModule} from '@angular/common/http';
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
import { LoginComponent } from './components/login/login.component';
import {FormsModule} from "@angular/forms";
import {RoomsService} from "./services/rooms.service";
import {ProfilesService} from "./services/profiles.service";
import {TagsService} from "./services/tags.service";
import {ConditionService} from "./services/conditions.service";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatDialogModule} from "@angular/material/dialog";
import { QuestionDialogComponent } from './components/question-dialog/question-dialog.component';
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {AddConditionComponent} from './components/conditions/add/add.condition.component';
import {MatIconModule} from "@angular/material/icon";
import {FaIconLibrary, FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {
    faBroom, faCalculator, faChevronDown,
    faChevronLeft,
    faChevronRight, faCog, faDotCircle, faEdit,
    faFileExcel, faHome, faMinus, faPersonBooth, faPlus, faQuestion, faSave, faSignOutAlt,
    faSnowplow,
    faTrash, faUser
} from "@fortawesome/free-solid-svg-icons";

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
    AbsentComponent,
    LoginComponent,
    QuestionDialogComponent,
    AddConditionComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        RouterModule,
        FontAwesomeModule,
        HttpClientModule,
        NoopAnimationsModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        MatTooltipModule,
        MatButtonModule,
        MatBottomSheetModule,
        FormsModule,
        MatSnackBarModule,
        MatDialogModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        MatIconModule
    ],
  entryComponents: [AbsentComponent,QuestionDialogComponent,AddConditionComponent],
  providers: [HttpClient, ProfilesService, TagsService, RoomsService, ConditionService],
  bootstrap: [AppComponent]
})
export class AppModule {
    constructor(library: FaIconLibrary) {
        library.addIcons(faSnowplow);
        library.addIcons(faTrash);
        library.addIcons(faBroom);
        library.addIcons(faFileExcel);
        library.addIcons(faChevronLeft);
        library.addIcons(faChevronRight);
        library.addIcons(faChevronDown);
        library.addIcons(faEdit);
        library.addIcons(faPlus);
        library.addIcons(faMinus);
        library.addIcons(faDotCircle);
        library.addIcons(faCalculator);
        library.addIcons(faSave);
        library.addIcons(faSignOutAlt);
        library.addIcons(faHome);
        library.addIcons(faUser);
        library.addIcons(faQuestion);
        library.addIcons(faCog);
    }
}
