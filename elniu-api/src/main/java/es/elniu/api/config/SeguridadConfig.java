package es.elniu.api.config;

import es.elniu.api.seguridad.FiltroJwt;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SeguridadConfig {

    private final PropiedadesElNiu propiedades;

    public SeguridadConfig(PropiedadesElNiu propiedades) {
        this.propiedades = propiedades;
    }

    @Bean
    public SecurityFilterChain cadena(HttpSecurity http, FiltroJwt filtroJwt) throws Exception {
        http
            /* Sin CSRF y sin sesion: la identidad viaja en cada peticion dentro
               del token, no en una cookie, asi que no hay nada que un tercero
               pueda hacer enviar al navegador sin querer. */
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(origenesPermitidos()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(reglas -> reglas
                // Lo que ve cualquiera que entre en la web.
                .requestMatchers(HttpMethod.GET, "/api/catalogo").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/reservas").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                /* Cuando un controlador responde con un error, Spring reenvia
                   por dentro a /error. Sin esta linea ese reenvio cae en la
                   regla de abajo, se topa con que nadie ha iniciado sesion y
                   convierte cualquier 401 en un 403. */
                .requestMatchers("/error").permitAll()
                // Todo lo de administracion, solo con token de la casa.
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            /* Por defecto Spring Security responde 403 a quien llega sin
               identificar. En una API eso confunde: 401 es «identificate» y
               403 es «te conozco, pero esto no es para ti». */
            .exceptionHandling(errores -> errores
                .authenticationEntryPoint((peticion, respuesta, ex) ->
                        responder(respuesta, HttpServletResponse.SC_UNAUTHORIZED,
                                "Hace falta iniciar sesion"))
                .accessDeniedHandler((peticion, respuesta, ex) ->
                        responder(respuesta, HttpServletResponse.SC_FORBIDDEN,
                                "Esta cuenta no puede hacer esto")))
            .addFilterBefore(filtroJwt, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** Respuesta de error en JSON, sin reenviar a /error. */
    private static void responder(HttpServletResponse respuesta, int codigo, String mensaje)
            throws IOException {
        respuesta.setStatus(codigo);
        respuesta.setContentType("application/json;charset=UTF-8");
        respuesta.getWriter().write("{\"error\":\"" + mensaje + "\"}");
    }

    @Bean
    public CorsConfigurationSource origenesPermitidos() {
        List<String> origenes = propiedades.cors() == null || propiedades.cors().origenes() == null
                ? List.of()
                : propiedades.cors().origenes();

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origenes);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/api/**", config);
        return fuente;
    }

    @Bean
    public PasswordEncoder cifradorClaves() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager gestorAutenticacion(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
