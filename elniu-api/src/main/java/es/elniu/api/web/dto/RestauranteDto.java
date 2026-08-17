package es.elniu.api.web.dto;

import es.elniu.api.dominio.Horario;
import es.elniu.api.dominio.Restaurante;
import java.util.List;

/** La ficha de la casa tal y como la espera el frontend. */
public record RestauranteDto(
        String nombre,
        String reclamo,
        List<String> presentacion,
        String direccion,
        String poblacion,
        String telefono,
        String whatsapp,
        String instagram,
        String facebook,
        String mapa,
        Capacidad capacidad,
        int desde,
        List<Horario> horarios) {

    public record Capacidad(int salon, int privado) {}

    public static RestauranteDto de(Restaurante r) {
        return new RestauranteDto(
                r.getNombre(),
                r.getReclamo(),
                r.getPresentacion(),
                r.getDireccion(),
                r.getPoblacion(),
                r.getTelefono(),
                r.getWhatsapp(),
                r.getInstagram(),
                r.getFacebook(),
                r.getMapa(),
                new Capacidad(r.getAforoSalon(), r.getAforoPrivado()),
                r.getDesde(),
                r.getHorarios());
    }
}
