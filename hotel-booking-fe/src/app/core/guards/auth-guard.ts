import { inject }                from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }           from '../services/auth';

// ─────────────────────────────────────────────────────────
// GUARD 1 — authGuard
// Accessible : tous les rôles (juste connecté)
// ─────────────────────────────────────────────────────────
export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

// ─────────────────────────────────────────────────────────
// GUARD 2 — staffGuard
// Accessible : ADMIN + RECEPTIONIST seulement
// Bloqué    : USER + GUEST → redirige vers /hotels
// ─────────────────────────────────────────────────────────
export const staffGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = auth.currentUser()?.role;

  if (role === 'ADMIN' || role === 'RECEPTIONIST') {
    return true;
  }

  // USER/GUEST → pas accès au dashboard staff
  router.navigate(['/hotels']);
  return false;
};

// ─────────────────────────────────────────────────────────
// GUARD 3 — adminGuard
// Accessible : ADMIN uniquement
// Bloqué    : tous les autres → redirige vers /dashboard
// ─────────────────────────────────────────────────────────
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.currentUser()?.role === 'ADMIN') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

// ─────────────────────────────────────────────────────────
// GUARD 4 — clientGuard
// Accessible : tous les connectés (pour réservations)
// ─────────────────────────────────────────────────────────
export const clientGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
