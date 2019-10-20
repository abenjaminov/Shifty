import {Component, forwardRef, Inject, Input, OnInit} from '@angular/core';
import {Event, NavigationEnd, Router} from "@angular/router";
import {AuthenticationService} from "../../services/authentication.service";

export class SidebarItem {
  public isSelected?: boolean = false;
  public icon:string;
  constructor(public text:string,public link: string) {

  }
}

@Component({
  selector: 'sh-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit{
  @Input() items: SidebarItem[];
  selectedItem:SidebarItem;

  constructor(private router: Router, private authenticationService: AuthenticationService) {
    this.items = [
      { text: "Home",link: "/home", isSelected : false, icon: "home" },
      { text: "Profiles",link: "/profiles", isSelected : false, icon: "user" },
      { text: "Conditions",link: "/conditions", isSelected: false, icon: "question" },
      //{ text: "Settings",link: "/settings", isSelected: false, icon: "cog" }
      ];

    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        var navigationEndEvent = event as NavigationEnd;

        this.selectItemByUrl(navigationEndEvent.urlAfterRedirects)
      }
    })
  }

  ngOnInit() {
    this.selectItemByUrl(this.router.url)
  }

  selectItemByUrl(url:string) {
    for (let i = 0; i< this.items.length; i++)
    {
      var item = this.items[i];

      if(item.link == url) {
        this.itemClicked(item);
        break;
      }
    }
  }

  itemClicked(item: SidebarItem) {
    this.items.forEach(i => {
      i.isSelected = false;
    });

    item.isSelected = true;
  }

  onLogoutClicked() {
    this.authenticationService.logout(true, "user logged out");
  }
}
