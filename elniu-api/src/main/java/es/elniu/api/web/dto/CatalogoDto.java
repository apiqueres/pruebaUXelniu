package es.elniu.api.web.dto;

import es.elniu.api.dominio.Categoria;
import es.elniu.api.dominio.Evento;
import es.elniu.api.dominio.Foto;
import es.elniu.api.dominio.MenuCarta;
import es.elniu.api.dominio.Producto;
import java.util.List;

/**
 * El catalogo entero, con la misma forma que el fichero {@code catalogo.json}
 * que ya consume la aplicacion de Angular. Mantener el contrato permite que el
 * frontend cambie de origen de datos sin tocar ninguna de sus paginas.
 */
public record CatalogoDto(
        RestauranteDto restaurante,
        List<Categoria> categorias,
        List<Producto> productos,
        List<MenuCarta> menus,
        List<Evento> eventos,
        List<Foto> galeria,
        Avisos avisos) {

    public record Avisos(String alergenos, String bodega) {}
}
