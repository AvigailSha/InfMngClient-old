import { Pipe, PipeTransform } from '@angular/core';
import { GetCodecsService } from 'src/app/core/services/get-codecs.service';

@Pipe({
  name: 'valueOfKey'
})
export class ValueOfKeyPipe implements PipeTransform {

  constructor(private codescService: GetCodecsService) {
  }

  transform(value: number, codeName: string): string {
    return this.codescService.getValue(codeName, value);
  } 

}
