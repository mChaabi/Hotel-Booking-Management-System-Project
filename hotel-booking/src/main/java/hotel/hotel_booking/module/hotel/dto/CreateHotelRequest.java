package hotel.hotel_booking.module.hotel.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CreateHotelRequest(
        @NotBlank String name,
        @NotBlank String address,
        @NotBlank String city,
        @NotBlank String country,
        @Min(1) @Max(5) Integer stars,
        String phoneNumber,
        String email,
        List<String> amenities
) {}
