import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Historique } from '../models/kpi.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/historique`;

  getHistoriqueGlobal(page: number = 0, size: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/global`, { params });
  }

  getMonHistorique(page: number = 0, size: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/personnel`, { params });
  }

  getHistoriqueByEntite(entite: string, entiteId: number): Observable<Historique[]> {
    return this.http.get<Historique[]>(`${this.apiUrl}/entite/${entite}/${entiteId}`);
  }
}
