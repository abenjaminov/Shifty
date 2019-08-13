import {Component, Input, OnInit} from '@angular/core';

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

  constructor() { }

  ngOnInit() {
  }

  itemClicked(item: SidebarItem) {
    this.items.forEach(i => {
      i.isSelected = false;
    });

    item.isSelected = true;
  }
}
