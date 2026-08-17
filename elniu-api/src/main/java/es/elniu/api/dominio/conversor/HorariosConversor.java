package es.elniu.api.dominio.conversor;

import com.fasterxml.jackson.core.type.TypeReference;
import es.elniu.api.dominio.Horario;
import jakarta.persistence.Converter;
import java.util.List;

@Converter
public class HorariosConversor extends ConversorJson<Horario> {

    @Override
    protected TypeReference<List<Horario>> tipo() {
        return new TypeReference<>() {};
    }
}
