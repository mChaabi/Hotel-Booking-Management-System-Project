package hotel.hotel_booking.module.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomImageDTO {
    private UUID id;
    private String imageUrl;
    private boolean isPrimary;
    private int displayOrder;
}