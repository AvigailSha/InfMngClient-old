import { IKeyValue } from "src/app/shared/Interfaces/ikey-value.interface";

export interface Folder {
    id : number,
    name: string,
    items: IKeyValue[]
}