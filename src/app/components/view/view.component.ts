import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sh-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  @Input() titleText:string;

  constructor() { }

  ngOnInit() {
  }

}
