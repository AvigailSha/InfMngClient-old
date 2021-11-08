import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { NewObsCounterService } from 'src/app/core/services/new-obs-counter.service';
import { WebApiCallsService } from 'src/app/core/services/web-api-calls.service';
import { IKeyValue } from 'src/app/shared/Interfaces/ikey-value.interface';
import { errorMessages, Validation } from 'src/app/shared/validations.class';
import { IDisplayObs } from '../../models/idisplay-obs.interface';
import { Observation } from '../../models/observation.model';
import { CPropMod, PropMod } from '../../models/prop-mod.model';
//import { SessionStorageService } from '../../Shared/Services/session-storage.service';

@Component({
  selector: 'app-add-observation',
  templateUrl: './add-observation.component.html',
  styleUrls: ['./add-observation.component.scss']
})
export class AddObservationComponent implements OnInit, OnDestroy {

  multiShowsItem: string[];
  form: FormGroup;
  ACSelectMods: FormGroup;
  informerId: number;
  BLId: number;
  existsObs: Observation[];
  obWeight: number;
  itemsOptions: IKeyValue[];
  filteredOptions: Observable<IKeyValue[]>;
  propsFilter: Observable<IKeyValue[]>;
  modOptions= new Map<string, IKeyValue[]>();
  modsFilter= new Map<string, Observable<IKeyValue[]>>();
  isDispayPM = new Array<IDisplayObs>();
  propsMod = new Map<string,CPropMod[]>();
  errors = errorMessages;
  curMultiItem : string;
  showDupError: boolean;
  private obNum: number;
  private sub: Subscription;

  constructor(private dataService: WebApiCallsService,
              //private sStorageService: SessionStorageService,
              private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<AddObservationComponent>,
              private counterService: NewObsCounterService,
              @Inject(MAT_DIALOG_DATA) ddata) { 
                this.informerId = ddata.infId;
                this.BLId = ddata.BLId;
                this.existsObs = ddata.existsObs;
                //this.obsIdsArray = ddata.ObsIds;

  }

  ngOnInit(): void {
    this.curMultiItem = '';
   // this.isDefineMods = new Array<Array<boolean>>();

    let multiShowItems$ = this.dataService.postHttpCall('get/MSItems',0).pipe( 
      map(res => {
          //Object.values(res).map(element=>element[0]);
          console.log('MSITEMS: ' + res);
          return res;          
        }
      )
    );

    let relevantItems$ = this.dataService.postHttpCall('get/relevantItems?id=',0,this.BLId.toString()).pipe(
      map(res => res as IKeyValue[])
    ); 

    forkJoin([multiShowItems$, relevantItems$]).subscribe(results => {
        this.multiShowsItem = results[0];
        this.itemsOptions = results[1];
      },
      error => console.log(error),
      () => {
        //this.sStorageService.setItem('multiShowsItem',  JSON.stringify(this.multiShowsItem));
        this._itemfilter();
        this.fACItems.validator = Validation.matchSelected(this.itemsOptions);
        this.filteredOptions = this.fACItems.valueChanges
          .pipe(
            startWith(''),
            map(value => this._ACfilter(value, this.itemsOptions))
          );        
      }
    ); 
    
    this.form = this.formBuilder.group({
      ACItems: this.formBuilder.control(''),
      newObs: this.formBuilder.array([]),
      //ACProps: this.formBuilder.control(''),
    }); 

    this.sub = this.counterService.getValue().pipe(
      tap(val => {
        console.log('observatuion num: ' + val)
    })).subscribe(
      val => this.obNum = val
    ); 
   
  }
  
  get fACItems() { return this.form.get("ACItems") as FormControl; }
  fnewObs() : FormArray | null { 
    return this.form.get("newObs") as FormArray; 
  }
  fpropMod(itemIndex: number): FormArray {
    return this.fnewObs().at(itemIndex).get("propsMods") as FormArray
  }
  //get fACProps()  { return this.form.get("ACProps") as FormControl; }
  fACModsArr(itemIndex: number): FormArray  { 
    return this.fnewObs().at(itemIndex).get("ACModsArr") as FormArray; 
  } 
  fACMods(itemI: number, propI: number) : FormControl{
    return this.fACModsArr(itemI).at(propI).get('ACMods') as FormControl;
  }
 


