package hotel.hotel_booking.module.booking.controller;

import hotel.hotel_booking.module.booking.dto.BookingResponseDTO;
import hotel.hotel_booking.module.booking.dto.CreateBookingRequest;
import hotel.hotel_booking.module.booking.entity.Booking;
import hotel.hotel_booking.module.booking.service.BookingService;
import hotel.hotel_booking.module.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;


    // ✅ CREATE : Utilisation du Record CreateBookingRequest
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, user.getId()));
    }
    // ✅ READ : Récupérer les réservations de l'utilisateur connecté
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookingService.getMyBookings(user.getId()));
    }
}