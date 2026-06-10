package hotel.hotel_booking.module.user.service;

import hotel.hotel_booking.module.user.dto.RegisterRequest;
import hotel.hotel_booking.module.user.dto.UserResponseDTO;
import hotel.hotel_booking.module.user.entity.User;
import hotel.hotel_booking.module.user.entity.UserRole;
import hotel.hotel_booking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ✅ CREATE — doit retourner UserResponseDTO pas void
    public UserResponseDTO create(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // ✅ Si rôle non envoyé → GUEST par défaut
        UserRole role = request.role() != null
                ? request.role()
                : UserRole.GUEST;

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .role(role)          // ← utilise le rôle choisi
                .isActive(true)
                .loyaltyPoints(0)
                .build();

        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    // ✅ GET ALL
    public List<UserResponseDTO> getAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ✅ GET BY ID
    public UserResponseDTO getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur non trouvé : " + id));
        return toDTO(user);
    }

    // ✅ UPDATE
    public UserResponseDTO update(UUID id, RegisterRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur non trouvé : " + id));

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPhone(request.phone());

        // Mettre à jour le mot de passe seulement s'il est fourni
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    // ✅ DELETE
    public void delete(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé : " + id);
        }
        userRepository.deleteById(id);
    }

    // ✅ TOGGLE STATUS
    public void toggleStatus(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur non trouvé : " + id));

        // Inverser isActive
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
    }

    // ✅ MÉTHODE PRIVÉE — Convertir User → UserResponseDTO
    private UserResponseDTO toDTO(User user) {
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
}