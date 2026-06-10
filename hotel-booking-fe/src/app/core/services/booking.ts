import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, CreateBookingRequest }
  from '../../models/booking';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private http = inject(HttpClient);
  private api  = environment.apiUrl + '/bookings';

  // ── Créer une réservation ────────────────────────────
  create(req: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.api, req);
  }

  // ── Mes réservations (client connecté) ───────────────
  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.api}/my`);
  }

  // ── Toutes les réservations (admin) ──────────────────
  getAll(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.api);
  }

  // ── Annuler une réservation ──────────────────────────
  cancel(id: string): Observable<Booking> {
    return this.http.patch<Booking>(
      `${this.api}/${id}/cancel`, {}
    );
  }

  // ── Détail d'une réservation ─────────────────────────
  getById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.api}/${id}`);
  }
}
