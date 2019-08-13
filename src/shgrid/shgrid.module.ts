import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from './grid/grid.component';
import { GridColumnComponent} from './grid-column/grid-column.component';

var components = [GridComponent, GridColumnComponent]

@NgModule({
  declarations: [...components],
  imports: [
    CommonModule
  ],
  exports: [
    ...components
  ]
})
export class SHGridModule { }
