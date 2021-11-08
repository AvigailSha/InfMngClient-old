import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, forkJoin, Observable, Subject } from 'rxjs';
import { Informer } from '../../models/informer.model';
import { Dictionary, InformerMode } from 'src/app/shared/general.types';
import { Observation } from '../../models/observation.model';
import { StarRatingColor } from 'src/app/shared/general.enums';
import { InfFoldersComponent } from '../inf-folders/inf-folders.component';
import { WebApiCallsService } from 'src/app/core/services/web-api-calls.service';
import { ColMonthConverterService } from 'src/app/core/services/col-month-converter.service';
import { GetCodecsService } from 'src/app/core/services/get-codecs.service';
import { PropMod } from '../../models/prop-mod.model';
import { Contact } from '../../models/contact.model';
import { ContactPhone } from '../../models/contact-phone.model';
import { IEcoBranch } from 'src/app/shared/Interfaces/ikey-value.interface';
import { AddObservationComponent } from '../add-observation/add-observation.component';

@Component({
  selector: 'app-informers-details',
  templateUrl: './informers-details.component.html',
  styleUrls: ['./informers-details.component.scss']
})
export class InformersDetailsComponent implements OnInit, AfterViewInit {

  curInf: Informer = null;  
  curInfID: number = 1003042;
  form: FormGroup;
  codesc: Dictionary = null;
  obDataSource : MatTableDataSource<Observation>;
  displayedColumns : string[];
  
  valueChanges = new Map<string,any>();
  propModMap = new Map<number, number>(); 
  monthesMap = new Map();
  daysMap = new Map([[0, "לא מוגדר"], 
  [1, "ראשון"],
  [2, "שני"],
  [3, "שלישי"],
  [4, "רביעי"],
  [5, "חמישי"],
  [6, "שישי"],
  [7, "שבת"] ]) ;

  servicesArr: string[] = ['BB', 'HB', 'FB', 'AI', 'RO'];  
  servicesMap = new Map<string, boolean>();
  infStatusFlag: boolean; //when informer status is activate this flag equal to false.
  isShowHotelServices: boolean;
  isAddOb: boolean; 

  infMode: InformerMode;

  private newObsCounter$ = new BehaviorSubject<number>(0);
  
  rating:number;
  starCount:number;
  starColor:StarRatingColor;
  
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(InfFoldersComponent) folders: InfFoldersComponent;
 
  constructor(private dataService: WebApiCallsService, 
              private formBuilder: FormBuilder,
              private monthConverter: ColMonthConverterService,
              private codescService : GetCodecsService,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<InformersDetailsComponent>,
              @Inject(MAT_DIALOG_DATA) dialogData: number) {
                this.curInfID = dialogData;
               /* this.curInf.name = ddata.infName;
                this.curInf.activityStatusId = ddata.infInfActivityID;
                this.curInf.activityStatusName = ddata.activityName;
                this.curInf.businessLayerId = ddata.infBusinessLayerID;
                this.curInf.businessLayerName = ddata.BusinessLayerName;
                this.curInf.economyBranchId = ddata.infEconomyBranchID;
                this.curInf.colMethodId = ddata.infColCenterID;
                this.curInf.districtId = ddata.infDistrictID;
                this.curInf.townId = ddata.infGeogrID;*/  
                this.displayedColumns =  [ 'numbering', 'id', 'name', 'weight', 'status'];
                this.infStatusFlag = false; 
                this.isShowHotelServices = false;
                this.isAddOb = true;
                this.starCount = 5;
                this.starColor = StarRatingColor.warn;
  }

/*   get frmFoldersStep() {
    return this.folders ? this.folders.foldersPart : null;
 } */

