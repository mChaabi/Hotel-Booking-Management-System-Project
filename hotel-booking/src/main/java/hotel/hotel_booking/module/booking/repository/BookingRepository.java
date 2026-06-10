package hotel.hotel_booking.module.booking.repository;

import hotel.hotel_booking.module.booking.entity.Booking;
import hotel.hotel_booking.module.booking.entity.BookingStatus;
import hotel.hotel_booking.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ✅ FIX — utiliser @Query au lieu du nom de méthode
    // Spring Data ne peut pas parser "findByCheckInAndStatus"
    // car il lit "Check" puis "In" comme deux mots séparés
    @Query("""
        SELECT b FROM Booking b
        WHERE b.checkIn = :checkIn
        AND b.status = :status
    """)
    List<Booking> findByCheckInAndStatus(
            @Param("checkIn") LocalDate checkIn,
            @Param("status") BookingStatus status
    );


    // Option A: If your Booking entity has a field 'user' which has an 'id'
    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // Ensure the naming matches your entity fields exactly
    List<Booking> findTop5ByUserOrderByCreatedAtDesc(User user);

    // Vérifier conflit de dates pour une chambre
    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.room.id = :roomId
        AND b.status NOT IN ('CANCELLED')
        AND b.checkIn < :checkOut
        AND b.checkOut > :checkIn
    """)
    boolean hasConflict(
            @Param("roomId")   UUID roomId,
            @Param("checkIn")  LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    // Annuler les réservations PENDING expirées
    @Modifying
    @Query("""
        UPDATE Booking b SET b.status = 'CANCELLED'
        WHERE b.status = 'PENDING'
        AND b.createdAt < :limit
    """)
    int cancelExpiredPending(@Param("limit") LocalDateTime limit);
}