import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScraperService {
  private apiUrl = `http://localhost:3000/scraper/ejecutar`;

  constructor(private http: HttpClient) {}

  ejecutarScraper(): Observable<any> {
    return this.http.post(this.apiUrl, {});
  }
}