  ngOnInit(): void { 
    this.codesc = this.codescService.getAllCodes();

    this.obDataSource = new MatTableDataSource<Observation>();

    this.form = this.formBuilder.group({
      formArray: this.formBuilder.array([
        this.formBuilder.group({
          id: [''],
          name: ['', Validators.required],
          activityStatusId: ['', Validators.required], //2
         // activityStatusName: ['', Validators.required],
          economyBranchId: ['', Validators.required],
          //economyBranchName: ['', Validators.required],
          businessLayerId: ['', Validators.required],
         // businessLayerName: ['', Validators.required],
          owner: [''],
          districtId: ['', Validators.required],
          hotelRating: ['']
        }),
        this.formBuilder.group({          
          colMethodId: ['', Validators.required],
          collectWeekId: ['', Validators.required],
          collectDay: [''], 
          collectTime: [''],
          collectMonthes: ['11111111111', Validators.required]
        }),
        this.formBuilder.group({
          townId: ['', Validators.required],
          street: [''],
          home: [''],
         // postAddress: [''],
          fax: [''],
          email: [''],
          website: ['']
        }),
        this.formBuilder.group({
          collectComment: [''],
          informerComment: [''],
          enumeratorId: ['0', Validators.required],
          enumeratorName: ['', Validators.required],
          iturSourceId: [''],
          iturSourceName: [''],
          EilatVAT: ['']
        }),
        this.formBuilder.group({
          Contacts: this.formBuilder.array([])
        }),
        this.formBuilder.group({
          Observation: this.formBuilder.array([])
        }),
        this.formBuilder.group({
          Folders: null  //TD        
        })
      ])
    })

    if(this.curInfID === 0)
    {
      this.infMode = 'new';
      this.monthConverter.convertTobool(this.FormArray.get([1]).get('collectMonthes').value, this.monthesMap);
      //this.setDefaultValues();
    }
    else
    {
      let informer$ = this.dataService.postHttpCall('get/informer?id=',0,this.curInfID.toString());    
      let contacts$ = this.dataService.postHttpCall('get/contacts?id=',0,this.curInfID.toString());
      let observations$ = this.dataService.postHttpCall('get/obs?id=',0,this.curInfID.toString());
      forkJoin([informer$, contacts$, observations$]).subscribe(results => {
        this.curInf = results[0];
        this.curInf.Contacts = results[1];
        this.curInf.Observation = results[2];       
      },
      error => this.getError = error,
        () => this.setFormValues()
      );
    }
   
  }

  ngAfterViewInit() {
    this.obDataSource.sort = this.sort;    
  }

  //get fControls() { return this.form.controls; }
  get FormArray(): AbstractControl | null { return this.form.get('formArray'); }

  contacts(): FormArray | null {
		return this.FormArray.get([4]).get("Contacts") as FormArray;
	}

  phones(i: number): FormArray {
    return this.contacts().at(i).get("phones") as FormArray
  }

  observation(): FormArray | null {
    return this.FormArray.get([5]).get("Observation") as FormArray;
  }

  propMod(i: number): FormArray {
    return this.observation().at(i).get("propsMods") as FormArray
  } 
 
  obsGroup(data: Observation): FormGroup {
    return this.formBuilder.group({
      obId: this.formBuilder.control( data ),
      itemId: this.formBuilder.control( data.itemId ),
      name: this.formBuilder.control( data.name ),
      weight: this.formBuilder.control( data.weight ),
      status: this.formBuilder.control( data.status ),
      isMultiShows: this.formBuilder.control( data.isMultiShows ),
      propsMods: this.formBuilder.array([]),
      hotelSrv: this.formBuilder.control( data.hotelSrvId )
    })
  }

  propModGroup(data: PropMod): FormGroup {
    return this.formBuilder.group({
      propId: this.formBuilder.control( data.propId ),
      propName: this.formBuilder.control( data.propName ),
      modId: this.formBuilder.control( data.modId ),
      modName: this.formBuilder.control( data.modName )
    })
  }

  contactGroup(data : Contact): FormGroup {
    return this.formBuilder.group({
      id: this.formBuilder.control( data.id, Validators.required ),
      name: this.formBuilder.control( data.name ),
      visitTimeId: this.formBuilder.control( data.visitTimeId ),   
      phones: this.formBuilder.array( [] )
    });  
  }

