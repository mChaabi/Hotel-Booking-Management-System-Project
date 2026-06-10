package hotel.hotel_booking.module.room.repository;

import hotel.hotel_booking.module.room.entity.Room;
import hotel.hotel_booking.module.room.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {

    /**
     * Trouver toutes les chambres d'un hôtel spécifique
     */
    List<Room> findByHotelId(UUID hotelId);

    /**
     * Trouver les chambres disponibles par type (ex: DELUXE, SINGLE)
     */
    List<Room> findByTypeAndIsAvailableTrue(RoomType type);

    /**
     * Trouver les chambres avec vue sur mer et disponibles
     */
    List<Room> findBySeaViewTrueAndIsAvailableTrue();

    /**
     * Recherche personnalisée : chambres disponibles pour une capacité donnée
     * sous un certain prix.
     */
    /**
     * Charge une chambre avec son hôtel et ses images en une seule requête (Eager Loading)
     */
    @Query("SELECT r FROM Room r " +
            "LEFT JOIN FETCH r.hotel " +
            "LEFT JOIN FETCH r.images " +
            "WHERE r.id = :id")
    Optional<Room> findByIdWithHotelAndImages(@Param("id") UUID id);
}