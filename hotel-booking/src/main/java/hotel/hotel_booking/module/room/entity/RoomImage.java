package hotel.hotel_booking.module.room.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "room_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class RoomImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    @ToString.Exclude
    private Room room;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    // ✅ FIX — @Builder.Default
    @Builder.Default
    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    // ✅ FIX — @Builder.Default
    @Builder.Default
    @Column(name = "display_order")
    private Integer displayOrder = 0;

    private String altText;

    @CreatedDate
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;
}