package hotel.hotel_booking.module.booking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BookingResponseDTO {
    private UUID id;
    private String bookingReference;
    private String hotelName;
    private String hotelCity;
    private String hotelPhone;
    private String hotelEmail;
    private String roomType;
    private String roomNumber;
    private String primaryImageUrl;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private long nights;
    private BigDecimal totalPrice;
    private String status;
    private String clientFirstName;
    private String clientEmail;
    private LocalDateTime createdAt;
}
