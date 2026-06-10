package hotel.hotel_booking.module.room.mapper;
import hotel.hotel_booking.module.room.dto.RoomImageDTO;
import hotel.hotel_booking.module.room.entity.RoomImage;
import org.springframework.stereotype.Component;

@Component
public class RoomImageMapper {

    public RoomImageDTO toDto(RoomImage entity) {
        if (entity == null) return null;

        return RoomImageDTO.builder()
                .id(entity.getId())
                .imageUrl(entity.getImageUrl())
                .isPrimary(entity.getIsPrimary())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }
}