package es.elniu.api.dominio;

import es.elniu.api.dominio.conversor.ListaTextoConversor;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Un plato, un postre o una bebida.
 *
 * <p>La categoria se guarda como identificador suelto y no como relacion JPA.
 * El catalogo se lee entero de una vez y se sirve tal cual al frontend, asi que
 * una relacion solo añadiria «joins» y un JSON distinto al que la aplicacion ya
 * consume.
 */
@Entity
@Table(name = "producto")
@Getter
@Setter
@NoArgsConstructor
public class Producto {

    @Id
    @Column(length = 60)
    private String id;

    @Column(nullable = false, length = 60)
    private String categoriaId;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    /** Nulo cuando el precio no es fijo; entonces manda {@link #precioNota}. */
    @Column(precision = 8, scale = 2)
    private BigDecimal precio;

    @Column(length = 60)
    private String precioNota;

    @Column(length = 60)
    private String unidad;

    @Column(length = 200)
    private String imagen;

    @Convert(converter = ListaTextoConversor.class)
    @Column(length = 500)
    private List<String> distintivos = new ArrayList<>();

    @Column(nullable = false)
    private boolean destacado;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(nullable = false)
    private int orden;
}
