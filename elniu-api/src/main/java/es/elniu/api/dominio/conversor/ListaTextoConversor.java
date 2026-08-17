package es.elniu.api.dominio.conversor;

import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.persistence.Converter;
import java.util.List;

@Converter
public class ListaTextoConversor extends ConversorJson<String> {

    @Override
    protected TypeReference<List<String>> tipo() {
        return new TypeReference<>() {};
    }
}
