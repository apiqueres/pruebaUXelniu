package es.elniu.api.seguridad;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Lee el token de la cabecera Authorization y deja al usuario identificado. */
@Component
public class FiltroJwt extends OncePerRequestFilter {

    private static final String CABECERA = "Authorization";
    private static final String PREFIJO = "Bearer ";

    private final ServicioJwt jwt;
    private final ServicioDetallesUsuario detalles;

    public FiltroJwt(ServicioJwt jwt, ServicioDetallesUsuario detalles) {
        this.jwt = jwt;
        this.detalles = detalles;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest peticion, HttpServletResponse respuesta,
                                    FilterChain cadena) throws ServletException, IOException {

        String cabecera = peticion.getHeader(CABECERA);

        if (cabecera != null && cabecera.startsWith(PREFIJO)
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String usuario = jwt.usuarioDe(cabecera.substring(PREFIJO.length()));
            if (usuario != null) {
                try {
                    UserDetails encontrado = detalles.loadUserByUsername(usuario);
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            encontrado, null, encontrado.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(peticion));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } catch (Exception e) {
                    // El token era valido pero el usuario ya no existe: se
                    // sigue sin identificar y la peticion acabara en 401.
                    SecurityContextHolder.clearContext();
                }
            }
        }

        cadena.doFilter(peticion, respuesta);
    }
}
