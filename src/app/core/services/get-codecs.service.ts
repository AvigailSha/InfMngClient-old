import { Injectable } from '@angular/core';
import { Dictionary } from 'src/app/shared/general.types';
import { IKeyValue } from 'src/app/shared/Interfaces/ikey-value.interface';
import { WebApiCallsService } from './web-api-calls.service';

@Injectable({
  providedIn: 'root'
})
export class GetCodecsService {

  GeneralCodesc: Dictionary = null;
  GeneralCodesc$: Promise<Dictionary> = null;
  private _infId: number;

  constructor(private dataService: WebApiCallsService) {
   // this.InitCodesc();
  }

  InitCodesc() : void {
    this.GeneralCodesc = {
      'infStatus': null,
      'nodeStatus': null,
      'colMethod': null,
      'economyBranch': null,
      'businessLayer': null,
      'visitTime': null,
      'district': null,
      'town': null,
      'collectWeek': null,
      'phoneType': null,
      'infSource': null, 
      'hotelPeriod': null,
      'hotelService': null, 
      'hotelRating': null     
    }

    this.getCodes('infStatus');
    this.getCodes('nodeStatus');
    this.getCodes('colMethod');
    this.getCodes('economyBranch');
    this.getCodes('businessLayer');
    this.getCodes('visitTime');
    this.getCodes('district');
    this.getCodes('town');
    this.getCodes('collectWeek');
    this.getCodes('phoneType');
    this.getCodes('infSource');
    this.getCodes('hotelPeriod');
    this.getCodes('hotelService');
    this.getCodes('hotelRating');  
    
    //this.GeneralCodesc$ = Promise.resolve(this.GeneralCodesc);
    //return await this.GeneralCodesc$
  }

  getAllCodesAsync() : Promise<Dictionary>{
    return this.GeneralCodesc$;
  }

  getAllCodes() : Dictionary{
    return this.GeneralCodesc;
  }
   
  getCodes(key: string): void {
    const baseUrl = `get/${key}`;

    this.dataService.postHttpCall(baseUrl, 0)
    .pipe(
     /*map(res =>
        res.map(element => { return {key: element.code, value: element.name} as IKeyValue})
      )*/
    )
      .subscribe(
        data => this.GeneralCodesc[key] = data,
        error => this.getError = error
    )
  }
 
  getCollection(collecationName : string) : IKeyValue[]{
    return this.GeneralCodesc[collecationName];
  }

  getValue(collecationName :string, id : number | string) {
    //if(id != '')
      return this.GeneralCodesc[collecationName].find(d => d.key == id).value;
  }

  getKey(collecationName :string, value: string) {
    return this.GeneralCodesc[collecationName].find(d => d.value == value).key;
  }

  getKeyValue(collecationName :string, id : number | string) :IKeyValue {
    return this.GeneralCodesc[collecationName].find(d => d.key == id);
  }

  getError(error) {
    console.log(error);
  }
}
