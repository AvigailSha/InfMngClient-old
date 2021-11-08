import { Contact } from './contact.model';
import { Observation } from './observation.model';

export interface Informer {
    id: number;
    name: string;
    activityStatusId: number;
    economyBranchId: number;
    businessLayerId: number;
    owner: string; 
    colMethodId: number;
    collectDay: number; 
    collectWeek: number;
    collectTime: string;
    collectMonthes: string; 
    districtId: number;
    townId: number;
    street: string;
    home: string;
    fax: string;
    email: string;
    website: string;
    collectComment: string;
    informerComment: string;
    enumeratorId: number;
    //enumeratorFullName: string;
    iturSourceId: number;
    color: string;
    hotelRating: number;
    EilatVAT: boolean;
    startIturDate: Date;
    startRegularDate: Date;
    startActiveDate: Date;
    stopActiveDate: Date;
    stopLifeDate: Date;
    sendIturDate: Date;
    Contacts: Contact[];
    Observation: Observation[]; 
}
