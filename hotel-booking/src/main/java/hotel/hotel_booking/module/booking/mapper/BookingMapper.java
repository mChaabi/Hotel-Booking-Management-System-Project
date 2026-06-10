package hotel.hotel_booking.module.booking.mapper;

import hotel.hotel_booking.module.booking.dto.BookingResponseDTO;
import hotel.hotel_booking.module.booking.entity.Booking;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class BookingMapper {

    public BookingResponseDTO toDto(Booking booking) {
        if (booking == null) return null;

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                // On remonte les infos depuis la Room et l'Hotel
                .hotelName(booking.getRoom().getHotel().getName())
                .hotelCity(booking.getRoom().getHotel().getCity())
                .hotelPhone(booking.getRoom().getHotel().getPhoneNumber())
                .hotelEmail(booking.getRoom().getHotel().getEmail())
                // Infos de la chambre
                .roomType(booking.getRoom().getType().name())
                .roomNumber(booking.getRoom().getRoomNumber())
                .primaryImageUrl(booking.getRoom().getPrimaryImageUrl())
                // Dates et calculs
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .nights(booking.getNights())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus().name())
                // Infos client
                .clientFirstName(booking.getUser().getFirstName())
                .clientEmail(booking.getUser().getEmail())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    public List<BookingResponseDTO> toDTOList(List<Booking> bookings) {
        if (bookings == null) return Collections.emptyList();
        return bookings.stream()
                .map(this::toDto)
                .toList();
    }
}
