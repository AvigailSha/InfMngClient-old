import { Component, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GetCodecsService } from 'src/app/core/services/get-codecs.service';
import { WebApiCallsService } from 'src/app/core/services/web-api-calls.service';
import { findDialogMode } from 'src/app/shared/general.enums';
import { IKeyValue } from 'src/app/shared/Interfaces/ikey-value.interface';
import { Validation } from 'src/app/shared/validations.class';
import { Informer } from '../../models/informer.model';

@Component({
  selector: 'app-find-new-informer',
  templateUrl: './find-new-informer.component.html',
  styleUrls: ['./find-new-informer.component.scss']
})
export class FindNewInformerComponent implements OnInit {

  filteredGeogr: Observable<IKeyValue[]>;
  filteredEcoBranch: Observable<IKeyValue[]>;
  filteredColCenter: Observable<IKeyValue[]>;
  filteredBusinessLayer: Observable<IKeyValue[]>;

  currentInf: Informer;
  @Input() curInfId : number;
  @Input() mode: number = findDialogMode.SWAP;

  public breakpoint: number; // Breakpoint observer code
  public findInfForm: FormGroup;
  
  constructor(
    private dataService: WebApiCallsService, 
    private formBuilder: FormBuilder,
    private getCodescService: GetCodecsService) { 
  }

  get GeogrControl() { return this.findInfForm.get("GeogrControl") as FormControl; }
  get EconomyBranchControl() { return this.findInfForm.get("EconomyBranchControl") as FormControl; }
  get BusinessLayerControl() { return this.findInfForm.get("BusinessLayerControl") as FormControl; }
  get ColCenterControl() { return this.findInfForm.get("ColCenterControl") as FormControl; }

  ngOnInit(): void {
    this.dataService.postHttpCall('get/informer?id=', 0, this.curInfId.toString())
    .subscribe( 
      (data: Informer) => {
        this.currentInf = data;    
      },
      error => console.log(error),
      () => this.setDefaultValues()
    ) 

    this.findInfForm = this.formBuilder.group({
      GeogrControl: ['',[Validation.ValidateMatch]] ,
      EconomyBranchControl: ['', [Validators.required, Validation.ValidateMatch]],
      BusinessLayerControl: ['', [Validators.required, Validation.ValidateMatch]],
      ColCenterControl: ['', [Validators.required, Validation.ValidateMatch]],
    });

    this.InitfilterGeogr();
    this.InitfilterEcobrach();
    this.InitfilterColCenter();
    this.InitfilterBusinessLayer();    
  }

  setDefaultValues() {
    this.findInfForm.get("GeogrControl").setValue(
      this.getCodescService.getKeyValue('town',this.currentInf.townId));
    this.findInfForm.get("EconomyBranchControl").setValue(
      this.getCodescService.getKeyValue('economyBranch',this.currentInf.economyBranchId));
    this.findInfForm.get("BusinessLayerControl").setValue(
      this.getCodescService.getKeyValue('businessLayer',this.currentInf.businessLayerId));
    this.findInfForm.get("ColCenterControl").setValue(
      this.getCodescService.getKeyValue('colMethod',this.currentInf.colMethodId));
  }

  clearSelect(ctrl: FormControl) {
    ctrl.setValue('');
  }

  displayFn(KeyValue: IKeyValue): string {
    return KeyValue && KeyValue.value ? KeyValue.value : '';
  }

  // tslint:disable-next-line:no-any
  public onResize(event: any): void {
    this.breakpoint = event.target.innerWidth <= 600 ? 1 : 2;
  }

  private markAsDirty(group: FormGroup): void {
    group.markAsDirty();
    // tslint:disable-next-line:forin
    for (const i in group.controls) {
      group.controls[i].markAsDirty();
    }
  }

  InitfilterGeogr(){
    this.filteredGeogr = this.GeogrControl.valueChanges
    .pipe(
      startWith(''),
      map(val => typeof val === 'string' ? val : val.value),
      map(val => this._filter(this.getCodescService.getCollection('town') ,val))
    );
  }

  InitfilterEcobrach(){
    this.filteredEcoBranch = this.EconomyBranchControl.valueChanges
    .pipe(
      startWith(''),
      map(val => typeof val === 'string' ? val : val.value),
      map(val => this._filter(this.getCodescService.getCollection('economyBranch') ,val))
    );
  }

  InitfilterColCenter(){
    this.filteredColCenter = this.ColCenterControl.valueChanges
    .pipe(
      startWith(''),
      map(val => typeof val === 'string' ? val : val.value),
      map(val => this._filter(this.getCodescService.getCollection('colMethod') ,val))
    );
  }
 
  InitfilterBusinessLayer(){
    this.filteredBusinessLayer = this.BusinessLayerControl.valueChanges
    .pipe(
      startWith(''),
      map(val => typeof val === 'string' ? val : val.value),
      map(val => this._filter(this.getCodescService.getCollection('businessLayer') ,val))
    );
  }
  
  private _filter(options: IKeyValue[] ,value: string): IKeyValue[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.value.toLowerCase().includes(filterValue));
  }

  isSwapMode() {
    return this.mode == findDialogMode.SWAP;
  }

}
