import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FicheTest } from '../models/fiche-test.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FicheTestService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/fiches-test`;

  getFicheTestByProjet(projetId: string): Observable<FicheTest> {
    return this.http.get<FicheTest>(`${this.apiUrl}/projet/${projetId}`);
  }

  saveFicheTest(projetId: string, ficheTest: FicheTest): Observable<FicheTest> {
    return this.http.post<FicheTest>(`${this.apiUrl}/projet/${projetId}`, ficheTest);
  }

  deleteFicheTest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
