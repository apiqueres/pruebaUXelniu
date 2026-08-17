package es.elniu.api.web.dto;

import jakarta.validation.constraints.NotBlank;

public record PeticionAcceso(@NotBlank String usuario, @NotBlank String clave) {}
