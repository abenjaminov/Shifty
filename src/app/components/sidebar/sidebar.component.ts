import {Component, forwardRef, Inject, Input, OnInit} from '@angular/core';
import {Event, NavigationEnd, Router} from "@angular/router";

export class SidebarItem {
  public isSelected?: boolean = false;
  constructor(public text:string,public link: string) {

  }
}

@Component({
  selector: 'sh-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() items: SidebarItem[];
  selectedItem:SidebarItem;

  constructor(@Inject(forwardRef(() => Router)) private router: Router) {
    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        var navigationEndEvent = event as NavigationEnd;

        for (let i = 0; i< this.items.length; i++)
        {
          var item = this.items[i];

          if(item.link == navigationEndEvent.urlAfterRedirects) {
            this.itemClicked(item);
            break;
          }
        }
      }
    })
  }

  ngOnInit() {
    this.items = [
        { text: "Home",link: "/home", isSelected : false },
      { text: "Profiles",link: "/profiles", isSelected : true },
      { text: "Conditions",link: "/conditions" }];

  }

  itemClicked(item: SidebarItem) {
    this.items.forEach(i => {
      i.isSelected = false;
    });

    item.isSelected = true;
  }
}
