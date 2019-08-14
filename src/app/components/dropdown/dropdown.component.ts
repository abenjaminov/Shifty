import { Component, OnInit } from '@angular/core';
import { Observable, Subscriber, Observer, fromEvent } from 'rxjs';

@Component({
  selector: 'sh-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  searchText:string;
  search$: Observable<any>;

  constructor() { }

  ngOnInit() {
    
  }

  onChange($event) {
    this.searchText = $event.target.value;
  }
}
