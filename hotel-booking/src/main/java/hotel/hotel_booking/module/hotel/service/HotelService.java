package hotel.hotel_booking.module.hotel.service;

import hotel.hotel_booking.module.hotel.dto.CreateHotelRequest;
import hotel.hotel_booking.module.hotel.dto.HotelDTO;
import hotel.hotel_booking.module.hotel.dto.HotelDetailDTO;
import hotel.hotel_booking.module.hotel.dto.HotelSearchRequest;
import hotel.hotel_booking.module.hotel.entity.Hotel;
import hotel.hotel_booking.module.hotel.repository.HotelRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HotelService {

    private final HotelRepository hotelRepository;

    public Page<HotelDTO> search(HotelSearchRequest req) {
        List<Hotel> hotels = hotelRepository.findByCityIgnoreCaseAndIsActiveTrue(req.city());

        List<HotelDTO> dtos = hotels.stream()
                .map(h -> HotelDTO.builder()
                        .id(h.getId())
                        .name(h.getName())
                        .city(h.getCity())
                        .stars(h.getStars())
                        .build())
                .collect(Collectors.toList()); // ✅ UTILISE CECI au lieu de .toList()

        // Ajoute aussi l'argument Pageable si possible,
        // ou utilise une liste simple si tu n'as pas besoin de pagination réelle.
        return new PageImpl<>(dtos);
    }

    public HotelDetailDTO getDetail(UUID id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hôtel non trouvé"));

        return HotelDetailDTO.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .description(hotel.getDescription())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .stars(hotel.getStars())
                .phoneNumber(hotel.getPhoneNumber())
                .amenities(hotel.getAmenities())
                // Mapping des chambres en RoomDTO si nécessaire
                .build();
    }

    @Transactional
    public HotelDTO create(CreateHotelRequest req) {
        Hotel hotel = Hotel.builder()
                .name(req.name())
                .address(req.address())
                .city(req.city())
                .country(req.country())
                .stars(req.stars())
                .phoneNumber(req.phoneNumber())
                .email(req.email())
                .amenities(req.amenities())
                .isActive(true)
                .build();

        Hotel saved = hotelRepository.save(hotel);

        return HotelDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .city(saved.getCity())
                .build();
    }
}