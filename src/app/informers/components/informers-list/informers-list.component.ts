import { AfterViewInit, Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { map, startWith, tap } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { merge, Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
//import { MatTableFilter } from 'mat-table-filter';
import { Subject } from 'rxjs';
import { HostListener } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FindNewInformerComponent } from '../find-new-informer/find-new-informer.component';
import { findDialogMode, infActivityCode, requestResult, swapStepperCloseResult } from 'src/app/shared/general.enums';
import { KeyValuePipe } from '@angular/common';
import { WebApiCallsService } from 'src/app/core/services/web-api-calls.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { Informer } from '../../models/informer.model';
import { GetCodecsService } from 'src/app/core/services/get-codecs.service';
import { InformersDetailsComponent } from '../informers-details/informers-details.component';
import { SwapInfStepsComponent } from '../swap-inf-steps/swap-inf-steps.component';
import { InformerDataSource } from 'src/app/core/services/informer.datasource';
import { InformerService } from 'src/app/core/services/informer.service';

@Component({
  selector: 'app-informers-list',
  templateUrl: './informers-list.component.html',
  styleUrls: ['./informers-list.component.scss']
})
export class InformersListComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  displayedColumns : string[] =  ['id', 'name', 'activityStatus', 'economyBranch',
    'businessLayer', 'town','district', 'findIcon', 'swapIcon', 'detailsIcon'];
  displayedSearchColumns : string[] = ['infInformerIDSearch', 'infNameSearch','activityNameSearch','EconomyBranchNameSearch','BusinessLayerNameSearch','Details'];
  //dataSource : MatTableDataSource<Informer>;
  dataSource: InformerDataSource;
  showInactive : boolean;
  selection = new SelectionModel<Informer>(true, []);
  myControl = new FormControl();
  public filterEntity: Informer;
  //filterType: MatTableFilter;
  IsSuccess = new Array<boolean>();
  filterSelectObj;
  filterValues = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private informerService: InformerService,
    private callWebApiService: WebApiCallsService,
    private codesService: GetCodecsService,
    private dialogService: ConfirmDialogService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder
  ) { 
    this.filterSelectObj = [
      {
        name: 'id',
        columnProp: 'idFilter',
        collection: '',
        options: [],
        filteredOptions: new Observable<string>() ,
        title: "מס' מדווח",
        colWidth: "10%"
      }, {
        name: 'name',
        columnProp: 'nameFilter',
        collection: '',
        options: [],
        filteredOptions: new Observable<string>(),
        title: "שם מדווח",
        colWidth: "15%"
      }, {
        name: 'activityStatusId',
        columnProp: 'statusFilter',
        collection: 'infStatus',
        options: [],
        filteredOptions: new Observable<string>(),
        title: "סטטוס",
        colWidth: "10%"

      },  {
        name: 'economyBranchId',
        columnProp: 'EBFilter',
        collection: 'economyBranch',
        options: [],
        filteredOptions: new Observable<string>(),
        title: "ענף כלכלי",
        colWidth: "15%"
      },
      {
        name: 'businessLayerId',
        columnProp: 'BLFilter',
        collection: 'businessLayer',
        options: [],
        filteredOptions: new Observable<string>(),
        title: "שכבת עסקים",
        colWidth: "15%"
      },
      {
        name: 'townId',
        columnProp: 'townFilter',
        collection: 'town',
        options: [],
        filteredOptions: new Observable<string>(),
        title: "ישוב",
        colWidth: "10%"
      },
      {
        name: 'districtId',
        columnProp: 'districtFilter',
        collection: 'district',
        options: [],
        filteredOptions: new Observable<string>(),
        title: "מרחב",
        colWidth: "10%"
      },
      {
        name: 'findIcon',
        collection: '',
        options: [],
        title: "",
        colWidth: "5%"
      },
      {
        name: 'swapIcon',
        collection: '',
        options: [],
        title: "",
        colWidth: "5%"
      },
      {
        name: 'detailsIcon',
        collection: '',
        options: [],
        title: "",
        colWidth: "5%"
      }
    ]
  }

  ngOnInit(): void {
    this.showInactive = false;
    this.filterEntity = <Informer>{};
    //this.filterType = MatTableFilter.ANYWHERE; // ask avigail what is mean
    //this.dataSource = new MatTableDataSource<Informer>();
    this.dataSource = new InformerDataSource(this.informerService);
    this.dataSource.loadInformers();   
    //this.getServerData();
    this.displayedSearchColumns = [];
    this.form = new FormGroup({});
    this.filterSelectObj.forEach(element => {
      this.form.addControl(element.columnProp,new FormControl());      
    });
    this.form.addControl("test",new FormControl());
  }

  ngAfterViewInit() {
    this.filterSelectObj.forEach((element,index) => {
      this.initFilter(index)
    });

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
        tap(() => this.loadInformersSlice())
    )
    .subscribe();

    /*this.dataSource.paginator = this.paginator;
    this.sort.disableClear = true;
    this.dataSource.sort = this.sort;*/

  }

  loadInformersSlice() {
    this.informerService.setInformersParams(this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
  }

  clearSelect(ctrl) {
    ctrl.setValue('');
  }

  initFilter(i) {
    let currObj = this.filterSelectObj[i];
    currObj.filteredOptions = this.form.controls[currObj.columnProp].valueChanges.pipe(
    startWith(''),
    //map(value => typeof value === 'string' ? value : value.nHebrewName),
    map(name => name ? this._filter(i,name.toString()) : this.filterSelectObj[i].options.slice())
    );
  }

  OnChangeInactive(checked: boolean){
    //TD: add this option to observable data stream service
    //this.getServerData(checked);
  }

  private _filter(f,value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.filterSelectObj[f].options.filter(option => option.toLowerCase().includes(filterValue));
  }

  applyWidthStyle(width) {
    const styles = {'width' : width};
    return styles;
  }

  applyTextStyle(color) {
    const styles = {'color' : color};
    return styles;
  }

  applyRowTextClass(colorName) {
    return ('color-row-'+ colorName); 
  }

  refreshColor(infId: number, color: string) {
    //TD: add this update to observable data stream service
    //this.dataSource.data.find(inf => inf.id == infId).color = color;
  }

  getInputFormControlName(ctrlName){
    return ctrlName + 'Input';
  }
  
  /*getServerData(checkecd: boolean = false) { 
    let inactive: string;
    inactive = checkecd ? "1":"0";
    this.callWebApiService.postHttpCall('get/informers',0 ,"?inactive=" + inactive)
    .pipe(map(res=>res as Informer[]))
    .subscribe( data => {
        this.dataSource.data = data;  
        this.filterSelectObj.forEach(filter => {
          const filterData = data.map((informer)=> (informer[filter.name]));
          filter.options = this.getFilterOptions(filterData, filter.collection);
        });
      },
      error => { console.log(error) }
    );
  }*/

  getFilterOptions(filterdata, collectionName: string) {
    let options = [];
    //get unique values
    options = filterdata.filter((val, index, a) => a.indexOf(val) === index);
    if(options.length > 220)
      return [];
    options = options.map(o => collectionName.length > 0 ? this.codesService.getValue(collectionName, o) : o);
    options.sort();
    return options;
  }

  //TD: check if this function is necessary
  /*onSorting(sr) {
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }*/

  //TD: change it to be track by fromEvent(this.input.nativeElement,'keyup')
  // Called on Filter change
  filterChange(filter, event) {
    /*if(filter.collection.length > 0)
      this.filterValues[filter.name] = event.value ? this.codesService.getKey(filter.collection, event.value) : "";
    else
      this.filterValues[filter.name] = event.value ? event.value.trim().toLowerCase() : "";
    
    this.dataSource.filter = JSON.stringify(this.filterValues);
    this.filterSelectObj.forEach(filter => {
      const filterData = this.dataSource.filteredData.map((informer)=> (informer[filter.name]));
      filter.options = this.getFilterOptions(filterData, filter.collection);
    });   
 
    /*this.filterSelectObj.filter((o) => {
      let list = this.getFilterObject(this.dataSource.filteredData, o.name)
      o.options = list.length < 220 ? list : [];
    })*//*
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }*/
  }

  //TD: change it to be track by fromEvent(this.input.nativeElement,'keyup')
  filterInputChange(filter, event) {
    /*this.filterValues[filter.name] = event.target.value ? event.target.value.trim().toLowerCase() : "";
    this.dataSource.filter = JSON.stringify(this.filterValues)
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }*/
  }

  disableSwapButton(activity) {
    let ret = activity == infActivityCode.INACTIVE || activity == infActivityCode.WAIT ? true : null;
    return ret;
    //return activity == 5 ? false : true;  //add activity enum
  }

  swapInformer(infId: number) {
    this.callWebApiService.postHttpCall('put/infStatus',0 ,"?id=" + infId.toString())
    .subscribe( 
      data => {
        //TD: add update function at informer service 
        //this.dataSource.data.find( d => d.id == infId).activityStatusId = infActivityCode.WAIT;
        /*this.dataSource.data.find( d => d.infInformerID ==  infId).activityName = 
        this.CodesService.getValue('infStatus',infActivityCode.WAIT);*/
        this.UpdateInformerEditCheckDone(infId);
      },   
      error => {
        this.SwapAlert(requestResult.FAILED)
      }
    );

    const dialogOptions = {
      title: 'המתנה למחליף - שליחה לאיתור',
      message: 'סטטוס המדווח שונה ל"המתנה למחליף", האם ברצונך לשלוח לאיתור?',
      cancelText: 'ללא שליחה לאיתור',
      closeText: '',
      confirmText: 'שליחה לאיתור',
      closeIcon: true
    };

    this.dialogService.open(dialogOptions);
    this.dialogService.confirmed().subscribe(confirmed => {
      if (confirmed === true ) {
        this.openFindNewInformerDialog(infId) 

        /* this._snackBar.open('נשלח לאיתור', 'סגור', {
          duration: 3000, horizontalPosition : 'center'
        }); */
         
         }
         else if (confirmed === false) {
          this.openDetailsDialog(0);
         }
       });
  }

  UpdateInformerEditCheckDone(infId: number) {
    this.callWebApiService.postHttpCall('put/checkDone',0 ,"?id=" + infId.toString())
    .subscribe( 
      data => { /*this.refreshColor(infId,false)*/}
    );
  }

  openFindNewInformerDialog(infID: number) {
    this.openSwapDialog(infID,1);
  }
/*   openFindNewInformerDialog(infID) {
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
  
     // dialogConfig.borderRadius: 0;
     
    dialogConfig.data = 
    {inf: this.dataSource.data.find( d => d.infInformerID ==  infID),
      mode: findDialogMode.SWAP};
    dialogConfig.width = '700px';
    const dialogRef = this.dialog.open(FindNewInformerComponent,dialogConfig).afterClosed().subscribe(result => {
      
  });
  } */

 /*  createFilter() {
    let filterFunction = function (data: IShortInformer, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      let isFilterSet = false;
      console.log("****");
      console.log(searchTerms.length);
      for (const col in searchTerms) {
        if (String(searchTerms[col]) !== '') {
          isFilterSet = true;
        } else {
          delete searchTerms[col];
        }
      }

      let namesSearch = () => {
        let found = false;
        if (isFilterSet) {
          for (const col in searchTerms) {
            String(searchTerms[col]).trim().toLowerCase().split(' ').forEach(word => {
              if (String(data[col]).toLowerCase().indexOf(word) != -1 && isFilterSet) {
                found = true
              }
            });
          }
          return found
        } else {
          return true;
        }
      }
      return namesSearch()
    }
    return filterFunction
  }
 */

  // Reset table filters
  resetFilters() {
    this.filterValues = {}
    this.filterSelectObj.forEach((value, key) => {
      value.modelValue = undefined;
    })
    //TD: 
    //this.dataSource.filter = "";
  }

  //TD:
  setupFilter() {
    /*this.dataSource.filterPredicate =
    (data: Informer, filter: string): boolean => {
     
      let searchTerms = JSON.parse(filter);
      let isFilterSet = false;
      let count = 0;
      for (const col in searchTerms) {
        if (String(searchTerms[col]) !== '') {
          isFilterSet = true;
          count++;
        } else {
          delete searchTerms[col];
        }
        
      }

      let namesSearch = () => {
        let found = 0;
        if (isFilterSet) {
          for (const col in searchTerms) {
          
            const textToSearch = typeof(data[col]) == "string"?  data[col] && data[col].toLowerCase() || ''
                : String(data[col]);
            const word = typeof(searchTerms[col]) == "string"?  searchTerms[col] && searchTerms[col].toLowerCase() || ''
            : String(searchTerms[col]);
            if (textToSearch.indexOf(word) !== -1 && isFilterSet) {
              found ++;
            }
          }
          return found == count;
          
        } else {
          return true;
        }
      }
      return namesSearch()
    } */
  }

  openDetailsDialog(infID: number) {
    console.log(infID);
      const dialogConfig = new MatDialogConfig();
  
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.height = '94vh';
      dialogConfig.maxHeight = '94vh';
 
     // dialogConfig.borderRadius: 0;
     
      dialogConfig.data = infID;
  
      const dialogRef = this.dialog.open(InformersDetailsComponent, dialogConfig);

      dialogRef.afterClosed().subscribe(
        data => {
          if(data)
          {
            /*let infData = data.get("inf")
            if (infData) {
              this.updateInfRecord(infData)
              this.updateInformer(infData);
            }*/ 
            let contactData = data.get('contacts')
            if (contactData) {
              this.updateContacts(contactData);
            }
              
          }
        }
      );
  }

  openSwapDialog(infID: number, step: number = 0) {
      const dialogConfig = new MatDialogConfig();
  
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.height = '94vh';
      dialogConfig.maxHeight = '94vh';
 
      dialogConfig.data = {inf: infID, startStep: step};
      dialogConfig.panelClass = 'my-dialog';
      const dialogRef = this.dialog.open(SwapInfStepsComponent, dialogConfig);

      dialogRef.afterClosed().subscribe(
        data => {
          if(data)
          {
            switch (data) {
              case swapStepperCloseResult.CANCEL:
                break;
              case swapStepperCloseResult.CONTINUE:
                this.refreshColor(infID, 'black');
                break;
              case swapStepperCloseResult.NO_FIND:
                  this.refreshColor(infID, 'lpurple');
                  break;   
              case swapStepperCloseResult.FIND:
                    this.refreshColor(infID, 'purple');
                    break; default:
                break;
            }
                
          }
        }
      );      
  }
  
  updateInformer(inf: Informer) {
    
    this.callWebApiService.postHttpCall('put/informer', inf).subscribe(
      data => {
        if(data > -1)
          this.IsSuccess[0]= true;
      },
      error => {
        console.log(error);
        this.IsSuccess[0] = false;
        this.saveAlert(0);
      },
      () => {

        //this.updateInfRecord();
        this.saveAlert(0);

      }
    );
  }

  updateContacts(contactData) {
     this.callWebApiService.postHttpCall('put/contacts', contactData).subscribe(
         data => this.IsSuccess[1]=data,
         error => {
           console.log(error);
           this.IsSuccess[1] = false;
           this.saveAlert(1);
         },
         ()=>this.saveAlert(1)
       );
   }

   saveAlert(index: number) {
    this.IsSuccess[index] == false ? 
      alert('עדכון פרטי מדווח נכשל') : alert('פרטי מדווח עודכנו בהצלחה')  
  }

  SwapAlert(result: number)  {
    //future -  SaveAlert(result: number,ErrorCode='',SuccesCode='')
    result == requestResult.FAILED ?
    alert('עדכון סטטוס מדווח נכשל ') : alert('עדכון סטטוס מדווח עבר בהצלחה')  
  }

  updateInfRecord(infData: Informer) { 
    /*const index = this.dataSource.data.findIndex(inf => inf.id == infData.id);
    if(index > -1){
      this.dataSource.data[index].name = infData.name;
    }*/
  }

}
 

