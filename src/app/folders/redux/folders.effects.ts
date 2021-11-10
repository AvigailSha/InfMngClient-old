import { Injectable } from "@angular/core";
import { EntityCollectionService, EntityCollectionServiceFactory } from "@ngrx/data";
import { Actions, Effect, OnInitEffects, ofType, createEffect } from "@ngrx/effects";
import { createEffects } from "@ngrx/effects/src/effects_module";
import { Action } from "@ngrx/store";
import { Observable } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { Folder } from "../models/folder.model";

@Injectable()
export class foldersEffects implements OnInitEffects {
    private _foldersService: EntityCollectionService<Folder>;

    effectFolders$ = createEffect(  
        () => this.actions$.pipe(
          ofType('INIT_FOLDERS'),
          mergeMap(() => this._foldersService.getAll().pipe(
            map(folders => ({ type: 'INIT_FOLDERS', payload: folders })),
            //catchError(() => EMPTY)
          ))
        )
    )
    
    ngrxOnInitEffects(): Action {
        return {
            type: 'INIT_FOLDERS'
        }
    }

    constructor(private actions$: Actions, serviceFactory: EntityCollectionServiceFactory){
        this._foldersService = serviceFactory.create('folders')
    }
}