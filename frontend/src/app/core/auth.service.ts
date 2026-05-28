import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { Utilisateur, AuthResponse, RoleNom } from '../models/utilisateur.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkToken();
  }

  get currentUser(): Utilisateur | null {
    return this.currentUserSubject.value;
  }

  login(email: string, motDePasse: string): Observable<Utilisateur> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/signin`, { email, password: motDePasse })
      .pipe(
        map((response: AuthResponse) => {
          localStorage.setItem('token', response.token);
          
          const user: Utilisateur = {
            id: response.id,
            email: response.email,
            nom: '', 
            prenom: '',
            role: { nomRole: (response.roles && response.roles.length > 0 ? response.roles[0] : RoleNom.CHEF_PROJET) as RoleNom },
            roles: response.roles ? response.roles.map(r => ({ nomRole: r as RoleNom })) : [],
            actif: true
          };
          
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  getCurrentUserRole(): RoleNom | null {
    return this.currentUser?.role?.nomRole || null;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decodedToken: any = jwtDecode(token);
      const isExpired = decodedToken.exp * 1000 < Date.now();
      if (isExpired) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  hasRole(roleNom: RoleNom): boolean {
    if (this.currentUser?.role?.nomRole === roleNom) return true;
    return this.currentUser?.roles?.some(r => r.nomRole === roleNom) || false;
  }

  private checkToken() {
    const token = this.getToken();
    const savedUser = localStorage.getItem('user');
    
    if (token && this.isAuthenticated()) {
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } else {
        try {
          const decodedToken: any = jwtDecode(token);
          this.currentUserSubject.next({
            email: decodedToken.sub,
            nom: decodedToken.nom || '',
            prenom: decodedToken.prenom || '',
            role: { nomRole: decodedToken.role as RoleNom },
            roles: decodedToken.roles ? decodedToken.roles.map((r: any) => ({ nomRole: r as RoleNom })) : [],
            actif: true
          });
        } catch (e) {
          this.logout();
        }
      }
    }
  }
}
