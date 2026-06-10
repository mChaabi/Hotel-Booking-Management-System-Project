package hotel.hotel_booking.module.hotel.dto;

import hotel.hotel_booking.module.room.dto.RoomDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class HotelDetailDTO {
    private UUID id;
    private String name;
    private String description;
    private String address;
    private String city;
    private Integer stars;
    private String phoneNumber;
    private List<String> amenities;
    private List<RoomDTO> rooms; // Liste des chambres disponibles
}