import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {ProfilesComponent} from "./components/profiles/profiles.component";
import {ProfileEditComponent} from "./components/profiles/edit/profile.edit.component";
import { AssignmentsComponent } from './components/assignments/assignments.component';


const routes: Routes = [{
  path:"home",
  component: HomeComponent
}, {
  path: "",
  redirectTo: '/home',
  pathMatch: 'full'
}, {
  path: "profiles",
  children :[
    {
      path: '',
      component: ProfilesComponent,
    },
    {
      path: ':id',
      component: ProfileEditComponent
    }
  ]
}, {
  path: "assignments",
  children: [
    {
      path: '',
      component: AssignmentsComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
