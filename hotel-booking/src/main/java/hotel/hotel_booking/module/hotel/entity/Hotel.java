package hotel.hotel_booking.module.hotel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "hotels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String country;

    private Integer stars;

    private Double latitude;
    private Double longitude;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String email;

    @Column(name = "website_url")
    private String websiteUrl;

    // ✅ FIX — @Builder.Default sur les valeurs par défaut
    @Builder.Default
    @Column(name = "check_in_time")
    private String checkInTime = "14:00";

    @Builder.Default
    @Column(name = "check_out_time")
    private String checkOutTime = "12:00";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "hotel_amenities",
            joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "amenity")
    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL,
            orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<hotel.hotel_booking.module.hotel.entity.HotelImage> images
            = new ArrayList<>();

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    @ToString.Exclude
    @Builder.Default
    private List<hotel.hotel_booking.module.room.entity.Room> rooms
            = new ArrayList<>();

    // ✅ FIX — @Builder.Default
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}