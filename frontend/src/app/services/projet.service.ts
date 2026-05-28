import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Project } from '../core/models/app.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/projets`;

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getMesProjets(chefId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/chef/${chefId}`);
  }

  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  create(projet: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, projet);
  }

  update(id: string, projet: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, projet);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
