import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nomenclature } from '../models/utilisateur.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NomenclatureService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/nomenclatures`;

  getAll(): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(this.apiUrl);
  }

  getByType(type: string): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(`${this.apiUrl}/type/${type}`);
  }

  create(nomenclature: Nomenclature): Observable<Nomenclature> {
    return this.http.post<Nomenclature>(this.apiUrl, nomenclature);
  }

  update(id: number, nomenclature: Partial<Nomenclature>): Observable<Nomenclature> {
    return this.http.put<Nomenclature>(`${this.apiUrl}/${id}`, nomenclature);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
