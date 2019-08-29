import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {ProfilesComponent} from "./components/profiles/profiles.component";
import {ProfileEditComponent} from "./components/profiles/edit/profile.edit.component";
import { ConditionsComponent } from './components/conditions/conditions.component';


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
  path: "conditions",
  children: [
    {
      path: '',
      component: ConditionsComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
