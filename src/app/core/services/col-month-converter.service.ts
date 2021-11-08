import { Injectable } from '@angular/core';
import { Monthes } from 'src/app/shared/general.enums';

@Injectable({
  providedIn: 'root'
})
export class ColMonthConverterService {

  constructor() { }

  convertTobool(val : string, map: Map<string,boolean>){
    map.clear();
    for (let index = 0; index < val.length; ++index) {
        map.set(Monthes[index], this.getBoolean(val.charAt(index)));            
    }
    
}

getBoolean(value) {
    switch(value) {
        case true:
        case "true":
        case 1:
        case "1":
            return true;
        case 0:
        case "0":
            return false;
    }
}
}
