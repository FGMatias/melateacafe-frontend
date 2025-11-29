import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, switchMap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoginResponse, Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/v1';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const userStorage = localStorage.getItem('currentUser');
    if (userStorage) {
      this.currentUserSubject.next(JSON.parse(userStorage));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuario/username/${username}`).pipe(
      switchMap(usuario => {
        if (!usuario) {
          return throwError(() => new Error('Usuario no encontrado'));
        }

        if (!usuario.estado) {
          return throwError(() => new Error('Usuario inactivo'));
        }

        return this.http.post<any>(`${this.apiUrl}/usuario/verificar-password`, {
          username,
          password
        }).pipe(
          map(response => {
            const loginResponse: LoginResponse = {
              usuario: usuario,
              token: response.token
            };

            localStorage.setItem('currentUser', JSON.stringify(usuario));
            localStorage.setItem('isAuthenticated', 'true');
            
            this.currentUserSubject.next(usuario);

            return loginResponse;
          }),
          catchError(error => {
            console.error('Error verificando contraseña:', error);
            return throwError(() => error);
          })
        );
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
    localStorage.removeItem('recordarCredenciales');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
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