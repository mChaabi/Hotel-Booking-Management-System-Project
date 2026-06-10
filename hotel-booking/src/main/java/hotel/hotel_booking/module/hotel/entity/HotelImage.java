package hotel.hotel_booking.module.hotel.entity;

import jakarta.persistence.*;
        import lombok.*;
        import java.util.UUID;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HotelImage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String imageUrl;
    private int displayOrder;

    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;
}