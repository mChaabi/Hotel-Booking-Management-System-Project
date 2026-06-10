import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel';
import { Hotel, Room } from '../../../models/hotel';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './hotel-detail.html',
  styleUrl:    './hotel-detail.scss'
})
export class HotelDetailComponent implements OnInit {

  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private hotelService = inject(HotelService);

  // ─── State ────────────────────────────────────────────
  hotel      = signal<Hotel | null>(null);
  loading    = signal(true);
  galIdx     = signal(0);       // index image galerie
  activeTab  = signal<'rooms' | 'contact' | 'amenities'>('rooms');

  minPrice = computed(() => {
  const h = this.hotel();
  if (!h || !h.rooms || h.rooms.length === 0) return 0;

  // Find the minimum price among all rooms
  return Math.min(...h.rooms.map(room => room.pricePerNight));
});

  // ─── Image galerie ────────────────────────────────────
  // Images fictives si pas d'images backend
  galleryImages = computed(() => {
    const imgs = this.hotel()?.images ?? [];
    if (imgs.length > 0) return imgs.map(i => i.imageUrl);
    // Images placeholder colorées
    return [
      'assets/images/room-default.jpg',
      'assets/images/room-default.jpg',
      'assets/images/room-default.jpg',
      'assets/images/room-default.jpg',
    ];
  });

  currentImage = computed(() =>
    this.galleryImages()[this.galIdx()] || 'assets/images/room-default.jpg'
  );


  openMap() {
  window.open(this.googleMapsUrl(), '_blank');
}
  // ─── Init ─────────────────────────────────────────────
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/hotels']); return; }

    this.hotelService.getById(id).subscribe({
      next: h => {
        this.hotel.set(h);
        this.loading.set(false);
      },
      error: () => {
        // Données démo si backend absent
        this.hotel.set(this.demoHotel(id));
        this.loading.set(false);
      }
    });
  }

  // ─── Galerie ──────────────────────────────────────────
  galNext() {
    const max = this.galleryImages().length;
    this.galIdx.update(i => (i + 1) % max);
  }

  galPrev() {
    const max = this.galleryImages().length;
    this.galIdx.update(i => (i - 1 + max) % max);
  }

  setGalIdx(i: number) { this.galIdx.set(i); }

  // ─── Utilitaires ──────────────────────────────────────
  starsArray(n: number) {
    return [1,2,3,4,5].map(i => ({ n: i, filled: i <= n }));
  }

  goBack() { this.router.navigate(['/hotels']); }

  reserve(room: Room) {
    this.router.navigate(['/booking', room.id]);
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/images/room-default.jpg';
  }

  googleMapsUrl() {
    const h = this.hotel();
    if (!h) return '#';
    if (h.latitude && h.longitude)
      return `https://maps.google.com/?q=${h.latitude},${h.longitude}`;
    return `https://maps.google.com/?q=${encodeURIComponent(h.address + ', ' + h.city)}`;
  }

  // ─── Données démo ─────────────────────────────────────
  private demoHotel(id: string): Hotel {
    return {
      id,
      name: 'Hôtel Mazagan Beach Resort',
      description: `Situé sur la magnifique côte atlantique du Maroc à El Jadida,
        le Mazagan Beach Resort est un resort 5 étoiles de renommée internationale.
        Avec ses plages privées, ses piscines, son casino et son golf 18 trous,
        il offre une expérience hôtelière exceptionnelle.`,
      address: 'Route de Casablanca, El Jadida 24000',
      city: 'El Jadida', country: 'Maroc',
      stars: 5, latitude: 33.23, longitude: -8.50,
      phoneNumber: '+212 523 38 80 00',
      email: 'reservation@mazagan.ma',
      websiteUrl: 'www.mazaganbeachresort.com',
      checkInTime: '14:00', checkOutTime: '12:00',
      amenities: [
        'Piscine intérieure', 'Piscine extérieure',
        'Spa & Hammam', 'Golf 18 trous', 'Plage privée',
        'Casino', 'Restaurant gastronomique', 'Bar lounge',
        'Salle de sport', 'Club enfants', 'Parking gratuit',
        'WiFi gratuit', 'Navette aéroport', 'Concierge 24h/24'
      ],
      images: [], isActive: true,
      rooms: [
        {
          id: 'r1', hotelId: id, roomNumber: '412',
          type: 'SUITE', typeLabel: 'Suite Royale Panoramique',
          capacity: 2, pricePerNight: 1850,
          description: 'Suite luxueuse de 120m² avec vue panoramique sur l\'océan Atlantique. Jacuzzi privé, salon séparé, terrasse.',
          floorNumber: 8, roomSizeM2: 120,
          wifi: true, airConditioning: true, minibar: true,
          jacuzzi: true, seaView: true, parking: true, breakfast: true,
          images: [], primaryImageUrl: 'assets/images/room-default.jpg', isAvailable: true
        },
        {
          id: 'r2', hotelId: id, roomNumber: '305',
          type: 'DELUXE', typeLabel: 'Chambre Deluxe Jardin',
          capacity: 2, pricePerNight: 920,
          description: 'Chambre de 75m² avec terrasse privée donnant sur les jardins tropicaux.',
          floorNumber: 3, roomSizeM2: 75,
          wifi: true, airConditioning: true, minibar: false,
          jacuzzi: false, seaView: false, parking: true, breakfast: true,
          images: [], primaryImageUrl: 'assets/images/room-default.jpg', isAvailable: true
        },
        {
          id: 'r3', hotelId: id, roomNumber: '201',
          type: 'DOUBLE', typeLabel: 'Chambre Double Confort',
          capacity: 2, pricePerNight: 650,
          description: 'Chambre de 45m² confortable, idéale pour un séjour découverte.',
          floorNumber: 2, roomSizeM2: 45,
          wifi: true, airConditioning: true, minibar: false,
          jacuzzi: false, seaView: false, parking: true, breakfast: false,
          images: [], primaryImageUrl: 'assets/images/room-default.jpg', isAvailable: true
        },
        {
          id: 'r4', hotelId: id, roomNumber: '510',
          type: 'JUNIOR_SUITE', typeLabel: 'Junior Suite Vue Mer',
          capacity: 3, pricePerNight: 1200,
          description: 'Suite de 90m² avec vue mer partielle, parfaite pour les familles.',
          floorNumber: 5, roomSizeM2: 90,
          wifi: true, airConditioning: true, minibar: true,
          jacuzzi: false, seaView: true, parking: true, breakfast: true,
          images: [], primaryImageUrl: 'assets/images/room-default.jpg', isAvailable: true
        }
      ]
    };
  }
}
