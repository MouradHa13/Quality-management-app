import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FicheSuivi } from '../models/app.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FicheService {
  private ficheProjetUrl = `${environment.apiUrl}/fiches-projet`;
  private ficheSuiviUrl = `${environment.apiUrl}/fiches-suivi`;

  constructor(private http: HttpClient) {}

  submitFicheProjet(projetId: string, fiche: any): Observable<any> {
    return this.http.post(`${this.ficheProjetUrl}/${projetId}`, fiche);
  }

  addFicheSuivi(projetId: string, fiche: FicheSuivi): Observable<FicheSuivi> {
    return this.http.post<FicheSuivi>(`${this.ficheSuiviUrl}/${projetId}`, fiche);
  }

  getFichesSuivi(projetId: string): Observable<FicheSuivi[]> {
    return this.http.get<FicheSuivi[]>(`${this.ficheSuiviUrl}/projet/${projetId}`);
  }
}
