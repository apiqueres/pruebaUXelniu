package es.elniu.api.servicio;

import es.elniu.api.dominio.Restaurante;
import java.util.List;

/**
 * Compone el HTML de los correos con la misma piel que la web: la arena de
 * fondo, la franja de tinta, el naranja de la casa y las esquinas redondeadas.
 *
 * <p>Esta escrito con tablas y con los estilos metidos a mano en cada etiqueta,
 * que es feo de leer pero es lo unico que pintan igual todos los clientes de
 * correo. Outlook usa el motor de Word: ni rejillas, ni flex, ni hojas de
 * estilo aparte.
 *
 * <p>Las tipografias de la web no se pueden cargar aqui (Gmail y Outlook
 * eliminan las fuentes externas), asi que los titulares caen en una condensada
 * gruesa del sistema. El resto del sistema visual si se mantiene.
 */
final class PlantillaCorreo {

    private static final String ARENA = "#dedbd6";
    private static final String ARENA_MEDIA = "#eceae7";
    private static final String ARENA_CLARA = "#f7f5f2";
    private static final String TINTA = "#2e2e2e";
    private static final String NARANJA = "#e2701e";

    private static final String TITULARES =
            "Anton,'Arial Narrow Bold','Arial Black',Impact,sans-serif";
    private static final String TEXTO = "Inter,'Helvetica Neue',Helvetica,Arial,sans-serif";

    private PlantillaCorreo() {}

    /** Una linea de la ficha de datos: «Personas / 6». */
    record Fila(String etiqueta, String valor) {}

    static String construir(String antetitulo, String titular, String entrada,
                            List<Fila> filas, String cierre,
                            String textoBoton, String enlaceBoton, Restaurante casa) {

        StringBuilder h = new StringBuilder(2048);

        h.append("<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\">")
         .append("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">")
         .append("</head><body style=\"margin:0;padding:0;background:").append(ARENA)
         .append(";\">");

        // Lienzo exterior: el color de fondo va en una tabla porque varios
        // clientes descartan el estilo del <body>.
        h.append("<table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\"")
         .append(" cellspacing=\"0\" style=\"background:").append(ARENA)
         .append(";\"><tr><td align=\"center\" style=\"padding:24px 12px;\">");

        h.append("<table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\"")
         .append(" cellspacing=\"0\" style=\"max-width:560px;background:").append(ARENA_CLARA)
         .append(";border-radius:24px;overflow:hidden;\">");

        // ---- Franja de la casa ---------------------------------------------
        h.append("<tr><td style=\"background:").append(TINTA).append(";padding:22px 28px;\">")
         .append("<div style=\"font-family:").append(TITULARES)
         .append(";font-size:21px;letter-spacing:.02em;text-transform:uppercase;color:")
         .append(ARENA).append(";\">").append(escapar(casa.getNombre())).append("</div>")
         .append("<div style=\"font-family:").append(TEXTO)
         .append(";font-size:10px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;")
         .append("color:").append(ARENA).append(";opacity:.5;padding-top:7px;\">")
         .append(escapar(casa.getPoblacion())).append("</div></td></tr>");

        // ---- Titular --------------------------------------------------------
        h.append("<tr><td style=\"padding:30px 28px 0;\">")
         .append("<div style=\"font-family:").append(TEXTO)
         .append(";font-size:10px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;")
         .append("color:").append(NARANJA).append(";\">").append(escapar(antetitulo))
         .append("</div>")
         .append("<div style=\"font-family:").append(TITULARES)
         .append(";font-size:30px;line-height:1.08;letter-spacing:.01em;text-transform:uppercase;")
         .append("color:").append(TINTA).append(";padding-top:9px;\">").append(escapar(titular))
         .append("</div>");

        if (entrada != null && !entrada.isBlank()) {
            h.append("<p style=\"margin:16px 0 0;font-family:").append(TEXTO)
             .append(";font-size:15px;line-height:1.6;color:").append(TINTA)
             .append(";\">").append(escapar(entrada)).append("</p>");
        }
        h.append("</td></tr>");

        // ---- Ficha de datos --------------------------------------------------
        if (filas != null && !filas.isEmpty()) {
            h.append("<tr><td style=\"padding:22px 28px 0;\">")
             .append("<table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\"")
             .append(" cellspacing=\"0\" style=\"background:").append(ARENA_MEDIA)
             .append(";border-radius:18px;\"><tr><td style=\"padding:20px 22px;\">")
             .append("<table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\"")
             .append(" cellspacing=\"0\">");

            for (int i = 0; i < filas.size(); i++) {
                Fila fila = filas.get(i);
                String separacion = i == 0 ? "0" : "12px";
                h.append("<tr><td style=\"padding-top:").append(separacion)
                 .append(";font-family:").append(TEXTO)
                 .append(";font-size:9px;font-weight:700;letter-spacing:.22em;")
                 .append("text-transform:uppercase;color:").append(TINTA)
                 .append(";opacity:.45;\">").append(escapar(fila.etiqueta())).append("</td></tr>")
                 .append("<tr><td style=\"padding-top:3px;font-family:").append(TEXTO)
                 .append(";font-size:15px;line-height:1.45;color:").append(TINTA)
                 .append(";\">").append(escapar(fila.valor())).append("</td></tr>");
            }

            h.append("</table></td></tr></table></td></tr>");
        }

        // ---- Boton -----------------------------------------------------------
        if (textoBoton != null && enlaceBoton != null && !enlaceBoton.isBlank()) {
            h.append("<tr><td style=\"padding:24px 28px 0;\">")
             .append("<a href=\"").append(escapar(enlaceBoton))
             .append("\" style=\"display:inline-block;background:").append(NARANJA)
             .append(";color:#ffffff;text-decoration:none;font-family:").append(TEXTO)
             .append(";font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;")
             .append("padding:15px 26px;border-radius:999px;\">").append(escapar(textoBoton))
             .append("</a></td></tr>");
        }

        // ---- Cierre ----------------------------------------------------------
        if (cierre != null && !cierre.isBlank()) {
            h.append("<tr><td style=\"padding:24px 28px 0;font-family:").append(TEXTO)
             .append(";font-size:13px;line-height:1.6;color:").append(TINTA)
             .append(";opacity:.7;\">").append(escapar(cierre)).append("</td></tr>");
        }

        // ---- Pie -------------------------------------------------------------
        h.append("<tr><td style=\"padding:26px 28px 28px;\">")
         .append("<div style=\"border-top:1px solid rgba(46,46,46,.14);padding-top:18px;")
         .append("font-family:").append(TEXTO)
         .append(";font-size:12px;line-height:1.7;color:").append(TINTA)
         .append(";opacity:.5;\">")
         .append(escapar(casa.getDireccion())).append("<br>")
         .append(escapar(casa.getPoblacion())).append("<br>")
         .append(escapar(telefonoLegible(casa.getTelefono())))
         .append("</div></td></tr>");

        h.append("</table></td></tr></table></body></html>");
        return h.toString();
    }

    static String telefonoLegible(String telefono) {
        return telefono == null ? "" : telefono.replaceAll("(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3");
    }

    /** Un nombre con «&» o «<» partiria la maquetacion del correo. */
    private static String escapar(String texto) {
        if (texto == null) {
            return "";
        }
        return texto.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
