import { state } from '@angular/animations';
import { KeyValue } from '@angular/common';
import { JsonpClientBackend } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { WebApiCallsService } from 'src/app/core/services/web-api-calls.service';
import { IKeyValue } from 'src/app/shared/Interfaces/ikey-value.interface';
import { FolderItemsComponent } from '../folder-items/folder-items.component';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit {

  newItem: string = '' ;
  updateItem: string = '';
  foldersListOb : Observable<IKeyValue>[];
  foldersList : IKeyValue[];
  //filteredOptions: Observable<IKeyValue[]>;
  searchText: string = "";

  display : boolean[];
  lastRow : number = -1;

  updateItemFormControl: FormControl = new FormControl('',[
    Validators.minLength(3),
    Validators.maxLength(150)
  ]) ;

  folderControl: FormControl = new FormControl('',[
  
  ]) ;

  displayFn(item: IKeyValue): string {
    return item && item.value ? item.value : '';
  }
  constructor(
    private callWebApiService: WebApiCallsService,
    private dialog: MatDialog,
    private store: Store) { }

  ngOnInit(): void {
    

    this.getFoldersFromServer();
  }

  /*if (store.getState().productsState.products.length === 0) {
    const products = await this.http.get<ProductModel[]>(environment.productsUrl).toPromise();
    store.dispatch(productsDownloadedAction(products));
}
return store.getState().productsState.products;*/
  
  getFoldersFromServer() { 
    
    this.callWebApiService.postHttpCall('get/folders',0)
    .pipe(map(res=>res as IKeyValue[]))
    .subscribe( data => {
        this.foldersList = data;
        //this.fillFilteredOptions()
        this.display = this.foldersList.map(u => false);
      },
      error => { console.log(error); }
    );
  }

 /*  fillFilteredOptions() {
    this.filteredOptions = this.folderControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.value),
      map(name => name ? this._filter(name) : this.foldersList.slice())
    );
  } */

  private _filter(value: string): IKeyValue[] {
    const filterValue = value.toLowerCase();
    return this.foldersList.filter(option => option.value.toLowerCase().includes(filterValue));
  }

  openItemsDialog(folder = null) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = false;
  
     // dialogConfig.borderRadius: 0;
     
      dialogConfig.data = folder;
  
      const dialogRef = this.dialog.open(FolderItemsComponent, dialogConfig);    
  }

  changeItem(folderID: number){
    let folder = this.foldersList.find(fold => fold.key == folderID);
    folder.value = this.updateItem;
    //this.foldersList[i].value = this.updateItem ;
    this.updateItem = '';
    this.updateFolderAtServer(folder);
  }

  deleteFolder(folderCode: number) {
    this.hasInformers(folderCode);
  }

  updateFolderAtServer(folder: IKeyValue) {
      this.callWebApiService.postHttpCall('put/folder', folder)
        .subscribe( data => {
            if(data)
              this.foldersList.splice(this.foldersList.findIndex(x => x.key === folder.key),1);
            else
              alert("עדכון השם נכשל");             
          },
          error=>{ alert("עדכון השם נכשל"); }
        );
  }

  deleteFolderAtServer(folderId: number) {
    this.callWebApiService.postHttpCall('delete/folder',0,"?id=" + folderId.toString())
    .pipe(map(res=>res as IKeyValue[]))
    .subscribe( data => {
        if(data) {
          this.foldersList.splice(this.foldersList.findIndex(x => x.key === folderId),1); 
          alert("המחיקה התבצעה בהצלחה");
        }
        else
          alert("המחיקה נכשלה");
      },
      error=>{ 
        alert("המחיקה נכשלה");
      }
    );
  }    

  hasInformers(folderId: number): void {
    this.callWebApiService.postHttpCall('get/numInf',0,"?id=" + folderId.toString())
    .pipe(map(res=>res as number))
    .subscribe( data => {
        if (data == 0) {      
          this.deleteFolderAtServer(folderId);
        }
        else {
          alert("אין אפשרות למחוק פולדר מאחר שמשויכים אליו " + data +" מדווחים")
        }
      },
      error=>{ console.log(error) }
    );
  }

  openEdit(i: number, folder: IKeyValue){
    this.display[this.lastRow] = false;
    this.lastRow = i;
    this.display[i] = true; 
    this.updateItem=folder.value;
  }

  clearSelect() {
    this.folderControl.setValue('');
  }

  clearFilter() {
    this.searchText = "";
  }
  
}

