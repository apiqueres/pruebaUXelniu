package es.elniu.api.servicio;

import es.elniu.api.dominio.EstadoReserva;
import es.elniu.api.dominio.Reserva;
import es.elniu.api.repositorio.ReservaRepositorio;
import es.elniu.api.web.dto.PeticionReserva;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReservaServicio {

    private static final DateTimeFormatter CLAVE_DIA = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter CLAVE_HORA = DateTimeFormatter.ofPattern("HHmm");

    private final ReservaRepositorio reservas;
    private final ApplicationEventPublisher eventos;

    public ReservaServicio(ReservaRepositorio reservas, ApplicationEventPublisher eventos) {
        this.reservas = reservas;
        this.eventos = eventos;
    }

    /**
     * Alta desde la web. Nace pendiente: no ocupa mesa hasta que la casa la
     * confirma.
     *
     * <p>La comprobacion de que el dia no es pasado se repite aqui aunque el
     * formulario ya la haga. El navegador es del cliente, y este endpoint es
     * publico: cualquiera puede llamarlo sin pasar por la pagina.
     */
    @Transactional
    public Reserva crear(PeticionReserva peticion) {
        if (peticion.dia().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Solo se puede reservar de hoy en adelante");
        }

        Reserva reserva = new Reserva();
        reserva.setId(nuevoId(peticion));
        reserva.setNombre(peticion.nombre().trim());
        reserva.setTelefono(peticion.telefono().trim());
        reserva.setEmail(peticion.email().trim());
        reserva.setDia(peticion.dia());
        reserva.setHora(peticion.hora());
        reserva.setPersonas(peticion.personas());
        reserva.setComentario(vacioANulo(peticion.comentario()));
        reserva.setEstado(EstadoReserva.pendiente);
        reserva.setCreada(Instant.now());

        Reserva guardada = reservas.save(reserva);

        /* El aviso a la casa se publica como evento y lo recoge AvisoReservas
           cuando la transaccion ya ha cerrado. Asi, si el correo falla, el
           cliente conserva su mesa igualmente. */
        eventos.publishEvent(new ReservaCreada(guardada));

        return guardada;
    }

    @Transactional(readOnly = true)
    public List<Reserva> todas() {
        return reservas.findAll();
    }

    @Transactional(readOnly = true)
    public List<Reserva> pendientes() {
        return reservas.findByEstadoOrderByCreadaAsc(EstadoReserva.pendiente);
    }

    @Transactional(readOnly = true)
    public List<Reserva> proximas() {
        return reservas.findByEstadoAndDiaGreaterThanEqualOrderByDiaAscHoraAsc(
                EstadoReserva.confirmada, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<Reserva> confirmadasEntre(LocalDate desde, LocalDate hasta) {
        return reservas.findByEstadoAndDiaBetweenOrderByDiaAscHoraAsc(
                EstadoReserva.confirmada, desde, hasta);
    }

    @Transactional
    public Reserva confirmar(String id) {
        return resolver(id, EstadoReserva.confirmada);
    }

    @Transactional
    public Reserva rechazar(String id) {
        return resolver(id, EstadoReserva.rechazada);
    }

    /** Devuelve una reserva ya resuelta a la cola de pendientes. */
    @Transactional
    public Reserva reabrir(String id) {
        Reserva reserva = buscar(id);
        reserva.setEstado(EstadoReserva.pendiente);
        reserva.setResuelta(null);
        return reservas.save(reserva);
    }

    @Transactional
    public void borrar(String id) {
        reservas.deleteById(id);
    }

    /* Solo por aqui pasan confirmar y rechazar, que son las dos decisiones que
       el cliente tiene que saber. `reabrir` se queda fuera a proposito: devolver
       una reserva a la cola es un apaño interno de la casa, y avisar de que
       «vuelve a estar pendiente» solo confundiria a quien la pidio. */
    private Reserva resolver(String id, EstadoReserva estado) {
        Reserva reserva = buscar(id);
        reserva.setEstado(estado);
        reserva.setResuelta(Instant.now());

        Reserva guardada = reservas.save(reserva);
        eventos.publishEvent(new ReservaResuelta(guardada));
        return guardada;
    }

    private Reserva buscar(String id) {
        return reservas.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe esa reserva"));
    }

    /** Identificador legible: dia, hora y un sufijo para no repetir. */
    private String nuevoId(PeticionReserva p) {
        String base = "r-" + p.dia().format(CLAVE_DIA) + "-" + p.hora().format(CLAVE_HORA);
        int n = 1;
        while (reservas.existsById(base + "-" + n)) {
            n++;
        }
        return base + "-" + n;
    }

    private static String vacioANulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
