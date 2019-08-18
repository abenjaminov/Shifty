import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from './grid/grid.component';
import { GridColumnComponent} from './grid-column/grid-column.component';
import { GridActionsColumnComponent } from './grid-actions-column/grid-actions-column.component';
import {AngularFontAwesomeModule} from "angular-font-awesome";

var components = [GridComponent, GridColumnComponent,GridActionsColumnComponent]

@NgModule({
  declarations: [...components],
    imports: [
        CommonModule,
        AngularFontAwesomeModule
    ],
    exports: [
        ...components,
    ]
})
export class SHGridModule { }
