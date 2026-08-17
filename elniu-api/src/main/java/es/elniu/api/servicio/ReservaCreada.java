package es.elniu.api.servicio;

import es.elniu.api.dominio.Reserva;

/**
 * Aviso interno de que un cliente acaba de pedir mesa.
 *
 * <p>Se publica como evento en vez de llamar al correo desde el servicio de
 * reservas para que el alta no dependa de que el correo funcione: la reserva se
 * graba, y avisar es cosa aparte.
 */
public record ReservaCreada(Reserva reserva) {}
