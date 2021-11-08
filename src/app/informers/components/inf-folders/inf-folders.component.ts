import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebApiCallsService } from 'src/app/core/services/web-api-calls.service';
import { IKeyValue } from 'src/app/shared/Interfaces/ikey-value.interface';

@Component({
  selector: 'inf-folders',
  templateUrl: './inf-folders.component.html',
  styleUrls: ['./inf-folders.component.scss'],
  providers: [     
    {       provide: NG_VALUE_ACCESSOR, 
            useExisting: forwardRef(() => InfFoldersComponent),
            multi: true     
    } ,
    {
      provide: NG_VALIDATORS, 
      useExisting: InfFoldersComponent, 
      multi: true
    }  
  ]
})
export class InfFoldersComponent implements OnInit, ControlValueAccessor, Validators {

  @Input() infId: string;
  allFolders: IKeyValue[];
  selectedFolders : IKeyValue[];
  selectedFolders$ : BehaviorSubject<IKeyValue[]>;
  form: FormGroup;

  alphaBetLetters : 'אבגדהוזחטיכלמנסעפצקרשת';

  constructor(
    private callWebApiService: WebApiCallsService,
    private formBuilder: FormBuilder ) { 
  }

  setFolders(): void {
    this.form.get("folders").setValue(this.selectedFolders); 
    this.selectedFolders$ = new BehaviorSubject<IKeyValue[]>(this.selectedFolders);
  }

  onChange: any = () => {}
  onTouch: any = () => {}
  val= ""

  set value(val){
    if( val !== undefined && this.val !== val){
      this.val = val
      this.onChange(val)
      this.onTouch(val)
    }   
  }

  writeValue(value: any): void {
    this.value = value
  }

  registerOnChange(fn: any){
    this.onChange = fn
  }

  registerOnTouched(fn: any){
    this.onTouch = fn
  }

  // Implementation of Validator
  validate(control: FormControl): ValidationErrors | null {
    if (this.selectedFolders?.length == 0)
      return { required : true }  
    return null;
  }

  ngOnInit(): void {
    this.getAllFolders();
    this.getInfFolders();
    this.form = this.formBuilder.group({     
      folders:  new FormControl([]),
    })
  }

  compareFolders(f1: IKeyValue, f2: IKeyValue): boolean {
    return f1.value === f2.value && f1.key === f1.key;
  }

  removeFolder(code) {
    const temp: IKeyValue[] = this.selectedFolders$.value.filter(option => option.key != code)
    this.selectedFolders$.next(temp);
    this.form.get("folders").setValue(temp);
  }

  attachFolder() {
    this.selectedFolders$.next(this.form.get('folders').value);
  }

  getAllFolders(): void {
   this.callWebApiService.postHttpCall('get/folders',0)
    .pipe(map(res=>res as IKeyValue[]))
    .subscribe( data => {
        this.allFolders = data;
      },
      error => { console.log(error) }
    );
  }

  getInfFolders(infID = this.infId): void {
      this.callWebApiService.postHttpCall('get/infFolders?id=', 0, this.infId)
      .pipe(map(res=>res as IKeyValue[]))
      .subscribe( data => {
          this.selectedFolders = data;
          this.setFolders(); 
        },
        error => { console.log(error) }
      );
   }
}



