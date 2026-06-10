import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe }         from '@angular/common';
import { RouterLink }                                  from '@angular/router';
import { BookingService }  from '../../../core/services/booking';
import {
  Booking,
  BookingStatus,
  BOOKING_STATUS_CSS,
  BOOKING_STATUS_LABELS
} from '../../../models/booking';

type FilterType = 'ALL' | BookingStatus;

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './booking-list.html',
  styleUrl:    './booking-list.scss'
})
export class BookingListComponent implements OnInit {

  private bookingService = inject(BookingService);

  // ─── État ─────────────────────────────────────────────
  bookings        = signal<Booking[]>([]);
  loading         = signal(true);
  activeFilter    = signal<FilterType>('ALL');
  cancelling      = signal<string | null>(null);
  showCancelModal = signal(false);
  selectedBooking = signal<Booking | null>(null);

  // ─── Filtrage réactif ─────────────────────────────────
  filtered = computed(() => {
    const f = this.activeFilter();
    const all = this.bookings();
    if (f === 'ALL') return all;
    return all.filter(b => b.status === f);
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.bookingService.getMyBookings().subscribe({
      next: data => {
        this.bookings.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.bookings.set(this.demoData());
        this.loading.set(false);
      }
    });
  }

  // ─── Filtres ─────────────────────────────────────────
  setFilter(f: FilterType) { this.activeFilter.set(f); }

  countByStatus(status: string): number {
    return this.bookings().filter(b => b.status === status).length;
  }

  // ─── Annulation ──────────────────────────────────────
  openCancelModal(b: Booking) {
    this.selectedBooking.set(b);
    this.showCancelModal.set(true);
  }

  closeCancelModal() {
    this.showCancelModal.set(false);
    this.selectedBooking.set(null);
  }

  confirmCancel() {
    const b = this.selectedBooking();
    if (!b) return;

    this.cancelling.set(b.id);

    this.bookingService.cancel(b.id).subscribe({
      next: updated => {
        // Mettre à jour localement sans recharger
        this.bookings.update(list =>
          list.map(item =>
            item.id === b.id
              ? { ...item, status: 'CANCELLED' as BookingStatus }
              : item
          )
        );
        this.cancelling.set(null);
        this.closeCancelModal();
      },
      error: () => {
        this.cancelling.set(null);
        // En démo : simuler l'annulation
        this.bookings.update(list =>
          list.map(item =>
            item.id === b.id
              ? { ...item, status: 'CANCELLED' as BookingStatus }
              : item
          )
        );
        this.closeCancelModal();
      }
    });
  }

  // ─── Utilitaires ─────────────────────────────────────
  statusLabel(s: string) {
    return BOOKING_STATUS_LABELS[s as keyof typeof BOOKING_STATUS_LABELS] ?? s;
  }

  statusCss(s: string) {
    return BOOKING_STATUS_CSS[s as keyof typeof BOOKING_STATUS_CSS] ?? 'chip-pending';
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/images/room-default.jpg';
  }

  // ─── Données démo ─────────────────────────────────────
  private demoData(): Booking[] {
    return [
      {
        id: '1', bookingReference: 'BK-2026-00047',
        hotelName: 'Hôtel Mazagan Beach Resort',
        hotelCity: 'El Jadida',
        hotelPhone: '+212 523 38 80 00',
        hotelEmail: 'contact@mazagan.ma',
        roomType: 'Suite Royale Panoramique',
        roomNumber: '412',
        primaryImageUrl: 'assets/images/room-default.jpg',
        checkIn: '2026-06-01', checkOut: '2026-06-05',
        nights: 4, totalPrice: 7770, guestsCount: 2,
        status: 'CONFIRMED',
        specialRequests: 'Chambre non-fumeur, arrivée tardive',
        clientFirstName: 'Youssef', clientEmail: 'youssef@test.ma',
        createdAt: new Date().toISOString()
      },
      {
        id: '2', bookingReference: 'BK-2026-00031',
        hotelName: 'Riad Salam Marrakech',
        hotelCity: 'Marrakech',
        hotelPhone: '+212 524 43 57 00',
        hotelEmail: 'reservation@riadsalam.ma',
        roomType: 'Chambre Deluxe Jardin',
        roomNumber: '205',
        primaryImageUrl: 'assets/images/room-default.jpg',
        checkIn: '2026-05-15', checkOut: '2026-05-18',
        nights: 3, totalPrice: 2760, guestsCount: 2,
        status: 'PENDING',
        clientFirstName: 'Youssef', clientEmail: 'youssef@test.ma',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3', bookingReference: 'BK-2026-00018',
        hotelName: 'Sofitel Fès Palais Jamai',
        hotelCity: 'Fès',
        hotelPhone: '+212 535 63 43 31',
        hotelEmail: 'h3473@sofitel.com',
        roomType: 'Suite Prestige Atlas',
        roomNumber: '801',
        primaryImageUrl: 'assets/images/room-default.jpg',
        checkIn: '2026-04-10', checkOut: '2026-04-13',
        nights: 3, totalPrice: 9600, guestsCount: 1,
        status: 'COMPLETED',
        clientFirstName: 'Youssef', clientEmail: 'youssef@test.ma',
        createdAt: new Date(Date.now() - 2592000000).toISOString()
      },
      {
        id: '4', bookingReference: 'BK-2025-00092',
        hotelName: 'Barceló Tétouan',
        hotelCity: 'Tétouan',
        hotelPhone: '+212 539 96 99 00',
        hotelEmail: 'tetouan@barcelo.com',
        roomType: 'Junior Suite Médina',
        roomNumber: '304',
        primaryImageUrl: 'assets/images/room-default.jpg',
        checkIn: '2025-12-20', checkOut: '2025-12-22',
        nights: 2, totalPrice: 2200, guestsCount: 2,
        status: 'CANCELLED',
        clientFirstName: 'Youssef', clientEmail: 'youssef@test.ma',
        createdAt: new Date(Date.now() - 7776000000).toISOString()
      }
    ];
  }
}
