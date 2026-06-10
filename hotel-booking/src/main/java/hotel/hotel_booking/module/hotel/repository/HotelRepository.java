package hotel.hotel_booking.module.hotel.repository;

import hotel.hotel_booking.module.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, UUID> {

    /**
     * Rechercher des hôtels par ville (insensible à la casse)
     */
    List<Hotel> findByCityIgnoreCaseAndIsActiveTrue(String city);

    /**
     * Filtrer par nombre d'étoiles
     */
    List<Hotel> findByStarsAndIsActiveTrue(Integer stars);

    /**
     * Rechercher un hôtel par son nom (partiel)
     */
    List<Hotel> findByNameContainingIgnoreCase(String name);

    /**
     * Trouver les hôtels actifs dans un pays spécifique
     */
    List<Hotel> findByCountryAndIsActiveTrue(String country);
}