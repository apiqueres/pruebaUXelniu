package es.elniu.api.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Ajustes propios de la casa. Todos salen de variables de entorno en el
 * servidor: aqui no hay ninguna clave escrita.
 */
@ConfigurationProperties(prefix = "elniu")
public record PropiedadesElNiu(Jwt jwt, Admin admin, Cors cors, Avisos avisos) {

    /**
     * @param secreto clave de firma de los tokens. Si viene vacia se genera una
     *                al arrancar, y entonces los tokens dejan de valer en cada
     *                reinicio: en el servidor hay que fijarla.
     * @param minutos duracion del token
     */
    public record Jwt(String secreto, long minutos) {}

    /** Cuenta de administracion que se crea la primera vez que arranca. */
    public record Admin(String usuario, String clave) {}

    /** Origenes que pueden llamar a la API desde un navegador. */
    public record Cors(List<String> origenes) {}

    /**
     * Aviso a la casa cuando entra una peticion de reserva.
     *
     * @param destino   a quien se avisa. Sin el, no se manda nada. No lleva
     *                  valor por defecto a proposito: una direccion personal no
     *                  debe quedar escrita en el repositorio
     * @param remitente lo que ve el destinatario en el «De:»
     * @param panel     enlace al panel que se incluye en el correo
     */
    public record Avisos(String destino, String remitente, String panel) {}
}
