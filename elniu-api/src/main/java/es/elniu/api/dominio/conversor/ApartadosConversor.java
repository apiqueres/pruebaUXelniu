package es.elniu.api.dominio.conversor;

import com.fasterxml.jackson.core.type.TypeReference;
import es.elniu.api.dominio.ApartadoMenu;
import jakarta.persistence.Converter;
import java.util.List;

@Converter
public class ApartadosConversor extends ConversorJson<ApartadoMenu> {

    @Override
    protected TypeReference<List<ApartadoMenu>> tipo() {
        return new TypeReference<>() {};
    }
}
