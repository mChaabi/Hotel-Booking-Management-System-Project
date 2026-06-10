import { HttpInterceptorFn, HttpErrorResponse }
  from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

// ─────────────────────────────────────────────────────────
// INTERCEPTOR JWT
//
// Ajoute automatiquement le token JWT à CHAQUE requête HTTP.
//
// Avant  → GET /api/v1/bookings
// Après  → GET /api/v1/bookings
//           Authorization: Bearer eyJhbGci...
//
// Si réponse 401 → déconnexion + redirection login
// ─────────────────────────────────────────────────────────
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const token  = auth.getToken();

  // Cloner la requête avec le header Authorization
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': req.headers.get('Content-Type')
                          || 'application/json'
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 → token expiré ou invalide
      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }
      // 403 → pas les droits
      if (error.status === 403) {
        router.navigate(['/dashboard']);
      }
      return throwError(() => error);
    })
  );
};
