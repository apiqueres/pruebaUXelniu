package es.elniu.api.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import es.elniu.api.dominio.ApartadoMenu;
import es.elniu.api.dominio.Categoria;
import es.elniu.api.dominio.Evento;
import es.elniu.api.dominio.Foto;
import es.elniu.api.dominio.Horario;
import es.elniu.api.dominio.MenuCarta;
import es.elniu.api.dominio.Producto;
import es.elniu.api.dominio.Restaurante;
import es.elniu.api.dominio.Rol;
import es.elniu.api.dominio.TipoCategoria;
import es.elniu.api.dominio.Usuario;
import es.elniu.api.repositorio.CategoriaRepositorio;
import es.elniu.api.repositorio.EventoRepositorio;
import es.elniu.api.repositorio.FotoRepositorio;
import es.elniu.api.repositorio.MenuRepositorio;
import es.elniu.api.repositorio.ProductoRepositorio;
import es.elniu.api.repositorio.RestauranteRepositorio;
import es.elniu.api.repositorio.UsuarioRepositorio;
import java.io.InputStream;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Deja la base de datos usable la primera vez que arranca: crea la cuenta de
 * administracion y carga la carta desde {@code datos/catalogo.json}, el mismo
 * fichero que usaba el frontend.
 *
 * <p>No hace nada si ya hay datos, asi que reiniciar no pisa lo que la casa
 * haya cambiado desde el panel.
 */
@Component
public class SiembraInicial implements CommandLineRunner {

    private static final Logger LOG = LoggerFactory.getLogger(SiembraInicial.class);

    private final PropiedadesElNiu propiedades;
    private final PasswordEncoder cifrador;
    private final UsuarioRepositorio usuarios;
    private final CategoriaRepositorio categorias;
    private final ProductoRepositorio productos;
    private final MenuRepositorio menus;
    private final EventoRepositorio eventos;
    private final FotoRepositorio fotos;
    private final RestauranteRepositorio restaurantes;

    public SiembraInicial(PropiedadesElNiu propiedades, PasswordEncoder cifrador,
                          UsuarioRepositorio usuarios, CategoriaRepositorio categorias,
                          ProductoRepositorio productos, MenuRepositorio menus,
                          EventoRepositorio eventos, FotoRepositorio fotos,
                          RestauranteRepositorio restaurantes) {
        this.propiedades = propiedades;
        this.cifrador = cifrador;
        this.usuarios = usuarios;
        this.categorias = categorias;
        this.productos = productos;
        this.menus = menus;
        this.eventos = eventos;
        this.fotos = fotos;
        this.restaurantes = restaurantes;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        crearAdministrador();
        cargarCatalogo();
    }

    private void crearAdministrador() {
        if (usuarios.count() > 0) {
            return;
        }

        String nombre = propiedades.admin() == null || propiedades.admin().usuario() == null
                || propiedades.admin().usuario().isBlank()
                ? "admin"
                : propiedades.admin().usuario();

        String clave = propiedades.admin() == null ? null : propiedades.admin().clave();

        if (clave == null || clave.isBlank()) {
            /* Sin clave configurada se genera una al azar y se escribe en el
               registro una sola vez. Es preferible a dejar una clave conocida
               escrita en el repositorio. */
            byte[] aleatorio = new byte[12];
            new SecureRandom().nextBytes(aleatorio);
            clave = Base64.getUrlEncoder().withoutPadding().encodeToString(aleatorio);

            LOG.warn("\n"
                    + "===========================================================\n"
                    + " Cuenta de administracion creada\n"
                    + "   usuario: {}\n"
                    + "   clave:   {}\n"
                    + " Apuntala: no se vuelve a mostrar. Para fijarla tu mismo,\n"
                    + " arranca con ELNIU_ADMIN_CLAVE.\n"
                    + "===========================================================", nombre, clave);
        }

        usuarios.save(new Usuario(nombre, cifrador.encode(clave), Rol.ADMIN));
    }

