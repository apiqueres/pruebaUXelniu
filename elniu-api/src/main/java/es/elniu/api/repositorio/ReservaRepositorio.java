package es.elniu.api.repositorio;

import es.elniu.api.dominio.EstadoReserva;
import es.elniu.api.dominio.Reserva;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaRepositorio extends JpaRepository<Reserva, String> {

    /** Las pendientes se atienden por orden de llegada. */
    List<Reserva> findByEstadoOrderByCreadaAsc(EstadoReserva estado);

    List<Reserva> findByEstadoAndDiaBetweenOrderByDiaAscHoraAsc(
            EstadoReserva estado, LocalDate desde, LocalDate hasta);

    List<Reserva> findByEstadoAndDiaGreaterThanEqualOrderByDiaAscHoraAsc(
            EstadoReserva estado, LocalDate desde);
}
