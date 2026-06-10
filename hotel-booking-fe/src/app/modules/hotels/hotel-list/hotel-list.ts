import {
  Component, OnInit, inject,
  signal, computed
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup, FormControl
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HotelService }   from '../../../core/services/hotel';
import { AiChatService }  from '../../../core/services/ai';
import { Hotel, Room, HotelSearchParams } from '../../../models/hotel';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './hotel-list.html',
  styleUrl:    './hotel-list.scss'
})
export class HotelListComponent implements OnInit {

  private hotelService = inject(HotelService);
  private aiService    = inject(AiChatService);
  private router       = inject(Router);

  // ─── Signals ──────────────────────────────────────────
  hotels      = signal<Hotel[]>([]);
  loading     = signal(false);
  aiRec       = signal('');
  currentPage = signal(0);
  totalPages  = signal(1);
  minStars    = signal(1);

  today = new Date().toISOString().split('T')[0];

  // Favoris stockés localement
  favorites = new Set<string>();

  // Filtres équipements
  filters = {
    seaView:   false,
    jacuzzi:   false,
    parking:   false,
    breakfast: false
  };

  // Formulaire de recherche
  searchForm = new FormGroup({
    city:     new FormControl('Tétouan'),
    checkIn:  new FormControl(''),
    checkOut: new FormControl(''),
    guests:   new FormControl(2),
    maxPrice: new FormControl(5000),
    sortBy:   new FormControl('STARS_DESC'),
  });

  // ─── Toutes les chambres extraites des hôtels ─────────
  allRooms = computed(() =>
    this.hotels().flatMap(h =>
      h.rooms.map(r => ({ ...r, hotel: h }))
    )
  );

  totalRooms = computed(() => this.allRooms().length);

  // ─── Init ─────────────────────────────────────────────
  ngOnInit() {
    this.initDates();
    this.search();
  }

  initDates() {
    const d1 = new Date(); d1.setDate(d1.getDate() + 1);
    const d2 = new Date(); d2.setDate(d2.getDate() + 5);
    this.searchForm.patchValue({
      checkIn:  d1.toISOString().split('T')[0],
      checkOut: d2.toISOString().split('T')[0]
    });
  }

  // ─── Recherche ────────────────────────────────────────
  search() {
    this.loading.set(true);

    const v = this.searchForm.value;
    const params: HotelSearchParams = {
      city:      v.city      || 'Tétouan',
      checkIn:   v.checkIn   || '',
      checkOut:  v.checkOut  || '',
      guests:    v.guests    || 2,
      minStars:  this.minStars(),
      maxPrice:  v.maxPrice  || 5000,
      sortBy:    (v.sortBy as any) || 'STARS_DESC',
      page:      this.currentPage(),
      size:      12,
      seaView:   this.filters.seaView,
      jacuzzi:   this.filters.jacuzzi,
      parking:   this.filters.parking,
      breakfast: this.filters.breakfast
    };

    this.hotelService.search(params).subscribe({
      next: page => {
        this.hotels.set(page.content);
        this.totalPages.set(page.totalPages || 1);
        this.loading.set(false);
      },
      error: () => {
        // Données démo si backend absent
        this.hotels.set(this.demoHotels());
        this.totalPages.set(1);
        this.loading.set(false);
      }
    });

    // Recommandation IA en parallèle
    const city = v.city || 'Tétouan';
    this.aiService.chat(
      `Recommande brièvement en 1 phrase un type de chambre à ${city}
       pour ${v.guests} personnes. Sois concis et professionnel.`,
      []
    ).subscribe({
      next:  r   => this.aiRec.set(r),
      error: ()  => this.aiRec.set(
        `Forte demande à ${city} — réservez maintenant pour les meilleures disponibilités.`
      )
    });
  }

  // ─── Filtres ──────────────────────────────────────────
  setMinStars(n: number) {
    this.minStars.set(n);
  }

  toggleFilter(key: keyof typeof this.filters) {
    this.filters[key] = !this.filters[key];
  }

  resetFilters() {
    this.minStars.set(1);
    this.filters.seaView   = false;
    this.filters.jacuzzi   = false;
    this.filters.parking   = false;
    this.filters.breakfast = false;
    this.searchForm.patchValue({ maxPrice: 5000 });
    this.search();
  }

