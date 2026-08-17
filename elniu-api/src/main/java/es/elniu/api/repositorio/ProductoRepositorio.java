package es.elniu.api.repositorio;

import es.elniu.api.dominio.Producto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepositorio extends JpaRepository<Producto, String> {

    List<Producto> findByCategoriaId(String categoriaId);

    void deleteByCategoriaId(String categoriaId);
}
