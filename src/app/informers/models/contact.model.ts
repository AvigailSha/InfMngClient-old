import { ContactPhone } from "./contact-phone.model";

export interface Contact {
    id: number,
    name: string, 
    visitTimeId: number,
    //visitTimeName: string,    
    phones: ContactPhone[]
}

