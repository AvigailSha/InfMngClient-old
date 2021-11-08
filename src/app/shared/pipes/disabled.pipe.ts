import { Pipe, PipeTransform } from "@angular/core";
import { infActivityCode } from "../general.enums";

@Pipe({name: 'disabledSwap'})
export class DisabledSwapPipe implements PipeTransform {
    transform(activity: number) {
      let ret = activity == infActivityCode.INACTIVE || activity == infActivityCode.WAIT ? true : null;
      return ret;
    }   

}
