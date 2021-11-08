import { IKeyValue } from "src/app/shared/Interfaces/ikey-value.interface";

export interface PropMod {
    propId: number;
    propName: string;
    modId: number;
    modName: string;
}

export class CPropMod {

    constructor(public Id: number, 
                public Name: string,  
                public Modalities: IKeyValue[] ) {

    };

}
