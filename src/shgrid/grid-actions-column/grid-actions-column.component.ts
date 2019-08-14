import {Component, Input, OnInit} from '@angular/core';
import {ShCellInfo} from "../grid-column/grid-column.component";

export class GridAction {
  icon:string;
  action: Function;
}

export class ActionCellInfo {
  actions: GridAction[] = [];
}

export class ShGridActionColumn {
  public header: ShCellInfo;
  public cellInfos: Array<ActionCellInfo> = [];
}

@Component({
  selector: 'sh-grid-actions-column',
  templateUrl: './grid-actions-column.component.html',
  styleUrls: ['../grid-column.scss']
})
export class GridActionsColumnComponent {

  @Input() columnSource: ShGridActionColumn;

  constructor() { }

}
