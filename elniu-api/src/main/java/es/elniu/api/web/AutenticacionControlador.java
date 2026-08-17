package es.elniu.api.web;

import es.elniu.api.seguridad.ServicioJwt;
import es.elniu.api.web.dto.PeticionAcceso;
import es.elniu.api.web.dto.RespuestaAcceso;
import jakarta.validation.Valid;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AutenticacionControlador {

    private final AuthenticationManager gestor;
    private final ServicioJwt jwt;

    public AutenticacionControlador(AuthenticationManager gestor, ServicioJwt jwt) {
        this.gestor = gestor;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public RespuestaAcceso entrar(@Valid @RequestBody PeticionAcceso peticion) {
        Authentication identidad;
        try {
            identidad = gestor.authenticate(new UsernamePasswordAuthenticationToken(
                    peticion.usuario(), peticion.clave()));
        } catch (AuthenticationException e) {
            /* El mismo mensaje si falla el usuario o la clave: decir cual de
               los dos es incorrecto confirmaria a quien lo prueba que ese
               usuario existe. */
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Usuario o clave incorrectos");
        }

        String rol = identidad.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_ADMIN");

        Instant ahora = Instant.now();
        return new RespuestaAcceso(
                jwt.generar(identidad.getName(), rol),
                jwt.expiracion(ahora),
                identidad.getName(),
                rol);
    }

    /** Sirve al frontend para saber si el token que guarda sigue valiendo. */
    @GetMapping("/yo")
    public RespuestaAcceso quienSoy(@AuthenticationPrincipal UserDetails usuario) {
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String rol = usuario.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_ADMIN");
        return new RespuestaAcceso(null, null, usuario.getUsername(), rol);
    }
}