  newObsGroup(data: Observation): FormGroup {
    return this.formBuilder.group({
      obId: this.formBuilder.control( data.obId ),
      itemId: this.formBuilder.control( data.itemId ),
      name: this.formBuilder.control( data.name ),
      isMultiShows: this.formBuilder.control( data.isMultiShows),
      weight: this.formBuilder.control( Observation.defualtWeight ),      
      propsMods: this.formBuilder.array([]),
      ACModsArr: this.formBuilder.array([])     
    })
  }

  modsGroup(propId: number, propName: string): FormGroup {
    return this.formBuilder.group({
      pId: this.formBuilder.control( propId ),
      pName: this.formBuilder.control( propName ),
      ACMods: this.formBuilder.control( '' )
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

  filterModalities(propIndex :number, itemIndex: number, optionsID: string) {
    this.modsFilter.set(optionsID, this.fACMods(itemIndex, propIndex).valueChanges
    .pipe(
      startWith(''),
      map(value => this._ACfilter(value, this.modOptions.get(optionsID)))
    ));    
  }

  addItem() {
    let itemIndex: number = this.fnewObs().length;
    
    const element = this.itemsOptions.find(item => item.value == this.fACItems.value);
    if (!element)
      return;
    let tempNewOb: Observation = null;
    this.counterService.increment();   
    
    if(this.multiShowsItem.find(item => item == element.key)) {
      this.fACItems.disable();
      this.isDispayPM.push({multiShow: true, valid: true, selected: false});
      tempNewOb = new Observation(this.obNum.toString(), element.key.toString(), element.value, 3, null)
      this.fnewObs().push(this.newObsGroup(tempNewOb));
      if(this.propsMod && this.propsMod.has(element.key.toString())) {
        let tmpProp: CPropMod[] = this.propsMod.get(element.key.toString());
        for (let propIndex = 0; propIndex < tmpProp.length; ++propIndex) {
          this.fACModsArr(itemIndex).push(this.modsGroup( tmpProp[propIndex].Id, tmpProp[propIndex].Name ));
        }
      }
      else
        this.getRelevantPropsMods(element.key.toString(), itemIndex);
    }
    else {
      this.isDispayPM.push({multiShow: false, valid: false, selected: false});
      tempNewOb = new Observation(this.obNum.toString(), element.key.toString(), element.value, 0, null);
      this.fnewObs().push(this.newObsGroup(tempNewOb));
      this.itemsOptions = this.itemsOptions.filter(item => item.key != element.key);
    } 
   
  }

  removeItem(i: number) {
    //this.counterService.decrement();
    const keyVal: IKeyValue = {key: this.fnewObs().controls[i].get("itemId").value, value: this.fnewObs().controls[i].get("name").value}        
    this.fnewObs().removeAt(i);
    if (this.multiShowsItem.find(item => item == keyVal.key))
      return;
    this.itemsOptions.push(keyVal); 
    this.itemsOptions = this.itemsOptions.sort((itemA, itemB) => (itemA.value.toLowerCase() < itemB.value.toLowerCase() ? -1 : 1))
  }

  //בדיקה האם קיים כבר כזאת תצפית
  isValidNewOb(itemId: string, itemIndex: number) {
    // חיפוש בתצפיות הקיימות בטבלה
    let obsToCheck: Observation[] = this.existsObs?.filter(ob => ob.itemId == itemId); 
    
    //חיפוש בתצפיות בדיאלוג הוספה
    let existsNewObs: AbstractControl[] = this.fnewObs().controls.slice(0, itemIndex)
                                          .concat(this.fnewObs().controls.slice(itemIndex + 1));
    existsNewObs.forEach(element => {
      if(element.get("itemId").value == itemId)
        obsToCheck.push(
          new Observation(element.get("obId").value, 
                          element.get("itemId").value, 
                          element.get("name").value, 
                          element.get("isMultiShows").value, 
                          element.get("propsMods").value,
                          element.get("weight").value)
        );      
    });

    if (obsToCheck.length == 0)
      return true;

    for (const element of obsToCheck) {
      for (let i = 0; i < this.fACModsArr(itemIndex).length; i++) {
        const ACelemant = this.fACModsArr(itemIndex).at(i);
        const pmTemp = element.propsMods.find(pm => pm.propId == ACelemant.get("pId").value);
        if (!pmTemp || pmTemp.modName != ACelemant.get("ACMods").value )
          break; 
        if (i == this.fACModsArr(itemIndex).length - 1) 
        {
          this.isDispayPM[itemIndex].valid = false;
          return false; //invalid     
        } 
      }
    } 
    this.isDispayPM[itemIndex].valid = true;
    return true; //valid
  }

  isDisableAddMod(itemIndex: number) : boolean {
    for (let i = 0; i < this.fACModsArr(itemIndex).length; ++i) {
      if(this.fACModsArr(itemIndex).at(i).get("ACMods").value == '')
        return true; //disable
    }    
    return false; //enable
  }

  addPropMod(itemId: string, itemIndex: number) {
    if(this.isValidNewOb(itemId, itemIndex)) 
    {
      this.isDispayPM[itemIndex].selected = true;
      this.fACItems.enable();
    }

  }
  getRelevantPropsMods(itemId: string, itemIndex: number): void {
    this.dataService.postHttpCall('get/propMod', 0, '?id=' + itemId)
      .pipe(
        map(res => res.map(e => new CPropMod(e.id, e.name, e.modalities)))  
      )
      .subscribe( data => {
        this.propsMod.set(itemId, data);
              
        for (let propIndex = 0; propIndex < data.length; ++propIndex) {
          this.modOptions.set(itemId+data[propIndex].Id, data[propIndex].Modalities);
          this.fACModsArr(itemIndex).push(this.modsGroup( data[propIndex].Id, data[propIndex].Name ));
          this.filterModalities(propIndex, itemIndex, itemId+(data[propIndex].Id.toString()));             
        }
      },
      error => console.log(error),
      () => { }
    )
  }

  private _itemfilter() {
    this.itemsOptions =  this.itemsOptions?.filter(e => !this.existsObs?.some(ob => ob.itemId == e.key && ob.isMultiShows != 3))
  }

  private _ACfilter(value: string, options: IKeyValue[]): IKeyValue[] {
   // const filterValue = JSON.stringify(value).toLowerCase();
    return options.filter(option => option.value.includes(value));  
  }

  selectModality(value: string, itemIndex: number, itemId: string, _propId: number): void {
    const tmpPName = this.propsMod.get(itemId).find(pm => pm.Id == _propId)?.Name;
    if(!tmpPName)
      return;
    const tmpMCode = this.propsMod.get(itemId).find(pm => pm.Id == _propId)?.Modalities.find(m => m.value == value)?.key;
    if(!tmpMCode)
      return;

    if(this.fpropMod(itemIndex).length > 0) {
      const tmpPM = this.fpropMod(itemIndex).controls.find(pm => pm.get("propId").value == _propId);
      if(tmpPM) {
        tmpPM.get("modId").setValue(tmpMCode as number);
        tmpPM.get("modName").setValue(value);
      }
      else    
        this.fpropMod(itemIndex).push(this.propModGroup({propId: _propId, propName: tmpPName, modId: tmpMCode as number, modName: value}))
    }
    else
      this.fpropMod(itemIndex).push(this.propModGroup({propId: _propId, propName: tmpPName, modId: tmpMCode as number, modName: value}))
  }

  clearSelect() {
    this.fACItems.setValue('');
  }

  clearMSelect(propIndex: number, itemIndex: number) {
    this.fACMods(itemIndex,propIndex).setValue('');
  }

  save() {
    this.dialogRef.close(this.form.value.newObs);        
  }

  close() {
      this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}

