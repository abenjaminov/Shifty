import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {ProfilesComponent} from "./components/profiles/profiles.component";


const routes: Routes = [{
  path:"home",
  component: HomeComponent
}, {
  path: "",
  redirectTo: '/home',
  pathMatch: 'full'
}, {
  path: "profiles",
  component: ProfilesComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
