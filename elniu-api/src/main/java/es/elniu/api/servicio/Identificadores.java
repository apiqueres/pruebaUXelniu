package es.elniu.api.servicio;

import java.text.Normalizer;
import java.util.Collection;
import java.util.Locale;

/** Identificadores legibles a partir del nombre, como los del catalogo original. */
public final class Identificadores {

    private Identificadores() {}

    public static String desde(String nombre, Collection<String> usados) {
        String base = Normalizer.normalize(nombre == null ? "" : nombre, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");

        if (base.isBlank()) {
            base = "nuevo";
        }
        if (base.length() > 40) {
            base = base.substring(0, 40);
        }
        if (!usados.contains(base)) {
            return base;
        }
        int n = 2;
        while (usados.contains(base + "-" + n)) {
            n++;
        }
        return base + "-" + n;
    }
}
