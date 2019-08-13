import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'sh-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  @Input() hasActions:boolean;

  constructor() { }

  ngOnInit() {
  }

}
