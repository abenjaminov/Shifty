import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from './grid/grid.component';
import {GridActionsColumnComponent, GridColumnComponent} from './grid-column/grid-column.component';



@NgModule({
  declarations: [GridComponent, GridColumnComponent,GridActionsColumnComponent],
  imports: [
    CommonModule
  ],
  exports: [
    GridComponent
  ]
})
export class SHGridModule { }
