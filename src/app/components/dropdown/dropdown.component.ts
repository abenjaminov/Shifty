import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Observable, Subscriber, Observer, fromEvent } from 'rxjs';

export class DropdownOption {
  id: string;
  name:string;
}

@Component({
  selector: 'sh-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  isOpen:boolean;
  searchText:string;
  search$: Observable<any>;
  @Input() selectedOption: DropdownOption;
  @Output() selectedOptionChange: EventEmitter<DropdownOption> = new EventEmitter<DropdownOption>();

  @Input() options: DropdownOption[] = [];


  constructor() { }

  ngOnInit() {
    
  }

  onChange($event) {
    this.searchText = $event.target.value;
  }

  onOpenClicked() {
    this.isOpen = !this.isOpen;
  }

  onOptionClicked(option:DropdownOption) {
    this.selectedOption = option;
    this.selectedOptionChange.emit(this.selectedOption);

    this.isOpen = false;
  }
}
