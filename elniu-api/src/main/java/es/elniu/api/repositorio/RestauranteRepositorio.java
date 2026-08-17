package es.elniu.api.repositorio;

import es.elniu.api.dominio.Restaurante;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestauranteRepositorio extends JpaRepository<Restaurante, Long> {
}
