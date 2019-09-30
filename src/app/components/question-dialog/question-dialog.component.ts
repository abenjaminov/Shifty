import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

export class QuestionDialogData {
  title:string;
  question:string;
  answer:boolean;
}

@Component({
  selector: 'sh-question-dialog',
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss']
})
export class QuestionDialogComponent {

  constructor(
      public dialogRef: MatDialogRef<QuestionDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: QuestionDialogData) {}

  onNoClick(): void {
    this.dialogRef.close(this.data.answer);
  }
}
