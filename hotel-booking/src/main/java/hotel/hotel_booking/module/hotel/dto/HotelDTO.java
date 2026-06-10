package hotel.hotel_booking.module.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotelDTO {
    private UUID id;
    private String name;
    private String city;
    private Integer stars;
    private String primaryImageUrl; // À extraire de la première chambre ou façade
}