package es.elniu.api.web;

import es.elniu.api.dominio.Reserva;
import es.elniu.api.servicio.ReservaServicio;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Gestion de reservas desde el panel. Exige rol ADMIN. */
@RestController
@RequestMapping("/api/admin/reservas")
public class AdminReservaControlador {

    private final ReservaServicio reservas;

    public AdminReservaControlador(ReservaServicio reservas) {
        this.reservas = reservas;
    }

    @GetMapping
    public List<Reserva> todas() {
        return reservas.todas();
    }

    @GetMapping("/pendientes")
    public List<Reserva> pendientes() {
        return reservas.pendientes();
    }

    @GetMapping("/proximas")
    public List<Reserva> proximas() {
        return reservas.proximas();
    }

    /** Confirmadas de un rango, que es lo que alimenta el calendario y el PDF. */
    @GetMapping("/rango")
    public List<Reserva> rango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reservas.confirmadasEntre(desde, hasta);
    }

    @PostMapping("/{id}/confirmar")
    public Reserva confirmar(@PathVariable String id) {
        return reservas.confirmar(id);
    }

    @PostMapping("/{id}/rechazar")
    public Reserva rechazar(@PathVariable String id) {
        return reservas.rechazar(id);
    }

    @PostMapping("/{id}/reabrir")
    public Reserva reabrir(@PathVariable String id) {
        return reservas.reabrir(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable String id) {
        reservas.borrar(id);
    }
}
