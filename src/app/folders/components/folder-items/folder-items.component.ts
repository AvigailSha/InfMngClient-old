import { DataSource } from '@angular/cdk/collections';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { WebApiCallsService } from 'src/app/core/services/web-api-calls.service';
import { IKeyValue } from 'src/app/shared/Interfaces/ikey-value.interface';
import { Validation } from 'src/app/shared/validations.class';

@Component({
  selector: 'app-folder-items',
  templateUrl: './folder-items.component.html',
  styleUrls: ['./folder-items.component.scss']
})
export class FolderItemsComponent implements OnInit {
  folder: IKeyValue;
  folderItems: IKeyValue[];
  NonFolderItems: IKeyValue[];
  DeletedItems: string[];
  NewItems: string[];

  //newItem : string = "" ;
  newFolder : string = "" ;
  updateItem: string = "";

  filteredOptions: Observable<IKeyValue[]>;

  validItem = false;
  errorMessage = '';
  Save:boolean = false;
  
  constructor(
    private callWebApiService: WebApiCallsService, 
    private dialogRef: MatDialogRef<FolderItemsComponent>,
    @Inject(MAT_DIALOG_DATA) ddata : IKeyValue) {
      this.folder = ddata;
      this.newFolder = "";   
    }

  ngOnInit(): void {
    if (this.folder) {
      this.getFolderItems();
    }
    this.DeletedItems = [];
    this.NewItems = [];
  }

  private _filter(value: string): IKeyValue[] {
    const filterValue = value.toLowerCase();
    return this.NonFolderItems.filter(option => option.value.toLowerCase().includes(filterValue));
  }

  newFolderFormControl: FormControl = new FormControl(this.newFolder,[
    Validators.minLength(3),
    Validators.maxLength(150)
  ]) ;

  itemControl: FormControl = new FormControl('',[
    Validation.ValidateMatch
  ]) ;
  

  clearSelect() {
    this.itemControl.setValue('');
  }

  addItem(item: FormControl) {
      this.folderItems.push(
      this.NonFolderItems.splice(
      this.NonFolderItems.findIndex(x => x.key === item.value.key),1)[0]);
      this.NewItems.push(item.value.key);

  }

  removeItem(option: IKeyValue) {
    this.folderItems.splice(this.folderItems.findIndex(x => x.key === option.key),1); 
    this.DeletedItems.push(option.key as string);
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  
  getFolderItems(){
    this.callWebApiService.postHttpCall('get/folderItems',0,"?id=" +  this.folder.key.toString())
    .pipe(map(res=>res as IKeyValue[]))
    .subscribe( data => {
      this.folderItems = data;
      },
      error=>{return},
      () => {this.getAllItems();} )    
  }

  getAllItems(){
    this.callWebApiService.postHttpCall('get/items',0)
    .pipe(map(res=>res as IKeyValue[]))
    .subscribe( data => {  
      this.NonFolderItems = data;
    },
      error=>{},
      ()=>{this.filterItemNotInFolder();})
      ;
  }

  filterItemNotInFolder(){
    var filtered = this.NonFolderItems.filter(
      item => !this.folderItems.some(item1 => item1.key === item.key));
    this.NonFolderItems = filtered;


    this.filteredOptions = this.itemControl.valueChanges.pipe(
      startWith(''),
      map(val => typeof val === 'string' ? val : val.value),
      map(name => name ? this._filter(name) : this.NonFolderItems.slice())
    );
  }

  displayFn(item: IKeyValue): string {
    return item && item.value ? item.value : '';
  }

  save() {
    if (this.DeletedItems.length > 0) {
      this.callWebApiService.postHttpCall('delete/items',
        {items:this.DeletedItems.toString(), folderId:this.folder.key}).pipe(
          map(res => (res as boolean))
        ).subscribe(
          data=> this.SaveDeleteSucceeded(data),
          error=>{this.setError(error)}
          //(res)=>this.SaveAlert(res)
        )
    }
    if (this.NewItems.length > 0) {
      this.callWebApiService.postHttpCall('post/items',
      {items:this.NewItems.toString(), folderId:this.folder.key}).pipe(
        map(res => (res as boolean))
        ).subscribe(
          data=> this.SaveAddSucceeded(data),
          error=>{this.setError(error);},
        //()=>this.SaveAlert()
        )
    } 
    
  }

  SaveDeleteSucceeded(data: boolean) {
    if (data) {
      this.DeletedItems = [];      
    }
    this.SaveAlert(data);
  }

  SaveAddSucceeded(data) {
    if (data) {
      this.NewItems = [];
      this.close();
    }
    this.SaveAlert(data);    
    
  }

  SaveAlert(IsSuccess: boolean){
    IsSuccess==true?alert('הנתונים עודכנו בהצלחה!'):alert('שגיאה בקליטת הנתונים, יש לפנות לממונים!');
  }

  close() {
      this.dialogRef.close();
  }

  setError(error){
    console.log(error);
  }

  saveNewFolder() {
    this.callWebApiService.postHttpCall('post/folder',0,"?name=" + this.newFolder)
    .pipe(map(res=>res as number))
    .subscribe( data => {
        if (data == -1)
        {
          alert('בעיה בהוספת פולדר')
        }
        else {
          //const f: IKeyValue = { value: this.newFolder, key: data };
          this.folder = 
          
          { value: this.newFolder, key: data };
          this.ngOnInit();
        }
      error=>{ return error;}})
      ;   
  }
}

