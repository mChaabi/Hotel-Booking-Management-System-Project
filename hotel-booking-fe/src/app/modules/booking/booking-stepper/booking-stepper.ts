import {
  Component, OnInit, inject,
  signal, computed
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import {
  ReactiveFormsModule, FormsModule,
  FormGroup, FormControl, Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HotelService }   from '../../../core/services/hotel';
import { BookingService } from '../../../core/services/booking';
import { Room }           from '../../../models/hotel';
import { CreateBookingRequest } from '../../../models/booking';

@Component({
  selector: 'app-booking-stepper',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    FormsModule, RouterLink,
    DatePipe, DecimalPipe
  ],
  templateUrl: './booking-stepper.html',
  styleUrl:    './booking-stepper.scss'
})
export class BookingStepperComponent implements OnInit {

  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private hotelService   = inject(HotelService);
  private bookingService = inject(BookingService);

  // ─── Étapes ──────────────────────────────────────────
  steps = ['Coordonnées', 'Séjour', 'Paiement', 'Confirmation'];

  // ─── Signals réactifs ─────────────────────────────────
  room        = signal<Room | null>(null);
  currentStep = signal(0);
  loading     = signal(false);
  bookingRef  = signal('');

  // ─── Modèles simples ──────────────────────────────────
  checkIn    = '';
  checkOut   = '';
  guestsCount = 2;
  bedType    = 'king';
  payMethod  = 'card';
  cardNumber = '';
  cardExpiry = '';
  cardCvv    = '';
  cardName   = '';
  today      = new Date().toISOString().split('T')[0];

  // ─── Calculs réactifs ──────────────────────────────────
  nights = computed(() => {
    if (!this.checkIn || !this.checkOut) return 0;
    const ms = new Date(this.checkOut).getTime()
             - new Date(this.checkIn).getTime();
    const n = Math.round(ms / 86400000);
    return n > 0 ? n : 0;
  });

  subtotal = computed(() =>
    (this.room()?.pricePerNight || 0) * this.nights()
  );

  // Remise 5% si plus de 3 nuits
  discount = computed(() =>
    this.nights() >= 3 ? Math.round(this.subtotal() * 0.05) : 0
  );

  tax = computed(() =>
    Math.round((this.subtotal() - this.discount()) * 0.10)
  );

  total = computed(() =>
    this.subtotal() - this.discount() + this.tax()
  );

  // ─── Formulaire étape 1 ───────────────────────────────
  personalForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    lastName: new FormControl('', Validators.required),
    email:    new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    phone: new FormControl('', [
      Validators.pattern(/^\+?[0-9]{10,15}$/)
    ]),
    specialRequests: new FormControl('', Validators.maxLength(500))
  });

  get pf() { return this.personalForm.controls; }

  // ─── Init ─────────────────────────────────────────────
  ngOnInit() {
    // Dates par défaut : demain → dans 4 jours
    const d1 = new Date(); d1.setDate(d1.getDate() + 1);
    const d2 = new Date(); d2.setDate(d2.getDate() + 4);
    this.checkIn  = d1.toISOString().split('T')[0];
    this.checkOut = d2.toISOString().split('T')[0];

    // Charger la chambre depuis l'URL (/booking/:roomId)
    const roomId = this.route.snapshot.paramMap.get('roomId');
    if (roomId) {
      this.hotelService.getRoomById(roomId).subscribe({
        next: r => this.room.set(r),
        error: () => this.room.set(this.demoRoom())
      });
    } else {
      // Pas de roomId → chambre démo
      this.room.set(this.demoRoom());
    }
  }

  // ─── Validation par étape ─────────────────────────────
  isStepValid(): boolean {
    switch (this.currentStep()) {
      case 0:
        return this.personalForm.valid;
      case 1:
        return !!this.checkIn
            && !!this.checkOut
            && this.nights() > 0;
      case 2:
        return true; // Paiement toujours valide
      default:
        return true;
    }
  }

  // ─── Navigation ───────────────────────────────────────
  next() {
    if (!this.isStepValid()) {
      // Marquer tous les champs comme touchés pour afficher erreurs
      this.personalForm.markAllAsTouched();
      return;
    }
    this.currentStep.update(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prev() {
    this.currentStep.update(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Soumission ───────────────────────────────────────
  submit() {
    if (!this.room()) return;
    this.loading.set(true);

    const req: CreateBookingRequest = {
      roomId:          this.room()!.id,
      checkIn:         this.checkIn,
      checkOut:        this.checkOut,
      guestsCount:     this.guestsCount,
      specialRequests: this.pf['specialRequests'].value || ''
    };

    this.bookingService.create(req).subscribe({
      next: res => {
        // Réservation créée → passer à confirmation
        this.bookingRef.set(res.bookingReference);
        this.currentStep.set(3);
        this.loading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        // Démo : simuler une référence si backend absent
        this.bookingRef.set(
          'BK-' + new Date().getFullYear()
          + '-' + Math.floor(10000 + Math.random() * 90000)
        );
        this.currentStep.set(3);
        this.loading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ─── Utilitaires ──────────────────────────────────────
  onDateChange() {
    // Force recalcul (les computed signals se déclenchent auto)
  }

  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    // Formater en groupes de 4 : 1234 5678 9012 3456
    let v = input.value.replace(/\D/g, '').substring(0, 16);
    v = v.match(/.{1,4}/g)?.join(' ') || v;
    this.cardNumber = v;
    input.value = v;
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/images/room-default.jpg';
  }

  viewMyBookings() {
    this.router.navigate(['/my-bookings']);
  }

  // ─── Chambre démo si pas de roomId ────────────────────
  private demoRoom(): Room {
    return {
      id: 'demo-r1',
      hotelId: 'demo-h1',
      roomNumber: '412',
      type: 'SUITE',
      typeLabel: 'Suite Royale Panoramique',
      capacity: 2,
      pricePerNight: 1850,
      description: 'Suite luxueuse avec vue panoramique sur l\'océan',
      floorNumber: 8,
      roomSizeM2: 120,
      wifi: true,
      airConditioning: true,
      minibar: true,
      jacuzzi: true,
      seaView: true,
      parking: true,
      breakfast: true,
      images: [],
      primaryImageUrl: 'assets/images/room-default.jpg',
      isAvailable: true,
      hotel: {
        id: 'demo-h1',
        name: 'Hôtel Mazagan Beach Resort',
        description: '',
        address: 'Route de Casablanca',
        city: 'El Jadida',
        country: 'Maroc',
        stars: 5,
        latitude: 33.23,
        longitude: -8.5,
        phoneNumber: '+212 523 38 80 00',
        email: 'contact@mazagan.ma',
        websiteUrl: 'mazagan.ma',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        amenities: ['Piscine', 'Spa', 'Golf', 'Plage privée'],
        images: [],
        rooms: [],
        isActive: true
      }
    };
  }
}
