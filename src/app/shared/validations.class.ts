 import { AbstractControl, FormControl, ValidatorFn } from "@angular/forms";

export class Validation {

    static ValidateMatch(control: AbstractControl) {
        const selection: any = control.value;
        if (selection == '')
          return null; //Valid
        if (typeof selection === 'string') {
            return { incorrect: true };
        }
        return null; //Valid
      }
    
    static matchSelected(array: any[]): ValidatorFn {  
        return (control: AbstractControl): { [key: string]: any } | null => {
            const selectedValue: any = control.value;
            if (!array || selectedValue == '')            
                return null; //Valid

            if (array.find(item => item.value === selectedValue))
                return null;
            
            return { incorrectValue: true };
        }
    };
}

export const errorMessages: { [key: string]: string } = {
    incorrectValue: "יש לבחור ערך מהרשימה",
    duplicateOb: "למדווח זה כבר קיימת תצפית עם כאלו אופניות, יש לשנות את הגדרת האופניות"
};