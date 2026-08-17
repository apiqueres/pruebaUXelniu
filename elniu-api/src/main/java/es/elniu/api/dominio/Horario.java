package es.elniu.api.dominio;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Un tramo del horario semanal. Se guarda dentro del restaurante, en JSON. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Horario {

    private String dias;
    private List<String> turnos = new ArrayList<>();
    private boolean cerrado;
}
