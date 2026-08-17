package es.elniu.api.web;

import es.elniu.api.dominio.Reserva;
import es.elniu.api.servicio.ReservaServicio;
import es.elniu.api.web.dto.PeticionReserva;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Peticion de mesa desde la web. Publico y sin token. */
@RestController
@RequestMapping("/api/reservas")
public class ReservaControlador {

    private final ReservaServicio reservas;

    public ReservaControlador(ReservaServicio reservas) {
        this.reservas = reservas;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Reserva pedir(@Valid @RequestBody PeticionReserva peticion) {
        return reservas.crear(peticion);
    }
}
