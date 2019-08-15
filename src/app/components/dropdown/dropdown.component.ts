import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Observable, Subscriber, Observer, fromEvent } from 'rxjs';

class DropdownOption {
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
  selectedOption: DropdownOption;

  @Input() options: DropdownOption[] = [];
  @Output() onSelectionChange: EventEmitter<DropdownOption> = new EventEmitter<DropdownOption>();

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
    this.onSelectionChange.emit(this.selectedOption);
  }
}
