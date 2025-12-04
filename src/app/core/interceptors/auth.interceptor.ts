import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('authToken');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Token agregado a la petición:', req.url);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('authToken');
        
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Por favor, inicia sesión nuevamente',
          confirmButtonColor: '#6f4e37'
        }).then(() => {
          router.navigate(['/auth/login']);
        });
      }

      if (error.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tienes permisos para realizar esta acción',
          confirmButtonColor: '#6f4e37'
        });
      }

      if (error.status === 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde',
          confirmButtonColor: '#6f4e37'
        });
      }

      return throwError(() => error);
    })
  );
};