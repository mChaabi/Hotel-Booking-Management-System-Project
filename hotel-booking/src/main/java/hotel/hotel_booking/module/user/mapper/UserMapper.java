package hotel.hotel_booking.module.user.mapper;

import hotel.hotel_booking.module.user.dto.UserResponseDTO;
import hotel.hotel_booking.module.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    /**
     * Transforme une entité User en UserResponseDTO (Record)
     */
    public UserResponseDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        return new UserResponseDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getLoyaltyPoints(),
                user.getIsActive(),
                user.getCreatedAt()
        );
    }

    /**
     * Transforme une liste d'entités en liste de DTOs
     */
    public List<UserResponseDTO> toDTOList(List<User> users) {
        if (users == null || users.isEmpty()) {
            return Collections.emptyList();
        }

        return users.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}