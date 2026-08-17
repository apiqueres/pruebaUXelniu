package es.elniu.api.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "foto")
@Getter
@Setter
@NoArgsConstructor
public class Foto {

    @Id
    @Column(length = 60)
    private String id;

    @Column(nullable = false, length = 200)
    private String imagen;

    @Column(length = 60)
    private String categoria;

    private String titulo;
}
