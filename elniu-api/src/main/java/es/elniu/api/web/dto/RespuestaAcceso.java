package es.elniu.api.web.dto;

import java.time.Instant;

public record RespuestaAcceso(String token, Instant expira, String usuario, String rol) {}
