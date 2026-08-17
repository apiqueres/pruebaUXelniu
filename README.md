# Restaurant el Niu — web en Angular

Migración a Angular 21 de la maqueta estática de `../elniu`, con las secciones
separadas en páginas propias y un panel para que la casa mantenga la carta.

## Arrancar

```bash
npm install
npm start
```

Queda en <http://localhost:4200>. Para compilar: `npm run build`.

## Páginas

| Ruta        | Qué es                                                        |
| ----------- | ------------------------------------------------------------- |
| `/`         | Portada: logo, destacados con foto, la casa y accesos          |
| `/carta`    | Carta completa en tres pestañas: cocina, postres y bodega      |
| `/menus`    | Menús fijos y menús de temporada                               |
| `/eventos`  | Comuniones, bautizos, empresas y eventos privados              |
| `/reservar` | Horarios, contacto, mapa y petición de reserva                 |
| `/admin`    | Panel de administración                                        |

Cada página se descarga sólo cuando se visita (`loadComponent`), así que quien
entra a mirar la carta no se baja además los menús ni el panel.

Los destacados de la portada enlazan a su grupo dentro de `/carta` con un ancla
(`/carta#arroces-melosos`): la página abre la pestaña que toca y baja hasta el
grupo.

## Los datos

`public/data/catalogo.json` es la semilla, con el contenido real sacado de
restaurantelniu.es: 21 categorías, 137 productos, 15 menús, 4 tipos de evento y
la ficha del restaurante (dirección, teléfonos, horarios, redes, aforo).

`CatalogoService` (`src/app/core/catalogo.service.ts`) la carga una sola vez al
arrancar y la deja en un signal del que leen todas las páginas. Lo que edita el
administrador se guarda en `localStorage` bajo la clave `niu.catalogo.v1`; el
botón «Restaurar» del panel lo borra y vuelve a la semilla.

## El panel de administración

En `/admin`, con tres pestañas:

- **Platos y bebidas** — alta, edición y borrado, con buscador y filtros por
  carta y categoría. Se puede ocultar un plato sin borrarlo y marcarlo como
  destacado de portada.
- **Menús** — los fijos y los de temporada, con lo que incluye y las
  condiciones (una por línea).
- **Categorías** — nombre, carta a la que pertenece, orden (con flechas) y
  nota. Borrar una categoría se lleva por delante sus productos, y el botón
  avisa de cuántos son.

Los borrados piden confirmación en el propio botón: el primer toque pregunta y
el segundo ejecuta.

## Cuando llegue el backend

El modelo de `src/app/core/modelos.ts` es el contrato que tendrá que devolver la
API. Para enchufarla sólo hay que tocar `CatalogoService`:

- `cargarSemilla()` → `GET /api/catalogo`
- `guardarProducto` / `borrarProducto` → `POST|PUT|DELETE /api/productos`
- `guardarMenu` / `borrarMenu` → `POST|PUT|DELETE /api/menus`
- `guardarCategoria` / `borrarCategoria` → `POST|PUT|DELETE /api/categorias`

El resto de la aplicación no se entera: todas las páginas leen del mismo signal.

Falta por hacer en esa fase: autenticación del panel (ahora `/admin` está
abierto), subida de imágenes desde el panel en lugar de escribir la ruta a mano,
y que la petición de reserva de `/reservar` llegue de verdad al restaurante.
