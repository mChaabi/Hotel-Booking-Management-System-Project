// ─────────────────────────────────────────────────────────
// MODÈLES HÔTEL — correspondent aux entités Java du backend
// ─────────────────────────────────────────────────────────

export type RoomType =
  'SINGLE' | 'DOUBLE' | 'TWIN' |
  'DELUXE' | 'JUNIOR_SUITE' | 'SUITE' | 'FAMILY';

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  SINGLE:       'Chambre Simple',
  DOUBLE:       'Chambre Double',
  TWIN:         'Chambre Twin',
  DELUXE:       'Chambre Deluxe',
  JUNIOR_SUITE: 'Junior Suite',
  SUITE:        'Suite',
  FAMILY:       'Chambre Familiale',
};

// ── Image hôtel ───────────────────────────────────────────
export interface HotelImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
}

// ── Image chambre ─────────────────────────────────────────
export interface RoomImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  altText?: string;
}

// ── Chambre ───────────────────────────────────────────────
export interface Room {
  id: string;
  hotelId: string;
  hotel?: Hotel;           // optionnel, chargé avec la relation
  roomNumber: string;
  type: RoomType;
  typeLabel: string;       // label lisible (ex: "Suite Royale")
  capacity: number;
  pricePerNight: number;
  description: string;
  floorNumber: number;
  roomSizeM2: number;

  // Équipements booléens
  wifi: boolean;
  airConditioning: boolean;
  minibar: boolean;
  jacuzzi: boolean;
  seaView: boolean;
  parking: boolean;
  breakfast: boolean;

  images: RoomImage[];
  primaryImageUrl: string;
  isAvailable: boolean;
}

// ── Hôtel ─────────────────────────────────────────────────
export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  stars: number;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  email: string;
  websiteUrl: string;
  checkInTime: string;
  checkOutTime: string;
  amenities: string[];
  images: HotelImage[];
  rooms: Room[];
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
}

// ── Paramètres de recherche ───────────────────────────────
export interface HotelSearchParams {
  city: string;
  checkIn: string;       // 'YYYY-MM-DD'
  checkOut: string;      // 'YYYY-MM-DD'
  guests: number;
  minStars: number;
  maxPrice?: number;
  seaView?: boolean;
  jacuzzi?: boolean;
  parking?: boolean;
  breakfast?: boolean;
  sortBy: 'STARS_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING_DESC';
  page: number;
  size: number;
}

// ── Réponse paginée Spring Boot ───────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