  // ─── Pagination ───────────────────────────────────────
  goPage(p: number) {
    this.currentPage.set(p);
    this.search();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Navigation ───────────────────────────────────────
  goToDetail(room: Room) {
    this.router.navigate(['/hotels', room.hotelId]);
  }

  // ─── Favoris ──────────────────────────────────────────
  toggleFav(room: Room, e: Event) {
    e.stopPropagation();
    if (this.favorites.has(room.id)) {
      this.favorites.delete(room.id);
    } else {
      this.favorites.add(room.id);
    }
  }

  // ─── Utilitaires ──────────────────────────────────────
  // Génère un tableau pour afficher les étoiles
  starsArray(count: number): Array<{ n: number; filled: boolean }> {
    return [1, 2, 3, 4, 5].map(n => ({
      n,
      filled: n <= (count || 0)
    }));
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/images/room-default.jpg';
  }

  // ─── Données démo ─────────────────────────────────────
  private demoHotels(): Hotel[] {
    return [
      {
        id: 'h1',
        name: 'Hôtel Mazagan Beach Resort',
        description: 'Resort 5 étoiles sur la côte atlantique',
        address: 'Route de Casablanca, El Jadida',
        city: 'El Jadida', country: 'Maroc',
        stars: 5, latitude: 33.23, longitude: -8.5,
        phoneNumber: '+212 523 38 80 00',
        email: 'contact@mazagan.ma',
        websiteUrl: 'mazagan.ma',
        checkInTime: '14:00', checkOutTime: '12:00',
        amenities: ['Piscine', 'Spa', 'Golf', 'Plage privée'],
        images: [], isActive: true,
        rooms: [
          {
            id: 'r1', hotelId: 'h1', roomNumber: '412',
            type: 'SUITE', typeLabel: 'Suite Royale Panoramique',
            capacity: 2, pricePerNight: 1850,
            description: 'Suite luxueuse avec vue océan',
            floorNumber: 8, roomSizeM2: 120,
            wifi: true, airConditioning: true, minibar: true,
            jacuzzi: true, seaView: true, parking: true, breakfast: true,
            images: [],
            primaryImageUrl: 'assets/images/room-default.jpg',
            isAvailable: true
          },
          {
            id: 'r2', hotelId: 'h1', roomNumber: '305',
            type: 'DELUXE', typeLabel: 'Chambre Deluxe Jardin',
            capacity: 2, pricePerNight: 920,
            description: 'Chambre avec terrasse et vue jardin',
            floorNumber: 3, roomSizeM2: 75,
            wifi: true, airConditioning: true, minibar: false,
            jacuzzi: false, seaView: false, parking: true, breakfast: true,
            images: [],
            primaryImageUrl: 'assets/images/room-default.jpg',
            isAvailable: true
          }
        ]
      },
      {
        id: 'h2',
        name: 'Sofitel Fès Palais Jamai',
        description: 'Palace historique au cœur de la médina de Fès',
        address: 'Bab Guissa, Fès',
        city: 'Fès', country: 'Maroc',
        stars: 5, latitude: 34.06, longitude: -5.0,
        phoneNumber: '+212 535 63 43 31',
        email: 'h3473@sofitel.com', websiteUrl: 'sofitel.com',
        checkInTime: '15:00', checkOutTime: '12:00',
        amenities: ['Piscine', 'Spa', 'Hammam', 'Restaurant'],
        images: [], isActive: true,
        rooms: [
          {
            id: 'r3', hotelId: 'h2', roomNumber: '801',
            type: 'SUITE', typeLabel: 'Suite Prestige Atlas',
            capacity: 2, pricePerNight: 3200,
            description: 'Suite avec vue sur les toits de Fès',
            floorNumber: 8, roomSizeM2: 200,
            wifi: true, airConditioning: true, minibar: true,
            jacuzzi: true, seaView: false, parking: true, breakfast: true,
            images: [],
            primaryImageUrl: 'assets/images/room-default.jpg',
            isAvailable: true
          }
        ]
      },
      {
        id: 'h3',
        name: 'Barceló Tétouan',
        description: 'Hôtel moderne avec vue sur la médina et la mer',
        address: 'Avenue Mohamed VI, Tétouan',
        city: 'Tétouan', country: 'Maroc',
        stars: 4, latitude: 35.57, longitude: -5.36,
        phoneNumber: '+212 539 96 99 00',
        email: 'tetouan@barcelo.com', websiteUrl: 'barcelo.com',
        checkInTime: '14:00', checkOutTime: '11:00',
        amenities: ['Piscine', 'Restaurant', 'Parking', 'WiFi'],
        images: [], isActive: true,
        rooms: [
          {
            id: 'r4', hotelId: 'h3', roomNumber: '304',
            type: 'JUNIOR_SUITE', typeLabel: 'Junior Suite Médina',
            capacity: 2, pricePerNight: 1100,
            description: 'Suite avec vue panoramique sur la médina',
            floorNumber: 3, roomSizeM2: 55,
            wifi: true, airConditioning: true, minibar: false,
            jacuzzi: false, seaView: false, parking: true, breakfast: false,
            images: [],
            primaryImageUrl: 'assets/images/room-default.jpg',
            isAvailable: true
          },
          {
            id: 'r5', hotelId: 'h3', roomNumber: '201',
            type: 'DOUBLE', typeLabel: 'Chambre Double Confort',
            capacity: 2, pricePerNight: 580,
            description: 'Chambre confortable et moderne',
            floorNumber: 2, roomSizeM2: 35,
            wifi: true, airConditioning: true, minibar: false,
            jacuzzi: false, seaView: false, parking: false, breakfast: false,
            images: [],
            primaryImageUrl: 'assets/images/room-default.jpg',
            isAvailable: true
          }
        ]
      },
      {
        id: 'h4',
        name: 'Riad Salam Marrakech',
        description: 'Riad authentique au cœur de la médina de Marrakech',
        address: 'Derb Jamaa, Médina, Marrakech',
        city: 'Marrakech', country: 'Maroc',
        stars: 4, latitude: 31.63, longitude: -7.99,
        phoneNumber: '+212 524 43 57 00',
        email: 'reservation@riadsalam.ma', websiteUrl: 'riadsalam.ma',
        checkInTime: '14:00', checkOutTime: '12:00',
        amenities: ['Piscine', 'Hammam', 'Terrasse', 'Petit-déjeuner'],
        images: [], isActive: true,
        rooms: [
          {
            id: 'r6', hotelId: 'h4', roomNumber: '102',
            type: 'DELUXE', typeLabel: 'Chambre Deluxe Patio',
            capacity: 2, pricePerNight: 760,
            description: 'Chambre avec vue sur le patio fleuri',
            floorNumber: 1, roomSizeM2: 42,
            wifi: true, airConditioning: true, minibar: false,
            jacuzzi: false, seaView: false, parking: false, breakfast: true,
            images: [],
            primaryImageUrl: 'assets/images/room-default.jpg',
            isAvailable: true
          }
        ]
      }
    ];
  }
}
