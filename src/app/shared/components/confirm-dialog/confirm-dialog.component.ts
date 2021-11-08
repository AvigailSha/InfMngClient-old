import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  ngOnInit(): void {
  }

  constructor( @Inject(MAT_DIALOG_DATA) public data: {
      cancelText: string,
      confirmText: string,
      closeText: string,
      closeIcon: boolean,
      message: string,
      title: string
    }, private mdDialogRef: MatDialogRef<ConfirmDialogComponent>){}

  public cancel() {
    this.mdDialogRef.close(false);
  }

  public close(value) {
    this.mdDialogRef.close(null);
  }

  public confirm() {
    this.mdDialogRef.close(true);
  }

  @HostListener("keydown.esc") 
  public onEsc() {
    this.close(false);
  }

}
