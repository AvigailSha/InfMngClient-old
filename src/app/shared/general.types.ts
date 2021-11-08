import { IKeyValue } from "./Interfaces/ikey-value.interface";

export type Dictionary = {
    [key: string]: IKeyValue[];
};

export type InformerMode  = 'new' | 'edit' | 'wait' | 'inactive';