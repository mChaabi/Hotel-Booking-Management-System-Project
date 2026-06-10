package hotel.hotel_booking.module.room.controller;

import hotel.hotel_booking.module.room.dto.RoomImageDTO;
import hotel.hotel_booking.module.room.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms/{roomId}/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomImageDTO> uploadImage(
            @PathVariable UUID roomId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isPrimary) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imageService.uploadRoomImage(roomId, file, isPrimary));
    }

    @GetMapping
    public ResponseEntity<List<RoomImageDTO>> getImages(@PathVariable UUID roomId) {
        return ResponseEntity.ok(imageService.getRoomImages(roomId));
    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteImage(
            @PathVariable UUID roomId,
            @PathVariable UUID imageId) {
        imageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}