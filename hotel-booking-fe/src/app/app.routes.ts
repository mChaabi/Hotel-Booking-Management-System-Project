import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [

  // ── Défaut ────────────────────────────────────────────
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // ── Login ─────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login')
        .then(m => m.LoginComponent)
  },

  // ── Dashboard ─────────────────────────────────────────
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./modules/dashboard/dashboard')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // ── Hotels ────────────────────────────────────────────
  {
    path: 'hotels',
    loadComponent: () =>
      import('./modules/hotels/hotel-list/hotel-list')
        .then(m => m.HotelListComponent)
  },
  {
    path: 'hotels/:id',
    loadComponent: () =>
      import('./modules/hotels/hotel-detail/hotel-detail')
        .then(m => m.HotelDetailComponent)
  },

  // ── Booking ───────────────────────────────────────────
  {
    path: 'booking/:roomId',
    loadComponent: () =>
      import('./modules/booking/booking-stepper/booking-stepper')
        .then(m => m.BookingStepperComponent),
    canActivate: [authGuard]
  },
  {
    path: 'booking',
    loadComponent: () =>
      import('./modules/booking/booking-stepper/booking-stepper')
        .then(m => m.BookingStepperComponent),
    canActivate: [authGuard]
  },

  // ── Mes réservations ──────────────────────────────────
  {
    path: 'my-bookings',
    loadComponent: () =>
      import('./modules/booking/booking-list/booking-list')
        .then(m => m.BookingListComponent),
    canActivate: [authGuard]
  },

  // ── Route inconnue ────────────────────────────────────
  { path: '**', redirectTo: 'dashboard' }
];
