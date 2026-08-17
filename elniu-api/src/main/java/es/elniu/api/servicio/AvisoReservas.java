package es.elniu.api.servicio;

import es.elniu.api.config.PropiedadesElNiu;
import es.elniu.api.dominio.EstadoReserva;
import es.elniu.api.dominio.Reserva;
import es.elniu.api.dominio.Restaurante;
import es.elniu.api.repositorio.RestauranteRepositorio;
import es.elniu.api.servicio.PlantillaCorreo.Fila;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Los correos de las reservas: a la casa cuando entra una peticion, y al
 * cliente cuando la casa la resuelve.
 *
 * <p>Salen en multiparte: la version maquetada y, debajo, la misma informacion
 * en texto plano. Los clientes que bloquean el HTML enseñan esa segunda, y
 * llevar las dos ayuda a no acabar en la carpeta de spam.
 *
 * <p>Todos se mandan con AFTER_COMMIT y en segundo plano: hasta que la
 * transaccion no cierra, lo que se anuncia no esta grabado de verdad, y nadie
 * deberia esperar en la web mientras se habla con el servidor de correo. Si el
 * envio falla, queda anotado y la reserva sigue su curso.
 */
@Component
public class AvisoReservas {

    private static final Logger LOG = LoggerFactory.getLogger(AvisoReservas.class);

    private static final Locale ES = Locale.forLanguageTag("es-ES");
    private static final DateTimeFormatter DIA =
            DateTimeFormatter.ofPattern("EEEE d 'de' MMMM 'de' yyyy", ES);
    private static final DateTimeFormatter DIA_CORTO = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    private final JavaMailSender correo;
    private final PropiedadesElNiu propiedades;
    private final RestauranteRepositorio restaurantes;

    public AvisoReservas(JavaMailSender correo, PropiedadesElNiu propiedades,
                         RestauranteRepositorio restaurantes) {
        this.correo = correo;
        this.propiedades = propiedades;
        this.restaurantes = restaurantes;
    }

    // ---- A la casa: ha entrado una peticion ---------------------------------

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void alCrearse(ReservaCreada aviso) {
        PropiedadesElNiu.Avisos ajustes = propiedades.avisos();
        Reserva r = aviso.reserva();

        if (ajustes == null || vacio(ajustes.destino())) {
            LOG.info("Sin ELNIU_AVISOS_DESTINO configurado: no se avisa de la reserva {}.",
                    r.getId());
            return;
        }

        Restaurante casa = casa();
        if (casa == null) {
            return;
        }

        List<Fila> filas = new ArrayList<>();
        filas.add(new Fila("Cuándo", cuando(r)));
        filas.add(new Fila("Personas", String.valueOf(r.getPersonas())));
        filas.add(new Fila("Nombre", r.getNombre()));
        filas.add(new Fila("Teléfono", r.getTelefono()));
        filas.add(new Fila("Correo", r.getEmail()));
        if (!vacio(r.getComentario())) {
            filas.add(new Fila("Nota", r.getComentario()));
        }

        String html = PlantillaCorreo.construir(
                "Pendiente de confirmar",
                "Nueva reserva",
                "Un cliente acaba de pedir mesa. No ocupa sitio hasta que la confirmes.",
                filas,
                "Referencia " + r.getId(),
                "Abrir el panel", ajustes.panel(), casa);

        StringBuilder plano = new StringBuilder();
        plano.append("Nueva peticion de mesa. Esta PENDIENTE hasta que la confirmes.\n\n");
        for (Fila fila : filas) {
            plano.append("  ").append(fila.etiqueta()).append(": ")
                    .append(fila.valor()).append('\n');
        }
        plano.append("\nConfirmala o rechazala en el panel:\n  ").append(ajustes.panel())
                .append("\n\nReferencia ").append(r.getId()).append('\n');

        enviar(ajustes.remitente(), ajustes.destino(), r.getEmail(),
                "Reserva: %s - %s %s - %d %s".formatted(
                        r.getNombre(), r.getDia().format(DIA_CORTO), r.getHora().format(HORA),
                        r.getPersonas(), personas(r)),
                plano.toString(), html,
                "la peticion " + r.getId());
    }

