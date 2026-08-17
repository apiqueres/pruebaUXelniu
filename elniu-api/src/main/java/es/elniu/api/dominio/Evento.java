package es.elniu.api.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "evento")
@Getter
@Setter
@NoArgsConstructor
public class Evento {

    @Id
    @Column(length = 60)
    private String id;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 800)
    private String descripcion;

    @Column(length = 200)
    private String imagen;
}
