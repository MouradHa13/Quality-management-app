import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/kpi.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/notifications`;

  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/mes-notifications`);
  }

  getMesNotifications(nonLuesSeulement: boolean = false): Observable<Notification[]> {
    let params = new HttpParams();
    if (nonLuesSeulement) {
      params = params.set('unreadOnly', 'true');
    }
    return this.http.get<Notification[]>(`${this.apiUrl}/mes-notifications`, { params });
  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  marquerCommeLue(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  marquerToutCommeLue(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  envoyerNotification(destinataireId: string, message: string, type: string = 'INFO', actionUrl?: string): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, {
      destinataireId: destinataireId, // backend format requirement
      message: message,
      type: type,
      actionUrl: actionUrl,
      lu: false
    });
  }
}
