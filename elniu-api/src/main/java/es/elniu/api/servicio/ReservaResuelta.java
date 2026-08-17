package es.elniu.api.servicio;

import es.elniu.api.dominio.Reserva;

/**
 * La casa acaba de aceptar o rechazar una peticion de mesa.
 *
 * <p>Igual que {@link ReservaCreada}, va como evento para que la decision no
 * dependa de que el correo funcione: ya esta grabada, y avisar es cosa aparte.
 */
public record ReservaResuelta(Reserva reserva) {}
