package es.elniu.api.dominio;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reserva", indexes = {
    @Index(name = "idx_reserva_dia", columnList = "dia"),
    @Index(name = "idx_reserva_estado", columnList = "estado")
})
@Getter
@Setter
@NoArgsConstructor
public class Reserva {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 30)
    private String telefono;

    @Column(nullable = false, length = 160)
    private String email;

    /** Dia y hora locales, sin zona: el restaurante siempre esta en Sueca. */
    @Column(nullable = false)
    private LocalDate dia;

    /* «14:30» y no «14:30:00»: es el formato que emite el <input type="time">
       del formulario y con el que el frontend compara y ordena. */
    @JsonFormat(pattern = "HH:mm")
    @Column(nullable = false)
    private LocalTime hora;

    @Column(nullable = false)
    private int personas;

    @Column(length = 500)
    private String comentario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoReserva estado = EstadoReserva.pendiente;

    @Column(nullable = false)
    private Instant creada = Instant.now();

    private Instant resuelta;
}