    private void cargarCatalogo() throws Exception {
        if (categorias.count() > 0) {
            return;
        }

        ClassPathResource recurso = new ClassPathResource("datos/catalogo.json");
        if (!recurso.exists()) {
            LOG.warn("No hay datos/catalogo.json: la carta arranca vacia.");
            return;
        }

        ObjectMapper mapeador = new ObjectMapper();
        JsonNode raiz;
        try (InputStream entrada = recurso.getInputStream()) {
            raiz = mapeador.readTree(entrada);
        }

        restaurantes.save(leerRestaurante(raiz));

        for (JsonNode n : raiz.path("categorias")) {
            Categoria c = new Categoria();
            c.setId(n.path("id").asText());
            c.setNombre(n.path("nombre").asText());
            c.setTipo(TipoCategoria.valueOf(n.path("tipo").asText("plato")));
            c.setOrden(n.path("orden").asInt());
            c.setNota(texto(n, "nota"));
            categorias.save(c);
        }

        for (JsonNode n : raiz.path("productos")) {
            Producto p = new Producto();
            p.setId(n.path("id").asText());
            p.setCategoriaId(n.path("categoriaId").asText());
            p.setNombre(n.path("nombre").asText());
            p.setDescripcion(texto(n, "descripcion"));
            p.setPrecio(decimal(n, "precio"));
            p.setPrecioNota(texto(n, "precioNota"));
            p.setUnidad(texto(n, "unidad"));
            p.setImagen(texto(n, "imagen"));
            p.setDistintivos(lista(n.path("distintivos")));
            p.setDestacado(n.path("destacado").asBoolean());
            p.setActivo(n.path("activo").asBoolean(true));
            p.setOrden(n.path("orden").asInt());
            productos.save(p);
        }

        for (JsonNode n : raiz.path("menus")) {
            MenuCarta m = new MenuCarta();
            m.setId(n.path("id").asText());
            m.setNombre(n.path("nombre").asText());
            m.setDisponibilidad(texto(n, "disponibilidad"));
            m.setPrecio(decimal(n, "precio"));
            m.setPrecioNota(texto(n, "precioNota"));
            m.setIncluye(lista(n.path("incluye")));
            m.setCondiciones(lista(n.path("condiciones")));
            m.setImagen(texto(n, "imagen"));
            m.setEspecial(n.path("especial").asBoolean());
            m.setActivo(n.path("activo").asBoolean(true));

            List<ApartadoMenu> apartados = new ArrayList<>();
            for (JsonNode a : n.path("apartados")) {
                apartados.add(new ApartadoMenu(a.path("titulo").asText(),
                        lista(a.path("opciones"))));
            }
            m.setApartados(apartados);
            menus.save(m);
        }

        for (JsonNode n : raiz.path("eventos")) {
            Evento e = new Evento();
            e.setId(n.path("id").asText());
            e.setNombre(n.path("nombre").asText());
            e.setDescripcion(texto(n, "descripcion"));
            e.setImagen(texto(n, "imagen"));
            eventos.save(e);
        }

        for (JsonNode n : raiz.path("galeria")) {
            Foto foto = new Foto();
            foto.setId(n.path("id").asText());
            foto.setImagen(n.path("imagen").asText());
            foto.setCategoria(texto(n, "categoria"));
            foto.setTitulo(texto(n, "titulo"));
            fotos.save(foto);
        }

        LOG.info("Carta cargada: {} categorias, {} productos, {} menus.",
                categorias.count(), productos.count(), menus.count());
    }

    private Restaurante leerRestaurante(JsonNode raiz) {
        JsonNode n = raiz.path("restaurante");
        Restaurante r = new Restaurante();
        r.setId(Restaurante.UNICO);
        r.setNombre(n.path("nombre").asText());
        r.setReclamo(texto(n, "reclamo"));
        r.setPresentacion(lista(n.path("presentacion")));
        r.setDireccion(texto(n, "direccion"));
        r.setPoblacion(texto(n, "poblacion"));
        r.setTelefono(texto(n, "telefono"));
        r.setWhatsapp(texto(n, "whatsapp"));
        r.setInstagram(texto(n, "instagram"));
        r.setFacebook(texto(n, "facebook"));
        r.setMapa(texto(n, "mapa"));
        r.setAforoSalon(n.path("capacidad").path("salon").asInt());
        r.setAforoPrivado(n.path("capacidad").path("privado").asInt());
        r.setDesde(n.path("desde").asInt());
        r.setAvisoAlergenos(texto(raiz.path("avisos"), "alergenos"));
        r.setAvisoBodega(texto(raiz.path("avisos"), "bodega"));

        List<Horario> horarios = new ArrayList<>();
        for (JsonNode h : n.path("horarios")) {
            horarios.add(new Horario(h.path("dias").asText(), lista(h.path("turnos")),
                    h.path("cerrado").asBoolean()));
        }
        r.setHorarios(horarios);
        return r;
    }

    private static String texto(JsonNode nodo, String campo) {
        JsonNode valor = nodo.path(campo);
        return valor.isMissingNode() || valor.isNull() ? null : valor.asText();
    }

    private static BigDecimal decimal(JsonNode nodo, String campo) {
        JsonNode valor = nodo.path(campo);
        return valor.isMissingNode() || valor.isNull() ? null : valor.decimalValue();
    }

    private static List<String> lista(JsonNode nodo) {
        List<String> salida = new ArrayList<>();
        nodo.forEach(x -> salida.add(x.asText()));
        return salida;
    }
}
