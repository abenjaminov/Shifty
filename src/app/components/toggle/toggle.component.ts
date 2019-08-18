import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sh-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class ToggleComponent implements OnInit {

  @Input() options: string[] = [];
  @Input() selectedOptionIndex: number = -1;
  @Output() selectedOptionIndexChange: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  toggleOptionClicked(index: number) {
    if(this.selectedOptionIndex == index) { return; }

    this.selectedOptionIndex = index;
    this.selectedOptionIndexChange.emit(index);
  }
}
