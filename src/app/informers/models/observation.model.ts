import { PropMod } from "./prop-mod.model";

export class Observation {
    static defualtWeight: number = 1;
    static defualtStatus: number = 1;
    public _obId: string;
    public _itemId: string;  
    public _name: string;  
    public _weight: number; 
    public _status: number;
    public _hotelSrvId: string;
    public _isMultiShows: number;
    public _propsMods: PropMod[];
   
      constructor(public obId: string, 
                  public itemId: string,  
                  public name: string,
                  public isMultiShows: number,
                  public propsMods: PropMod[],
                  public weight: number = 1, 
                  public status: number = 1,
                  public hotelSrvId: string = ''                            
     
                  ) { 
                    this._obId = obId;
                    this._itemId = itemId;
                    this._name = name;
                    this._weight = weight;
                    this._status = status;
                    this._isMultiShows = isMultiShows;
                    this._propsMods = propsMods;
                    this._hotelSrvId = hotelSrvId;
      };
  }
