import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebApiCallsService {

  ServerURL: string = environment.serverUrl;

  constructor(private http: HttpClient) { }

  postHttpCall(url,data, params = ''): Observable<any> {
    var httpOptions = {
      headers:
        new HttpHeaders({
          'Content-Type': 'application/json'
        }),
    }
    
    return this.http.post(this.ServerURL + url + params, JSON.stringify(data), httpOptions);
  }

 
  getHttpCall(url): Observable<any> {

    var httpOptions = {
      headers:
        new HttpHeaders({
          'Content-Type': 'application/json'
        }),
    }

    return this.http.get(this.ServerURL + url, httpOptions);
  }
}