    // ---- Al cliente: la casa ha decidido -----------------------------------

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void alResolverse(ReservaResuelta aviso) {
        Reserva r = aviso.reserva();

        if (vacio(r.getEmail())) {
            LOG.info("La reserva {} no tiene correo: no se avisa al cliente.", r.getId());
            return;
        }

        Restaurante casa = casa();
        if (casa == null) {
            return;
        }

        PropiedadesElNiu.Avisos ajustes = propiedades.avisos();
        String remitente = ajustes == null ? null : ajustes.remitente();
        // Si el cliente responde, que le llegue a la casa y no al vacio.
        String responderA = ajustes == null || vacio(ajustes.destino()) ? null : ajustes.destino();

        String telefono = PlantillaCorreo.telefonoLegible(casa.getTelefono());

        if (r.getEstado() == EstadoReserva.confirmada) {
            List<Fila> filas = List.of(
                    new Fila("Cuándo", cuando(r)),
                    new Fila("Personas", String.valueOf(r.getPersonas())),
                    new Fila("Dónde", casa.getDireccion() + " · " + casa.getPoblacion()));

            String html = PlantillaCorreo.construir(
                    "Reserva confirmada",
                    "Te esperamos",
                    "Hola " + r.getNombre() + ", tu mesa está confirmada.",
                    filas,
                    "Si no puedes venir o cambia algo, llámanos al " + telefono
                            + " y lo arreglamos.",
                    null, null, casa);

            String plano = """
                    Hola %s:

                    Tu mesa esta confirmada. Te esperamos.

                      Cuando    %s
                      Personas  %d
                      Donde     %s
                                %s

                    Si no puedes venir o cambia algo, llamanos al %s y lo arreglamos.

                    %s
                    """.formatted(r.getNombre(), cuando(r), r.getPersonas(),
                    casa.getDireccion(), casa.getPoblacion(), telefono, casa.getNombre());

            enviar(remitente, r.getEmail(), responderA,
                    "Mesa confirmada - %s a las %s".formatted(
                            r.getDia().format(DIA_CORTO), r.getHora().format(HORA)),
                    plano, html, "la resolucion de " + r.getId());
            return;
        }

        /* Se avisa tambien al rechazar: quedarse sin respuesta es peor que un
           «no» claro, porque el cliente no sabe si contar con la mesa. */
        String html = PlantillaCorreo.construir(
                "No hay hueco",
                "Lo sentimos",
                "Hola " + r.getNombre() + ", esta vez no podemos darte mesa.",
                List.of(new Fila("Habías pedido",
                        cuando(r) + " · " + r.getPersonas() + " " + personas(r))),
                "Llámanos al " + telefono + " y buscamos otro hueco.",
                null, null, casa);

        String plano = """
                Hola %s:

                Lo sentimos: no podemos darte mesa el %s para %d %s.

                Llamanos al %s y buscamos otro hueco.

                %s
                """.formatted(r.getNombre(), cuando(r), r.getPersonas(), personas(r),
                telefono, casa.getNombre());

        enviar(remitente, r.getEmail(), responderA,
                "Sobre tu reserva del " + r.getDia().format(DIA_CORTO),
                plano, html, "la resolucion de " + r.getId());
    }

    // ---- Auxiliares --------------------------------------------------------

    private void enviar(String de, String para, String responderA, String asunto,
                        String plano, String html, String que) {
        try {
            MimeMessage mensaje = correo.createMimeMessage();
            // El «true» abre el mensaje en multiparte, que es lo que permite
            // mandar la version de texto y la maquetada en el mismo correo.
            MimeMessageHelper ayuda = new MimeMessageHelper(mensaje, true, "UTF-8");

            if (!vacio(de)) {
                ayuda.setFrom(de);
            }
            ayuda.setTo(para);
            if (!vacio(responderA)) {
                ayuda.setReplyTo(responderA);
            }
            ayuda.setSubject(asunto);
            ayuda.setText(plano, html);

            correo.send(mensaje);
            LOG.info("Aviso de {} enviado a {}.", que, para);
        } catch (Exception e) {
            /* Que falle el correo no puede tumbar nada: lo que se anunciaba ya
               esta grabado y se ve en el panel. Se deja constancia y se sigue. */
            LOG.error("No se ha podido enviar el aviso de {}: {}", que, e.getMessage());
        }
    }

    private Restaurante casa() {
        Restaurante casa = restaurantes.findById(Restaurante.UNICO).orElse(null);
        if (casa == null) {
            LOG.warn("Sin ficha del restaurante: no se puede componer el correo.");
        }
        return casa;
    }

    private String cuando(Reserva r) {
        return r.getDia().format(DIA) + " a las " + r.getHora().format(HORA);
    }

    private String personas(Reserva r) {
        return r.getPersonas() == 1 ? "persona" : "personas";
    }

    private static boolean vacio(String texto) {
        return texto == null || texto.isBlank();
    }
}
