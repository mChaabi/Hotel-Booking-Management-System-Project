// ─────────────────────────────────────────────────────────
// MODÈLES RÉSERVATION
// ─────────────────────────────────────────────────────────

export type BookingStatus =
  'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';

// Labels lisibles pour chaque statut
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING:   '⏳ En attente',
  CONFIRMED: '✅ Confirmée',
  CANCELLED: '❌ Annulée',
  COMPLETED: '✔️ Terminée',
  REFUNDED:  '💰 Remboursée',
};

// Classes CSS pour les badges de statut
export const BOOKING_STATUS_CSS: Record<BookingStatus, string> = {
  PENDING:   'chip-pending',
  CONFIRMED: 'chip-confirmed',
  CANCELLED: 'chip-cancelled',
  COMPLETED: 'chip-completed',
  REFUNDED:  'chip-completed',
};

// ── Réservation complète (réponse backend) ────────────────
export interface Booking {
  id: string;
  bookingReference: string;      // ex: BK-2026-00047

  // Infos hôtel (dénormalisées pour l'affichage)
  hotelName: string;
  hotelCity: string;
  hotelPhone: string;
  hotelEmail: string;

  // Infos chambre
  roomType: string;
  roomNumber: string;
  primaryImageUrl: string;

  // Dates
  checkIn: string;               // 'YYYY-MM-DD'
  checkOut: string;
  nights: number;

  // Prix
  totalPrice: number;

  // Détails
  guestsCount: number;
  status: BookingStatus;
  specialRequests?: string;

  // Client
  clientFirstName: string;
  clientEmail: string;

  // Horodatage
  createdAt: string;
  updatedAt?: string;
}

// ── Requête de création (envoyée au backend) ──────────────
export interface CreateBookingRequest {
  roomId: string;
  checkIn: string;               // 'YYYY-MM-DD'
  checkOut: string;
  guestsCount: number;
  specialRequests?: string;
}
