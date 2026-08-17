package es.elniu.api.web;

import es.elniu.api.dominio.Categoria;
import es.elniu.api.dominio.MenuCarta;
import es.elniu.api.dominio.Producto;
import es.elniu.api.servicio.CatalogoServicio;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Mantenimiento de la carta. Todo bajo /api/admin, que exige rol ADMIN. */
@RestController
@RequestMapping("/api/admin")
public class AdminCatalogoControlador {

    private final CatalogoServicio catalogo;

    public AdminCatalogoControlador(CatalogoServicio catalogo) {
        this.catalogo = catalogo;
    }

    // ---- Productos ---------------------------------------------------------

    @PostMapping("/productos")
    @ResponseStatus(HttpStatus.CREATED)
    public Producto crearProducto(@RequestBody Producto producto) {
        producto.setId(null);
        return catalogo.guardarProducto(producto);
    }

    @PutMapping("/productos/{id}")
    public Producto actualizarProducto(@PathVariable String id, @RequestBody Producto producto) {
        producto.setId(id);
        return catalogo.guardarProducto(producto);
    }

    @DeleteMapping("/productos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrarProducto(@PathVariable String id) {
        catalogo.borrarProducto(id);
    }

    // ---- Menus -------------------------------------------------------------

    @PostMapping("/menus")
    @ResponseStatus(HttpStatus.CREATED)
    public MenuCarta crearMenu(@RequestBody MenuCarta menu) {
        menu.setId(null);
        return catalogo.guardarMenu(menu);
    }

    @PutMapping("/menus/{id}")
    public MenuCarta actualizarMenu(@PathVariable String id, @RequestBody MenuCarta menu) {
        menu.setId(id);
        return catalogo.guardarMenu(menu);
    }

    @DeleteMapping("/menus/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrarMenu(@PathVariable String id) {
        catalogo.borrarMenu(id);
    }

    // ---- Categorias --------------------------------------------------------

    @PostMapping("/categorias")
    @ResponseStatus(HttpStatus.CREATED)
    public Categoria crearCategoria(@RequestBody Categoria categoria) {
        categoria.setId(null);
        return catalogo.guardarCategoria(categoria);
    }

    @PutMapping("/categorias/{id}")
    public Categoria actualizarCategoria(@PathVariable String id, @RequestBody Categoria categoria) {
        categoria.setId(id);
        return catalogo.guardarCategoria(categoria);
    }

    /** Se lleva por delante los productos de la categoria. */
    @DeleteMapping("/categorias/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrarCategoria(@PathVariable String id) {
        catalogo.borrarCategoria(id);
    }
}
