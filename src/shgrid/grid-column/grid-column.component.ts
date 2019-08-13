import {Component, Input, OnInit} from '@angular/core';

export class ShCellInfo {
  public text!:string;
}

export class ShGridColumn {
  public header: ShCellInfo;
  public cellInfos: Array<ShCellInfo> = [];
}

@Component({
  selector: 'sh-grid-column',
  templateUrl: './grid-column.component.html',
  styleUrls: ['./grid-column.component.scss']
})
export class GridColumnComponent implements OnInit {

  @Input() columnSource: ShGridColumn;

  constructor() { }

  ngOnInit() {
  }
}
