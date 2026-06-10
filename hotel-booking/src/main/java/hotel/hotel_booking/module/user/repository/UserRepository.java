package hotel.hotel_booking.module.user.repository;
import hotel.hotel_booking.module.user.entity.User;
import hotel.hotel_booking.module.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Très important pour Spring Security : charger l'utilisateur par son email
     */
    Optional<User> findByEmail(String email);

    /**
     * Vérifier si un email existe déjà (utile lors de l'inscription)
     */
    boolean existsByEmail(String email);

    /**
     * Trouver les utilisateurs par rôle (ex: ADMIN, GUEST)
     */
    List<User> findByRole(UserRole role);

    /**
     * Trouver les "Top clients" selon les points de fidélité
     */
    List<User> findTop10ByOrderByLoyaltyPointsDesc();
}