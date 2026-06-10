package hotel.hotel_booking.module.room.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    @ToString.Exclude
    hotel.hotel_booking.module.hotel.entity.Hotel hotel;

    @Column(name = "room_number", nullable = false)
    String roomNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    RoomType type;

    @NotNull(message = "Capacity is required")
    @Column(nullable = false)
    Integer capacity;

    @Column(name = "price_per_night", nullable = false,
            precision = 10, scale = 2)
    BigDecimal pricePerNight;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "floor_number")
    Integer floorNumber;

    @Column(name = "room_size_m2")
    Integer roomSizeM2;

    // ✅ FIX — Ajouter @Builder.Default sur tous les champs avec valeur par défaut
    @Builder.Default
    Boolean wifi = true;

    @Builder.Default
    Boolean airConditioning = true;

    @Builder.Default
    Boolean minibar = false;

    @Builder.Default
    Boolean jacuzzi = false;

    @Builder.Default
    Boolean seaView = false;

    @Builder.Default
    Boolean parking = false;

    @Builder.Default
    Boolean breakfast = false;

    // ✅ FIX — @Builder.Default sur la liste
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL,
            orphanRemoval = true)
    @OrderBy("isPrimary DESC, displayOrder ASC")
    @Builder.Default
    List<RoomImage> images = new ArrayList<>();

    // ✅ FIX — @Builder.Default
    @Builder.Default
    @Column(name = "is_available")
    Boolean isAvailable = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    // Méthode utilitaire
    public String getPrimaryImageUrl() {
        return images.stream()
                .filter(RoomImage::getIsPrimary)
                .map(RoomImage::getImageUrl)
                .findFirst()
                .orElse("/images/default-room.jpg");
    }
}