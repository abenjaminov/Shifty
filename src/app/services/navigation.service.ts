import {forwardRef, Inject, Injectable} from '@angular/core';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(@Inject(forwardRef(() => Router)) private router: Router) { }

  navigateIn(path: string) {
    this.router.navigate([this.router.url, `${path}`]);
  }

  navigateTo(path: string) {
    this.router.navigate([`${path}`]);
  }
}
