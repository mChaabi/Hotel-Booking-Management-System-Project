package hotel.hotel_booking.module.booking.service;

import hotel.hotel_booking.module.booking.dto.BookingResponseDTO;
import hotel.hotel_booking.module.booking.dto.CreateBookingRequest;
import hotel.hotel_booking.module.booking.entity.Booking;
import hotel.hotel_booking.module.booking.entity.BookingStatus;
import hotel.hotel_booking.module.booking.repository.BookingRepository;
import hotel.hotel_booking.module.room.repository.RoomRepository;
import hotel.hotel_booking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

// ✅ FIX — @Slf4j génère automatiquement le champ log
// Ne pas déclarer manuellement "private static final Logger log = ..."
// Choisir UNE des deux options, pas les deux en même temps
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepo;
    private final RoomRepository roomRepo;
    private final UserRepository userRepo;

    public BookingResponseDTO createBooking(CreateBookingRequest request, UUID userId) {
        log.info("Tentative de réservation pour la chambre : {}", request.roomId());

        // 1. Récupération des entités
        var room = roomRepo.findById(request.roomId())
                .orElseThrow(() -> new RuntimeException("Chambre introuvable"));
        var user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // 2. Vérification de disponibilité (Logique Repository)
        if (bookingRepo.hasConflict(request.roomId(), request.checkIn(), request.checkOut())) {
            throw new RuntimeException("La chambre est déjà occupée pour ces dates.");
        }

        // 3. Calcul du prix
        long nights = ChronoUnit.DAYS.between(request.checkIn(), request.checkOut());
        BigDecimal total = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        // 4. Construction de l'entité
        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkIn(request.checkIn())
                .checkOut(request.checkOut())
                .totalPrice(total)
                .guestsCount(request.guestsCount())
                .specialRequests(request.specialRequests())
                .status(BookingStatus.CONFIRMED)
                .build();

        // 5. Sauvegarde et Mapping vers ResponseDTO
        return mapToResponseDTO(bookingRepo.save(booking));
    }

    public List<BookingResponseDTO> getMyBookings(UUID userId) {
        return bookingRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    // Méthode de mapping manuelle (ou utilisez MapStruct)
    private BookingResponseDTO mapToResponseDTO(Booking b) {
        return BookingResponseDTO.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .hotelName(b.getRoom().getHotel().getName())
                .roomNumber(b.getRoom().getRoomNumber())
                .checkIn(b.getCheckIn())
                .checkOut(b.getCheckOut())
                .nights(b.getNights())
                .totalPrice(b.getTotalPrice())
                .status(b.getStatus().name())
                .clientFirstName(b.getUser().getFirstName())
                .createdAt(b.getCreatedAt())
                .build();
    }
}