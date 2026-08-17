package es.elniu.api.repositorio;

import es.elniu.api.dominio.MenuCarta;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepositorio extends JpaRepository<MenuCarta, String> {
}
