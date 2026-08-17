package es.elniu.api.dominio;

import es.elniu.api.dominio.conversor.ApartadosConversor;
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
 * Se llama MenuCarta y no Menu porque «menu» es palabra reservada en varios
 * motores de base de datos y habria que ir entrecomillando la tabla.
 */
@Entity
@Table(name = "menu_carta")
@Getter
@Setter
@NoArgsConstructor
public class MenuCarta {

    @Id
    @Column(length = 60)
    private String id;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 300)
    private String disponibilidad;

    @Column(precision = 8, scale = 2)
    private BigDecimal precio;

    @Column(length = 60)
    private String precioNota;

    @Convert(converter = ListaTextoConversor.class)
    @Column(length = 2000)
    private List<String> incluye = new ArrayList<>();

    /** Primeros, segundos y postres del menu del dia. */
    @Convert(converter = ApartadosConversor.class)
    @Column(length = 8000)
    private List<ApartadoMenu> apartados = new ArrayList<>();

    @Column(length = 200)
    private String imagen;

    @Convert(converter = ListaTextoConversor.class)
    @Column(length = 2000)
    private List<String> condiciones = new ArrayList<>();

    /** Los especiales son los de temporada: Navidad, comuniones, San Valentin. */
    @Column(nullable = false)
    private boolean especial;

    @Column(nullable = false)
    private boolean activo = true;
}
