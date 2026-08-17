package es.elniu.api.repositorio;

import es.elniu.api.dominio.Evento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoRepositorio extends JpaRepository<Evento, String> {
}
