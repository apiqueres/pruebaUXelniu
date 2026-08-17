package es.elniu.api.dominio;

/**
 * Una reserva nace pendiente y no ocupa mesa hasta que la casa la confirma.
 * Las rechazadas se conservan para poder mirar atras.
 */
public enum EstadoReserva {
    pendiente,
    confirmada,
    rechazada
}