  phonesGroup(data : ContactPhone): FormGroup {
    return this.formBuilder.group({
      //contactId: this.formBuilder.control( data.contactId ),    
      phoneTypeId: this.formBuilder.control( data.phoneTypeId ),
      phone: this.formBuilder.control( data.phone )
    })
  }

  addPhone(i: number) {
    this.phones(i).push(this.phonesGroup( {phoneTypeId: 0, phone: null} ));
    this.contacts().markAsDirty();
  }

  removePhone(i: number, j: number) {
    this.phones(i).removeAt(j);
    this.contacts().markAsDirty();
  }

  addContact() {
    this.contacts().push(this.contactGroup( {id: null, name: null, visitTimeId: 0, phones: null}))
    this.contacts().markAsDirty();
  }

  removeContact(i: number) {
    this.contacts().removeAt(i);
    this.contacts().markAsDirty();
  }

  addHotelObs(e, serviceName: string) {
    if (e.checked) {
      const obID = '10802060201', obName = 'שהייה בבתי מלון - מחיר דלפק'
      this.codesc['hotelPeriod']?.forEach(element => {
        this.observation().push(this.obsGroup( new Observation(null, obID, obName + ' ' + serviceName + ' ' + element.value, 0, null, Observation.defualtWeight, Observation.defualtStatus, serviceName) ))
      });
      this.obDataSource.data = this.observation().value;
    }
    else {
      const obsToRemuve = this.observation().controls.filter(e => e.get('hotelSrv').value == serviceName)
    }
  }
  addObservation() {
    if (this.IsHotelEconomyBranch())
    {
      this.isShowHotelServices = true;
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.width = '80vw';
    dialogConfig.maxWidth = '80vw';
    dialogConfig.height = '94vh';
    dialogConfig.maxHeight = '94vh';
    dialogConfig.panelClass = 'custom-dialog'
    dialogConfig.data = {
      infId: this.curInfID,
      BLId: this.FormArray.get([0]).get('businessLayerId').value == '' ? -1 : this.FormArray.get([0]).get('businessLayerId').value,
      ObsIds: this.obDataSource.data ? Object.values(this.obDataSource.data).map(e=>e["itemId"]) : null,
     // ObsIds: this.obDataSource ? Object.values(this.obDataSource).filter(e=>e["isMultiShows"]===0).map(e=>e["id"]) : null,
      existsObs: this.observation().value
    }
    const dialogRef = this.dialog.open(AddObservationComponent, dialogConfig); 

    dialogRef.afterClosed().subscribe(
      data => {
        console.log("ItemDialog output:", data)
        if(data)
        {
          data.forEach( (element, i :number) => {
            element.status = Observation.defualtStatus;
            this.observation().push(this.obsGroup(element));
            if(data[i].isMultiShows === 3)
              data[i].propsMods.forEach( element => {
                this.propMod(this.observation().length - 1).push(this.propModGroup(element)    );
              });
          });            
        
          this.obDataSource.data = this.observation().value;     
        }
      }
    ); 

  }

  /* getInformer(): void {
    this.dataService.postHttpCall('informer?id=',0,this.curInfID)
  //  .pipe(map(res => res as Informer)
   // )
      .subscribe( (data: IInformer) => {
        this.curInf =  data[0];
        const id: string = (data[0].id).toString();
        this.getInformerContacts(id); 
        this.getObservations(id); 
        this.getAllCodecs();    
      },      
      error => this.getError = error,
      //() => this.setFormValues()
    )  
  } */

  fillContactsValues(data) : void {
    this.contacts().clear(); 
    this.contacts().markAsPristine();
    data.forEach( (element, i :number) => {
      this.contacts().push(this.contactGroup(element));
      data[i].phones.forEach( element => {
        this.phones(i).push(this.phonesGroup(element)    );
      });
    });   
  }

/*   getInformerContacts(id: string): void {
    this.dataService.postHttpCall('contacts?id=',0,id)
      .subscribe(
        (data) => {
          this.curInf.Contacts = data;
         // this.fillContactsValues(this.curInf.Contacts); 
        },
        error => this.getError = error             
      );
  } */

  fillObsValues(data: Observation[]) : void {
    this.observation().clear();

    data.forEach( (element, i :number) => {
      this.observation().push(this.obsGroup(element));
      if(data[i].isMultiShows === 3)
        data[i].propsMods.forEach( element => {
          this.propMod(i).push(this.propModGroup(element)    );
        });
    });  
    this.obDataSource.data = this.observation().value;
  }

  setDefaultValues(): void {
    this.FormArray.get([0]).get('activityStatusId').setValue(2);
  }

  setFormValues(): void {    
    this.FormArray.get([0]).get('id').setValue(this.curInf.id);
    this.FormArray.get([0]).get('name').setValue(this.curInf.name);
    if(this.FormArray.get([0]).get('activityStatusId').value !== this.curInf.activityStatusId)
      this.FormArray.get([0]).get('activityStatusId').setValue(this.curInf.activityStatusId);
    this.infStatusFlag = this.curInf.activityStatusId === 7; 

   // this.FormArray.get([0]).get('activityStatusName').setValue(this.curInf.activityStatusName);
    this.FormArray.get([0]).get('businessLayerId').setValue(this.curInf.businessLayerId);
    //this.FormArray.get([0]).get('businessLayerName').setValue(this.curInf.businessLayerName);
    this.FormArray.get([0]).get('economyBranchId').setValue(this.curInf.economyBranchId);
    this.FormArray.get([0]).get('owner').setValue(this.curInf.owner);
    this.FormArray.get([1]).get('colMethodId').setValue(this.curInf.colMethodId);
    this.FormArray.get([1]).get('collectWeekId').setValue(this.curInf.collectWeek);
    this.FormArray.get([1]).get('collectDay').setValue(this.curInf.collectDay);
    this.FormArray.get([1]).get('collectTime').setValue(this.curInf.collectTime);
    this.FormArray.get([1]).get('collectMonthes').setValue(this.curInf.collectMonthes);
    this.FormArray.get([0]).get('districtId').setValue(this.curInf.districtId);
    //this.FormArray.get([0]).get('hotelRating').setValue(this.curInf.hotelRating);
    this.FormArray.get([2]).get('townId').setValue(this.curInf.townId);
    this.FormArray.get([2]).get('street').setValue(this.curInf.street);
    this.FormArray.get([2]).get('home').setValue(this.curInf.home);
   // this.FormArray.get([2]).get('postAddress').setValue(this.curInf.postAddress);
    this.FormArray.get([2]).get('fax').setValue(this.curInf.fax);
    this.FormArray.get([2]).get('email').setValue(this.curInf.email);
    this.FormArray.get([2]).get('website').setValue(this.curInf.website);
    this.FormArray.get([3]).get('collectComment').setValue(this.curInf.collectComment);
    this.FormArray.get([3]).get('informerComment').setValue(this.curInf.informerComment);
    this.FormArray.get([3]).get('enumeratorId').setValue(this.curInf.enumeratorId);
    //this.FormArray.get([3]).get('enumeratorName').setValue(this.curInf.enumeratorFullName);
    this.FormArray.get([3]).get('iturSourceId').setValue(this.curInf.iturSourceId);
   // this.FormArray.get([3]).get('iturSourceName').setValue(this.curInf.iturSourceName);
    this.FormArray.get([3]).get('EilatVAT').setValue(this.curInf.EilatVAT);     
    this.monthConverter.convertTobool(this.curInf.collectMonthes, this.monthesMap);
    this.fillContactsValues(this.curInf.Contacts);
    this.fillObsValues(this.curInf.Observation);

    this.setInfMode();

    if(this.infMode == 'inactive')//curInf.activityStatusId === 5
    {
      this.form.disable();      
      this.isAddOb = false;      
    }
    else
      this.isAddOb = !this.hiddenAddOb();   
    }

    setInfMode() {
      switch(this.curInf.activityStatusId) {
        case 2:
        case 3:
        case 9:
          this.infMode = 'edit';
          break;
        case 5:        
          this.infMode = 'inactive';
          break;
        case 7:
          this.infMode = 'wait';
          break;        
      }

    console.log("setInfMode: ", this.infMode)


    }

  getError(error) {
    console.log(error);
  }

  changeToWaitStatus() {
    this.FormArray.get([0]).get('activityStatusId').setValue(7);
    this.infStatusFlag = true;
    for (let index = 0; index < this.observation().length; ++index) {
      this.observation().controls[index].get("status")?.setValue(2);
      //const element = this.observation().at(index);
      //this.innerChangeOb(element)    
    }
    this.obDataSource.data = this.observation().value;     
  }

  changeObStatus(id: number) {
    const element = this.observation().controls.find(ob => ob.get("obId").value === id);
    if(element)
    {
      element.get('status').setValue(2);
      this.obDataSource.data = this.observation().value;   
    }    
  }

  getObControlById(id: number | string) : AbstractControl {
    if(!id)
      return;
    const element = this.observation().controls.find(ob => ob.get("obId").value === id);
    return element? element: null;
  }

  hiddenAddOb(): boolean {
    if (this.FormArray.get([0]).get('activityStatusId').value === 7)
      return true; //hidden
    else
      return this.IsHotelEconomyBranch();
  }

  IsHotelEconomyBranch() : boolean {
    const id = this.FormArray.get([0]).get('economyBranchId')?.value;
    const EBItem = this.codesc['economyBranch']?.find(item => item.value === id) as IEcoBranch;
    return EBItem ? EBItem.isHotel : false;
  }

 /* IsEditMode() : boolean {
    console.log("IsEditMode: ", this.infMode)
    switch(this.infMode) {
      case 'new':
      case 'edit':
        return true;
      default:
        return false;
    }
  } */

  save() {
    if (this.form.invalid) 
      return;

  //alert('SUCCESS!\n\n' + JSON.stringify(this.Form.value))
    if(!this.form.dirty)
      this.close();
    
    //let valueChanges = this.form.value as Array<any>;
    let arrayMain = this.form.controls.formArray as FormArray;
    let secondArr = null;
    
    
    //let tmpInfValues = new Map<string, any>();
    let tmpInfValues: Informer;
    for (let i = 0; i < 4 ; ++i) {
     // secondArr = arrayMain.get[i].controls.formArray as FormArray;
      //if(arrayMain.at(i).dirty)
       // for (let j = 0; j < secondArr.length ; ++j) {
         // if (secondArr.get([j]).dirty)
            tmpInfValues = {...tmpInfValues, ...arrayMain.at(i).value}
    }
    if(tmpInfValues)
      this.valueChanges.set('inf',tmpInfValues)
 // }
    //if(this.form.value.Contacts.length > 0)
    if(this.contacts().dirty) {
      //let tmpConValues = Object.entries(this.form.value.Contacts).map(e => e.keys())
     // const {phones, ...tmpConValues} = this.contacts().value;
      const tmpConValues = Object.keys(this.contacts().value).map((key) => ({
        id: this.contacts().at(Number(key)).get("id").value, 
        name: this.contacts().at(Number(key)).get("name").value, 
        visitTimeId: this.contacts().at(Number(key)).get("visitTimeId").value,
        informerId: this.curInf.id })
      )
      this.valueChanges.set('contacts', tmpConValues);

    }
      
    
    //for (let i = 0; this.contacts().length > i; ++i)
      //if (this.contacts().at(i).dirty)
       // tmpInfValues.set(i, this.contacts().at(i).value) 
      
      
    
// this.form.value.formArray[0]
    this.dialogRef.close(this.valueChanges);
  }

  onRatingChanged(rating) {
    console.log(rating);
    this.FormArray.get([0]).get('hotelRating').setValue(rating);
    this.rating = rating;
  }
  reset() {
    if(this.infMode == 'new')
      this.form.reset();
    else
      this.setFormValues();
  }

  close() {
      this.dialogRef.close();
  }



}





 

 



