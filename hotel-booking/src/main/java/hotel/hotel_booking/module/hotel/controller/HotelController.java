package hotel.hotel_booking.module.hotel.controller;

import hotel.hotel_booking.module.booking.service.AiService;
import hotel.hotel_booking.module.hotel.dto.CreateHotelRequest;
import hotel.hotel_booking.module.hotel.dto.HotelDTO;
import hotel.hotel_booking.module.hotel.dto.HotelDetailDTO;
import hotel.hotel_booking.module.hotel.dto.HotelSearchRequest;
import hotel.hotel_booking.module.hotel.service.HotelService;
import hotel.hotel_booking.module.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;
    private final AiService aiService;

    @GetMapping("/search")
    public ResponseEntity<Page<HotelDTO>> search(
            @Valid HotelSearchRequest req) {
        return ResponseEntity.ok(hotelService.search(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelDetailDTO> detail(@PathVariable UUID id) {
        return ResponseEntity.ok(hotelService.getDetail(id));
    }

    @PostMapping
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HotelDTO> create(
            @Valid @RequestBody CreateHotelRequest req) {
        return ResponseEntity.status(201)
                .body(hotelService.create(req));
    }

    // Recommandation IA intégrée dans la recherche
    @GetMapping("/ai-recommendation")
    public ResponseEntity<Map<String, String>> aiRecommendation(
            @RequestParam String city,
            @RequestParam LocalDate checkIn,
            @RequestParam LocalDate checkOut,
            @RequestParam(defaultValue = "2") int guests,
            @AuthenticationPrincipal User user) {

        String recommendation = aiService.getRecommendation(
                user, city, checkIn, checkOut, guests);

        return ResponseEntity.ok(
                Map.of("recommendation", recommendation));
    }
}