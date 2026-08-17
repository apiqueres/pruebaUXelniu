package es.elniu.api.dominio;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** «1º a elegir» con sus opciones. Se guarda dentro del menu, en JSON. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApartadoMenu {

    private String titulo;
    private List<String> opciones = new ArrayList<>();
}
