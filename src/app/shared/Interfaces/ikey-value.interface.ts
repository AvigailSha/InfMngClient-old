export interface IKeyValue {
    key: number | string;
    value: string;    
}

export interface IEcoBranch extends IKeyValue {
    isHotel: boolean;
}

export interface IHotelService extends IKeyValue {
	alias: string;
}