import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { KPI } from '../models/app.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KPIService {
  private apiUrl = `${environment.apiUrl}/kpis`;

  constructor(private http: HttpClient) {}

  getKPIs(): Observable<KPI[]> {
    return this.http.get<KPI[]>(this.apiUrl);
  }

  exportPDF() {
    return this.http.get(`${this.apiUrl}/export/pdf`, { responseType: 'blob' });
  }

  exportExcel() {
    return this.http.get(`${this.apiUrl}/export/excel`, { responseType: 'blob' });
  }
}
