import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, publishReplay, refCount, shareReplay, switchMap, tap } from 'rxjs/operators';
import { SortDirection } from '@angular/material/sort';
import { promise } from 'protractor';
import { Informer } from 'src/app/informers/models/informer.model';

@Injectable({
  providedIn: 'root'
})
export class InformerService {

  private currentInformers$: Observable<Informer[]>;
  private fetch$ = new BehaviorSubject<[SortDirection, number, number]>(['asc', 0, 10]);

  //allInformers: Informer[];
  //private updatedInformer$ = new BehaviorSubject<Informer[]>(this.informers);
  
  ServerURL: string = environment.serverUrl;
  httpOptions: {};

  constructor( private http: HttpClient ) {
    this.httpOptions = {
      headers:
        new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };

      this.currentInformers$ = this.fetch$.pipe(
        switchMap(([sortOrder, pageIndex, pageSize]) => this.findInformers(sortOrder, pageIndex, pageSize)), 
        publishReplay(1), 
        refCount()
        // shareReplay(1)
      )        
  }

  getInformers(url: string): Observable<Informer[]> {
      return this.http.get<Informer[]>(this.ServerURL + url, this.httpOptions);
  }

  getInformerById(url: string): Observable<Informer> {
    return this.http.get<Informer>(this.ServerURL + url, this.httpOptions)
  }

  findInformers(sortOrder: SortDirection, pageNumber: number, pageSize: number): Observable<Informer[]> {
    const url = this.ServerURL + 'get/informerslice';
    return this.http.get<Informer[]>(url, { 
      ...this.httpOptions,
      params: new HttpParams()
          .set('sortOrder', sortOrder)
          .set('pageNumber', pageNumber.toString())
          .set('pageSize', pageSize.toString())
    })
  }

  setInformersParams(sortOrder: SortDirection, pageNumber: number, pageSize: number) {
    this.fetch$.next([sortOrder, pageNumber, pageSize]);
  }

  getCurrentInformersSlice(): Observable<Informer[]> {
    return this.currentInformers$;
  }

  getCurrentInformer(id: number): Observable<Informer> {
    return this.currentInformers$.pipe(
      map(informers => informers.filter(inf => inf.id == id)[0])
    );
  }

  public updateInformrs(inf: Informer | Informer[]) : Promise<void> {
    //let infId = inf.id;
    //let curInf = this.getCurrentInformer(inf.id);
    //?????????????????????????????
    //curInf = inf;
    //this.currentInformers$.forEach(infs => infs.filter(i => i.id == inf.id)) 
    //const informersTmp = this.currentInformers$.
     
    /*this.setUpdatedInformer(inf);
    const res$ = combineLatest([
      this.currentInformers$,
      this.updatedInformer$.asObservable()
    ]);
    
    this.currentInformers$ = res$.pipe(
      map(
        (results) => (this.mergeInfData(results[0], results[1]))
      )
    );*/
  
    return Promise.resolve();
  }

  mergeInfData(curInf: Informer[], updatedInf: Informer[]) : Informer[]{
    updatedInf.forEach(infb => {
      const index = curInf.findIndex(infa=> infa.id = infb.id)
      if(index > -1)
        curInf[index] = infb;
      else
        curInf.push(infb)
    })
    return curInf;  
  }

  public putInformer(data: Informer) : Observable<any> {
    const url = this.ServerURL + 'put/informer';
    return this.http.post(this.ServerURL + url, JSON.stringify(data), this.httpOptions);
  }

}


