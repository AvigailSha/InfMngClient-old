
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { OnInit } from "@angular/core";
import { SortDirection } from "@angular/material/sort";
import { Observable, BehaviorSubject, of, Subscription } from "rxjs";
import { filter, catchError, finalize, map} from "rxjs/operators";
import { Informer } from "src/app/informers/models/informer.model";
import { InformerService } from "./informer.service";

export class InformerDataSource implements DataSource<Informer> {

    private informers$ = new Observable<Informer[]>();
    private sub: Subscription;

    constructor(private informerService: InformerService) {  
        this.informers$ = this.informerService.getCurrentInformersSlice();  
    }

    loadInformers(){
        this.sub = this.informers$.pipe(
             catchError(() => of([]))
            ).subscribe( res =>
                console.log(res)
        )
    }
    
    connect(collectionViewer: CollectionViewer): Observable<Informer[]> {
        console.log("connecting data source, collectionViewer: ", collectionViewer);
        return this.informers$;        
    }

    disconnect(collectionViewer: CollectionViewer): void {
        console.log("disconnecting data source");
        this.sub.unsubscribe();    
    }

}
