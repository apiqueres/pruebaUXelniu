package es.elniu.api.web;

import es.elniu.api.servicio.CatalogoServicio;
import es.elniu.api.web.dto.CatalogoDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Lo que lee la web publica: la carta entera de una vez. */
@RestController
@RequestMapping("/api")
public class CatalogoControlador {

    private final CatalogoServicio catalogo;

    public CatalogoControlador(CatalogoServicio catalogo) {
        this.catalogo = catalogo;
    }

    @GetMapping("/catalogo")
    public CatalogoDto catalogo() {
        return catalogo.catalogo();
    }
}
