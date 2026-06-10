package hotel.hotel_booking.module.room.service;

import hotel.hotel_booking.module.hotel.entity.Hotel;
import hotel.hotel_booking.module.hotel.repository.HotelRepository;
import hotel.hotel_booking.module.room.dto.RoomDTO;
import hotel.hotel_booking.module.room.entity.Room;
import hotel.hotel_booking.module.room.entity.RoomType;
import hotel.hotel_booking.module.room.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    // 1. CREATE (POST)
    @Transactional
    public RoomDTO createRoom(UUID hotelId, RoomDTO dto) {
        // 1. Find the hotel
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new EntityNotFoundException("Hotel not found"));

        // 2. Build the Room entity (Fixed declaration and added missing fields)
        Room room = Room.builder()
                .hotel(hotel) // CRITICAL: Link the room to the hotel
                .roomNumber(dto.getRoomNumber())
                .type(RoomType.valueOf(dto.getType())) // Convert String to Enum
                .capacity(dto.getCapacity()) // Ensure DTO has capacity
                .pricePerNight(dto.getPricePerNight())
                .isAvailable(dto.isAvailable())
                .build();

        // 3. Save and map back to DTO
        Room savedRoom = roomRepository.save(room);
        return mapToDTO(savedRoom);
    }

    // 2. READ (GET)
    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public RoomDTO getRoomById(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chambre non trouvée"));
        return mapToDTO(room);
    }

    // 3. UPDATE (PUT)
    @Transactional
    public RoomDTO updateRoom(UUID id, RoomDTO dto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chambre non trouvée"));

        room.setRoomNumber(dto.getRoomNumber());
        room.setType(RoomType.valueOf(dto.getType()));
        room.setPricePerNight(dto.getPricePerNight());
        room.setIsAvailable(dto.isAvailable());

        return mapToDTO(roomRepository.save(room));
    }

    // 4. DELETE
    @Transactional
    public void deleteRoom(UUID id) {
        if (!roomRepository.existsById(id)) {
            throw new RuntimeException("Chambre non trouvée");
        }
        roomRepository.deleteById(id);
    }

    // Méthode utilitaire de conversion Entity -> DTO
    private RoomDTO mapToDTO(Room room) {
        return RoomDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .type(room.getType().name())
                .pricePerNight(room.getPricePerNight())
                .available(room.getIsAvailable())
                .primaryImageUrl(room.getPrimaryImageUrl())
                .build();
    }
}