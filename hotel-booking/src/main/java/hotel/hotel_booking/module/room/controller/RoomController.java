package hotel.hotel_booking.module.room.controller;

import hotel.hotel_booking.module.room.dto.RoomDTO;
import hotel.hotel_booking.module.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    // --- CREATE ---
    @PostMapping("/hotel/{hotelId}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomDTO> create(@PathVariable UUID hotelId, @RequestBody RoomDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(hotelId, dto));
    }

    // --- READ ---
    @GetMapping
    public ResponseEntity<List<RoomDTO>> getAll() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> getOne(@PathVariable UUID id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    // --- UPDATE ---
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomDTO> update(@PathVariable UUID id, @RequestBody RoomDTO dto) {
        return ResponseEntity.ok(roomService.updateRoom(id, dto));
    }

    // --- DELETE ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}