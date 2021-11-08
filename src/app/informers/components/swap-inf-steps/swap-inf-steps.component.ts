import { Component, Inject, OnInit, ViewChild,AfterViewInit  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
//import { MatHorizontalStepper, MatStepper } from '@angular/material/stepper';
import { map } from 'rxjs/operators';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { WebApiCallsService } from 'src/app/core/services/web-api-calls.service';
import { requestResult, swapStepperCloseResult } from 'src/app/shared/general.enums';
import { IKeyValue } from 'src/app/shared/Interfaces/ikey-value.interface';

@Component({
  selector: 'app-swap-inf-steps',
  templateUrl: './swap-inf-steps.component.html',
  styleUrls: ['./swap-inf-steps.component.scss']
})
export class SwapInfStepsComponent implements OnInit, AfterViewInit {

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  foldersFormGroup: FormGroup;
  findMethodFormGroup: FormGroup;
  forthFormGroup: FormGroup; 
  
  curInfId : number;
  currentInfName : string;
  currStep: number;
  disable1st: boolean;
  selectedAction : number = -1;

  area : number = 0;

  @ViewChild('stepper') stepper: MatStepper;
  
  constructor(
    private _formBuilder: FormBuilder,
    private callWebApiService: WebApiCallsService,
    private dialogService: ConfirmDialogService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<SwapInfStepsComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData) { 
      this.curInfId = dialogData.inf;
      this.currStep = dialogData.startStep;
      this.disable1st = this.currStep != 0;
    }

  closeStepper(): void {
    const options = {
      title: '',
      message: 'לחיצה על אישור תגרום לביטול התהליך',
      cancelText: 'ביטול',
      closeText: '',
      confirmText: 'אישור',
      closeIcon: false
    };
    this.dialogService.open(options);
    this.dialogService.confirmed().subscribe(confirmed => {
      if (confirmed === true ) {
         this.dialogRef.close(swapStepperCloseResult.CANCEL);
      }
      else if (confirmed === false) {
      
      }
    });
  }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      radioCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      radioCtrl: ['', Validators.required]
    });
    this.foldersFormGroup = this._formBuilder.group({
      foldersCtrl: ['',Validators.required]
    });
    this.findMethodFormGroup = this._formBuilder.group({
      radioCtrl: ['', Validators.required]
    });
    this.forthFormGroup = this._formBuilder.group({
      radioCtrl: ['', Validators.required]
    });

  }

  ngAfterViewInit() {
   /*  if (this.startStep > 0 ) {
      this.stepper.selectedIndex = this.startStep;
    } */
  }

  swapNoFind() {
    this.callWebApiService.postHttpCall('put/infStatus',0,"?id=" + this.curInfId)
    .subscribe( 
      data => { 
        /* this.dataSource.data.find( d => d.infInformerID ==  infId).infInfActivityID =
        infActivityCode.WAIT;
        this.dataSource.data.find( d => d.infInformerID ==  infId).activityName = 
        this.CodesService.getValue('infStatus',infActivityCode.WAIT); */
        this.UpdateInformerEditCheckDone();
      },   
      error => {
        this.SwapAlert(requestResult.FAILED)
      }
    );

    this.dialogRef.close(swapStepperCloseResult.NO_FIND);
  }

  continueCol() {
    this.UpdateInformerEditCheckDone();
    this.dialogRef.close(swapStepperCloseResult.CONTINUE);
  }

  UpdateInformerEditCheckDone() {
    this.callWebApiService.postHttpCall('put/checkDone',0,"?id=" + this.curInfId).subscribe( 
      data => { });
  }

  SwapAlert(result: number)  {
    //future -  SaveAlert(result: number,ErrorCode='',SuccesCode='')
    result == requestResult.FAILED ?
    alert('עדכון סטטוס מדווח נכשל ') : alert('עדכון סטטוס מדווח עבר בהצלחה')  
  }

  nextMethod() {
    console.log(this.area);
  }

  checkSkip() {
    if (this.area == 1) {
      this.stepper.linear = false;
      this.stepper.selected.editable = false;
      this.stepper.selectedIndex = this.stepper.selectedIndex + 1;
    }
  }

  checkFolders() {
    //this.stepper.linear = false;
    this.callWebApiService.postHttpCall('get/infFolders',0,"?id=" + this.curInfId)
    .pipe(map( res => res as IKeyValue[])).subscribe( 
      data => {
          if (data.length > 0) {
            //this.stepper.selectedIndex = 3;

            //return false;
          }
          else {
            const options = {
              title: '',
              message: 'אין פולדרים המשויכים למדווח המוחלף. על מנת להמשיך בתהליך יש לשייך פולדרים למדווח',
              cancelText: '',
              closeText: '',
              confirmText: 'אישור',
              closeIcon: false
            };
            this.dialogService.open(options);
            this.dialogService.confirmed().subscribe(confirmed => {
             
               });
        
          }
       });
  }
}

