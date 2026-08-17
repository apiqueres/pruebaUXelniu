package es.elniu.api.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

/** Lo que manda el formulario de la web. El estado y las fechas los pone el servicio. */
public record PeticionReserva(
        @NotBlank(message = "Hace falta el nombre")
        String nombre,

        @NotBlank(message = "Hace falta un telefono de contacto")
        String telefono,

        @NotBlank(message = "Hace falta el correo")
        @Email(message = "El correo no parece valido")
        String email,

        @NotNull(message = "Hace falta el dia")
        LocalDate dia,

        @NotNull(message = "Hace falta la hora")
        LocalTime hora,

        @Min(value = 1, message = "Al menos una persona")
        @Max(value = 100, message = "Para mas de 100 personas, hable con la casa")
        int personas,

        String comentario) {}
