package es.elniu.api.servicio;

import es.elniu.api.dominio.Categoria;
import es.elniu.api.dominio.MenuCarta;
import es.elniu.api.dominio.Producto;
import es.elniu.api.dominio.Restaurante;
import es.elniu.api.repositorio.CategoriaRepositorio;
import es.elniu.api.repositorio.EventoRepositorio;
import es.elniu.api.repositorio.FotoRepositorio;
import es.elniu.api.repositorio.MenuRepositorio;
import es.elniu.api.repositorio.ProductoRepositorio;
import es.elniu.api.repositorio.RestauranteRepositorio;
import es.elniu.api.web.dto.CatalogoDto;
import es.elniu.api.web.dto.RestauranteDto;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CatalogoServicio {

    private final CategoriaRepositorio categorias;
    private final ProductoRepositorio productos;
    private final MenuRepositorio menus;
    private final EventoRepositorio eventos;
    private final FotoRepositorio fotos;
    private final RestauranteRepositorio restaurantes;

    public CatalogoServicio(CategoriaRepositorio categorias, ProductoRepositorio productos,
                            MenuRepositorio menus, EventoRepositorio eventos,
                            FotoRepositorio fotos, RestauranteRepositorio restaurantes) {
        this.categorias = categorias;
        this.productos = productos;
        this.menus = menus;
        this.eventos = eventos;
        this.fotos = fotos;
        this.restaurantes = restaurantes;
    }

    /** El catalogo entero, con la misma forma que espera el frontend. */
    @Transactional(readOnly = true)
    public CatalogoDto catalogo() {
        Restaurante casa = restaurantes.findById(Restaurante.UNICO).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Todavia no se ha cargado la ficha del restaurante"));

        return new CatalogoDto(
                RestauranteDto.de(casa),
                categorias.findAllByOrderByOrdenAsc(),
                productos.findAll().stream()
                        .sorted(Comparator.comparingInt(Producto::getOrden))
                        .toList(),
                menus.findAll(),
                eventos.findAll(),
                fotos.findAll(),
                new CatalogoDto.Avisos(casa.getAvisoAlergenos(), casa.getAvisoBodega()));
    }

    // ---- Altas, bajas y modificaciones -------------------------------------

    @Transactional
    public Producto guardarProducto(Producto producto) {
        if (!categorias.existsById(producto.getCategoriaId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No existe la categoria " + producto.getCategoriaId());
        }
        if (producto.getId() == null || producto.getId().isBlank()) {
            producto.setId(Identificadores.desde(producto.getNombre(),
                    productos.findAll().stream().map(Producto::getId).toList()));
        }
        return productos.save(producto);
    }

    @Transactional
    public void borrarProducto(String id) {
        productos.deleteById(id);
    }

    @Transactional
    public MenuCarta guardarMenu(MenuCarta menu) {
        if (menu.getId() == null || menu.getId().isBlank()) {
            menu.setId(Identificadores.desde(menu.getNombre(),
                    menus.findAll().stream().map(MenuCarta::getId).toList()));
        }
        return menus.save(menu);
    }

    @Transactional
    public void borrarMenu(String id) {
        menus.deleteById(id);
    }

    @Transactional
    public Categoria guardarCategoria(Categoria categoria) {
        if (categoria.getId() == null || categoria.getId().isBlank()) {
            categoria.setId(Identificadores.desde(categoria.getNombre(),
                    categorias.findAll().stream().map(Categoria::getId).toList()));
        }
        return categorias.save(categoria);
    }

    /** Borrar una categoria arrastra sus productos: no deben quedar huerfanos. */
    @Transactional
    public void borrarCategoria(String id) {
        productos.deleteByCategoriaId(id);
        categorias.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Categoria> categorias() {
        return categorias.findAllByOrderByOrdenAsc();
    }
}
