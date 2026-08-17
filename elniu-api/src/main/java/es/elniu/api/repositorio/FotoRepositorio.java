package es.elniu.api.repositorio;

import es.elniu.api.dominio.Foto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FotoRepositorio extends JpaRepository<Foto, String> {
}
