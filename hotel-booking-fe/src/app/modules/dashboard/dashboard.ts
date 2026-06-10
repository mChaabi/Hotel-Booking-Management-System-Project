import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking';
import { AuthService }    from '../../core/services/auth';
import { Booking, BOOKING_STATUS_CSS, BOOKING_STATUS_LABELS }
  from '../../models/booking';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl:    './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  private bookingService = inject(BookingService);
  private authService    = inject(AuthService);
  today = new Date();

  // ─── État réactif ────────────────────────────────────
  user          = computed(() => this.authService.currentUser());
  bookings      = signal<Booking[]>([]);
  loading       = signal(true);
  aiMessage     = signal('');

  // ─── Statistiques calculées depuis les vraies données ─
  stats = computed(() => {
    const all = this.bookings();
    return {
      total:     all.length,
      confirmed: all.filter(b => b.status === 'CONFIRMED').length,
      pending:   all.filter(b => b.status === 'PENDING').length,
      cancelled: all.filter(b => b.status === 'CANCELLED').length,
      revenue:   all
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    };
  });

  // 5 dernières réservations
  recentBookings = computed(() =>
    [...this.bookings()]
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
  );

  ngOnInit() {
    this.loadBookings();
    this.loadAiInsight();
  }

  loadBookings() {
    this.loading.set(true);
    this.bookingService.getMyBookings().subscribe({
      next: data => {
        this.bookings.set(data);
        this.loading.set(false);
      },
      error: () => {
        // Données démo si backend non disponible
        this.bookings.set(this.demoBookings());
        this.loading.set(false);
      }
    });
  }

  loadAiInsight() {
    setTimeout(() => {
      const msgs = [
        "Vos réservations sont en hausse ce mois. Pensez à vérifier les disponibilités pour le week-end prochain.",
        "3 chambres Suite sont à fort taux d'occupation. Recommandation : ouvrir la liste d'attente.",
        "Votre taux de confirmation est excellent ! Continuez à réserver tôt pour les meilleures offres.",
      ];
      this.aiMessage.set(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 1200);
  }

  // Utilitaires pour le template
  statusLabel(status: string) {
    return BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS]
      ?? status;
  }

  statusCss(status: string) {
    return BOOKING_STATUS_CSS[status as keyof typeof BOOKING_STATUS_CSS]
      ?? 'chip-pending';
  }

  greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  // Données démo
  private demoBookings(): Booking[] {
    return [
      {
        id: '1', bookingReference: 'BK-2026-00047',
        hotelName: 'Hôtel Mazagan Beach', hotelCity: 'El Jadida',
        hotelPhone: '+212 523 38 80 00', hotelEmail: 'contact@mazagan.ma',
        roomType: 'Suite Royale', roomNumber: '412',
        primaryImageUrl: 'assets/images/room-default.jpg',
        checkIn: '2026-06-01', checkOut: '2026-06-05',
        nights: 4, totalPrice: 7770, guestsCount: 2,
        status: 'CONFIRMED',
        clientFirstName: 'Youssef', clientEmail: 'youssef@test.ma',
        createdAt: new Date().toISOString()
      },
      {
        id: '2', bookingReference: 'BK-2026-00031',
        hotelName: 'Riad Salam', hotelCity: 'Marrakech',
        hotelPhone: '', hotelEmail: '',
        roomType: 'Chambre Deluxe', roomNumber: '205',
        primaryImageUrl: 'assets/images/room-default.jpg',
        checkIn: '2026-05-15', checkOut: '2026-05-18',
        nights: 3, totalPrice: 2760, guestsCount: 2,
        status: 'PENDING',
        clientFirstName: 'Youssef', clientEmail: 'youssef@test.ma',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3', bookingReference: 'BK-2026-00018',
        hotelName: 'Sofitel Fès', hotelCity: 'Fès',
        hotelPhone: '', hotelEmail: '',
        roomType: 'Suite Prestige', roomNumber: '801',
        primaryImageUrl: 'assets/images/room-default.jpg',
        checkIn: '2026-04-10', checkOut: '2026-04-13',
        nights: 3, totalPrice: 9600, guestsCount: 1,
        status: 'COMPLETED',
        clientFirstName: 'Youssef', clientEmail: 'youssef@test.ma',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
    ];
  }
}
