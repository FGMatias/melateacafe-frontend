import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { LoginResponse, Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/v1/auth';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const userStorage = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

    if (userStorage && token) {
      this.currentUserSubject.next(JSON.parse(userStorage));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.usuario));
        localStorage.setItem('isAuthenticated', 'true');
        
        this.currentUserSubject.next(response.usuario);
        
        console.log('Login exitoso, token guardado:', response.token);
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    return !!(token && isAuth);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.rol?.nombre === roleName;
  }

  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user?.rol ? [user.rol.nombre] : [];
  }
}