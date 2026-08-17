package es.elniu.api.seguridad;

import es.elniu.api.config.PropiedadesElNiu;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ServicioJwt {

    private static final Logger LOG = LoggerFactory.getLogger(ServicioJwt.class);

    private final SecretKey clave;
    private final long minutos;

    public ServicioJwt(PropiedadesElNiu propiedades) {
        String secreto = propiedades.jwt() == null ? null : propiedades.jwt().secreto();
        this.minutos = propiedades.jwt() == null || propiedades.jwt().minutos() <= 0
                ? 480
                : propiedades.jwt().minutos();

        if (secreto == null || secreto.isBlank()) {
            // Sin secreto configurado se genera uno de usar y tirar. Vale para
            // trabajar en local; en el servidor hay que fijar ELNIU_JWT_SECRETO
            // o cada reinicio echara a todo el mundo fuera.
            byte[] aleatorio = new byte[48];
            new SecureRandom().nextBytes(aleatorio);
            secreto = Base64.getEncoder().encodeToString(aleatorio);
            LOG.warn("No hay ELNIU_JWT_SECRETO configurado: se ha generado uno temporal. "
                    + "Las sesiones abiertas se perderan al reiniciar.");
        }

        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "ELNIU_JWT_SECRETO debe tener al menos 32 caracteres para firmar con HS256");
        }
        this.clave = Keys.hmacShaKeyFor(bytes);
    }

    public String generar(String usuario, String rol) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(usuario)
                .claim("rol", rol)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(expiracion(ahora)))
                .signWith(clave)
                .compact();
    }

    public Instant expiracion(Instant desde) {
        return desde.plus(minutos, ChronoUnit.MINUTES);
    }

    public long minutos() {
        return minutos;
    }

    /** Devuelve el usuario del token, o nulo si no es valido o ha caducado. */
    public String usuarioDe(String token) {
        try {
            Claims cuerpo = Jwts.parser()
                    .verifyWith(clave)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return cuerpo.getSubject();
        } catch (Exception e) {
            // Token manipulado, caducado o con otra firma: no se distingue a
            // proposito, para no dar pistas a quien lo esta probando.
            return null;
        }
    }
}
