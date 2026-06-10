package hotel.hotel_booking.module.room.service;

import hotel.hotel_booking.module.room.dto.RoomImageDTO;
import hotel.hotel_booking.module.room.entity.Room;
import hotel.hotel_booking.module.room.entity.RoomImage;
import hotel.hotel_booking.module.room.mapper.RoomImageMapper;
import hotel.hotel_booking.module.room.repository.RoomImageRepository;
import hotel.hotel_booking.module.room.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
// CORRECTION : Utiliser java.nio.file.Path au lieu de jakarta.validation.Path
import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ImageService {

    private final RoomImageRepository roomImageRepository;
    private final RoomRepository roomRepository;
    private final RoomImageMapper roomImageMapper;

    private final String uploadDir = "uploads/rooms/";

    public RoomImageDTO uploadRoomImage(UUID roomId, MultipartFile file, boolean isPrimary) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Chambre non trouvée"));

        String fileName = saveFile(file);
        String fileUrl = "/api/v1/images/" + fileName;

        if (isPrimary) {
            roomImageRepository.resetPrimaryForRoom(roomId);
        }

        RoomImage roomImage = RoomImage.builder()
                .room(room)
                .imageUrl(fileUrl)
                .isPrimary(isPrimary)
                .displayOrder(room.getImages().size() + 1)
                .build();

        RoomImage savedImage = roomImageRepository.save(roomImage);

        // CORRECTION : Utiliser le mapper ici
        return roomImageMapper.toDto(savedImage);
    }

    @Transactional(readOnly = true)
    public List<RoomImageDTO> getRoomImages(UUID roomId) {
        return roomImageRepository.findByRoomIdOrderByDisplayOrderAsc(roomId)
                .stream()
                .map(roomImageMapper::toDto) // Utilisation du mapper injecté
                .toList();
    }

    public void deleteImage(UUID imageId) {
        RoomImage image = roomImageRepository.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException("Image non trouvée"));
        roomImageRepository.delete(image);
    }

    private String saveFile(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            // CORRECTION : Utilise java.nio.file.Path
            Path path = Paths.get(uploadDir + fileName);
            Files.createDirectories(path.getParent());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return fileName; // On retourne juste le nom du fichier
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors du stockage du fichier", e);
        }
    }
}