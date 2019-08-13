import { Component, OnInit } from '@angular/core';
import { ShGridColumn } from 'src/shgrid/grid-column/grid-column.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private columns: ShGridColumn[];

  constructor() { 
    this.columns = [{
      header: { text:"Name" },
      cellInfos: [{ text:"Asaf Benjaminov" }]
    },{
      header: { text:"Professions" },
      cellInfos: [{ text:"Senior" }]
    }]
  }

  ngOnInit() {
  }

}
