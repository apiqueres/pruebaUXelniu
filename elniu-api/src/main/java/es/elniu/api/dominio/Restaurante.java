package es.elniu.api.dominio;

import es.elniu.api.dominio.conversor.HorariosConversor;
import es.elniu.api.dominio.conversor.ListaTextoConversor;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Ficha de la casa. Fila unica, siempre con id 1. */
@Entity
@Table(name = "restaurante")
@Getter
@Setter
@NoArgsConstructor
public class Restaurante {

    public static final Long UNICO = 1L;

    @Id
    private Long id = UNICO;

    private String nombre;
    private String reclamo;

    @Convert(converter = ListaTextoConversor.class)
    @Column(length = 4000)
    private List<String> presentacion = new ArrayList<>();

    private String direccion;
    private String poblacion;
    private String telefono;
    private String whatsapp;
    private String instagram;
    private String facebook;

    @Column(length = 500)
    private String mapa;

    private int aforoSalon;
    private int aforoPrivado;
    private int desde;

    @Convert(converter = HorariosConversor.class)
    @Column(length = 4000)
    private List<Horario> horarios = new ArrayList<>();

    @Column(length = 800)
    private String avisoAlergenos;

    @Column(length = 800)
    private String avisoBodega;
}
