package hotel.hotel_booking.commons.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // ── Extraire l'email du token ──────────────────────────
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // ── Générer token ──────────────────────────────────────
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails) {

        return Jwts.builder()
                .claims(extraClaims)                          // ✅ 0.12.x
                .subject(userDetails.getUsername())           // ✅ 0.12.x
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(                         // ✅ 0.12.x
                        System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())                    // ✅ 0.12.x
                .compact();
    }

    // ── Valider token ──────────────────────────────────────
    public boolean isTokenValid(String token,
                                UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    // ── Méthodes privées ──────────────────────────────────
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token,
                              Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()                    // ✅ 0.12.x (pas parserBuilder)
                .verifyWith(getSigningKey())        // ✅ 0.12.x
                .build()
                .parseSignedClaims(token)           // ✅ 0.12.x
                .getPayload();                      // ✅ 0.12.x
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
    // Dans JwtService.java
    public long getExpirationTime() {
        return jwtExpiration;
    }
}