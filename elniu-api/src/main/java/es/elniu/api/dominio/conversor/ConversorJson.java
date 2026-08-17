package es.elniu.api.dominio.conversor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import java.util.List;

/**
 * Guarda una lista como texto JSON en una sola columna.
 *
 * <p>Las listas de la carta (lo que incluye un menu, sus apartados, los turnos
 * de un horario) son texto suelto que solo se lee acompañando a su dueño: nunca
 * se busca ni se ordena por ellas. Una tabla por cada una multiplicaria las
 * consultas sin dar nada a cambio, y JPA ademas no admite una coleccion dentro
 * de otra, que es justo la forma de los apartados de un menu.
 */
abstract class ConversorJson<T> implements AttributeConverter<List<T>, String> {

    private static final ObjectMapper MAPEADOR = new ObjectMapper();

    protected abstract TypeReference<List<T>> tipo();

    @Override
    public String convertToDatabaseColumn(List<T> lista) {
        if (lista == null || lista.isEmpty()) {
            return null;
        }
        try {
            return MAPEADOR.writeValueAsString(lista);
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo guardar la lista como JSON", e);
        }
    }

    @Override
    public List<T> convertToEntityAttribute(String json) {
        if (json == null || json.isBlank()) {
            return new java.util.ArrayList<>();
        }
        try {
            return MAPEADOR.readValue(json, tipo());
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo leer la lista guardada como JSON", e);
        }
    }
}
