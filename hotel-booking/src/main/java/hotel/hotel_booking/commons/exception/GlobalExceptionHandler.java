package hotel.hotel_booking.commons.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Erreurs de validation Spring (@NotBlank, @Email...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e ->
                errors.put(e.getField(), e.getDefaultMessage())
        );

        log.warn("Erreur validation : {}", errors);

        return ResponseEntity.badRequest().body(Map.of(
                "status",    400,
                "error",     "Validation échouée",
                "fields",    errors,
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // Erreurs métier (email déjà utilisé, user introuvable...)
    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        log.error("Tentative de connexion échouée : Identifiants incorrects");
        return ResponseEntity.status(401).body(Map.of(
                "status", 401,
                "error", "Email ou mot de passe incorrect",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}