package hotel.hotel_booking.module.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor // Good practice for JSON deserialization
@AllArgsConstructor
public class RoomDTO {
    private UUID id;
    private String roomNumber;
    private String type;
    private Integer capacity; // ADDED THIS
    private BigDecimal pricePerNight;
    private String primaryImageUrl;
    private boolean available;
}
