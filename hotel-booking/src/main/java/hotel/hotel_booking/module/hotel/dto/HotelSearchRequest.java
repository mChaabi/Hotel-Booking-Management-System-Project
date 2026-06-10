package hotel.hotel_booking.module.hotel.dto;

import jakarta.validation.constraints.NotBlank;


public record HotelSearchRequest(
        @NotBlank(message = "La ville est obligatoire")
        String city
) {}