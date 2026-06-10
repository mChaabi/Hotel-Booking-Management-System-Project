package hotel.hotel_booking.module.user.service;

import hotel.hotel_booking.commons.config.JwtService;
import hotel.hotel_booking.module.user.dto.AuthResponse;
import hotel.hotel_booking.module.user.dto.LoginRequest;
import hotel.hotel_booking.module.user.dto.RegisterRequest;
import hotel.hotel_booking.module.user.dto.UserResponseDTO;
import hotel.hotel_booking.module.user.entity.User;
import hotel.hotel_booking.module.user.entity.UserRole;
import hotel.hotel_booking.module.user.mapper.UserMapper;
import hotel.hotel_booking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    public AuthResponse login(LoginRequest request) {
        // 1. Authentification
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        // 2. Récupération utilisateur
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 3. Génération du token (Version 0.12.x compatible)
        String token = jwtService.generateToken(user);

        log.info("Connexion réussie pour : {}", user.getEmail());

        return new AuthResponse(
                token,
                token,
                toDTO(user),
                jwtService.getExpirationTime() // Récupère la durée depuis le service
        );
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .role(request.role() != null ? request.role() : UserRole.GUEST)
                .isActive(true)
                .loyaltyPoints(0)
                .build();

        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved);

        log.info("Inscription + login auto pour : {}", saved.getEmail());

        return new AuthResponse(
                token,          // accessToken
                null,           // ou refreshToken si tu en fais
                toDTO(user),
                jwtService.getExpirationTime()
        );
    } // ✅ ICI tu fermes la méthode

    // ✅ méthode en dehors
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