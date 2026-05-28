import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FicheProjet, FicheSuivi } from '../models/projet.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FicheService {
  private http = inject(HttpClient);
  private ficheProjetUrl = `${environment.apiUrl}/api/fiches-projet`;
  private ficheSuiviUrl = `${environment.apiUrl}/api/fiches-suivi`;

  // Fiche Projet methods
  submitFicheProjet(projetId: string, fiche: FicheProjet): Observable<FicheProjet> {
    return this.http.post<FicheProjet>(`${this.ficheProjetUrl}/${projetId}`, fiche);
  }

  updateFicheProjet(id: string, fiche: FicheProjet): Observable<FicheProjet> {
    return this.http.put<FicheProjet>(`${this.ficheProjetUrl}/${id}`, fiche);
  }

  // Fiche Suivi methods
  addFicheSuivi(projetId: string, fiche: FicheSuivi): Observable<FicheSuivi> {
    return this.http.post<FicheSuivi>(`${this.ficheSuiviUrl}/${projetId}`, fiche);
  }

  getFichesSuiviByProjet(projetId: string): Observable<FicheSuivi[]> {
    return this.http.get<FicheSuivi[]>(`${this.ficheSuiviUrl}/projet/${projetId}`);
  }

  getAllFichesSuivi(): Observable<FicheSuivi[]> {
    return this.http.get<FicheSuivi[]>(this.ficheSuiviUrl);
  }

  updateFicheSuivi(id: string, fiche: FicheSuivi): Observable<FicheSuivi> {
    return this.http.put<FicheSuivi>(`${this.ficheSuiviUrl}/${id}`, fiche);
  }

  deleteFicheSuivi(id: string): Observable<void> {
    return this.http.delete<void>(`${this.ficheSuiviUrl}/${id}`);
  }
}
