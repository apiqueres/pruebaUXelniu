# Restaurant el Niu — API

Backend en Spring Boot 3.5 y Java 17 para la carta, los menús y las reservas,
con login para el panel de administración.

Devuelve el catálogo con **la misma forma** que el `catalogo.json` que ya
consume la aplicación de Angular, así que el frontend puede cambiar de origen
de datos sin tocar ninguna de sus páginas.

## Arrancar en local

```bash
mvn spring-boot:run
```

Queda en <http://localhost:8080>. Sin base de datos montada usa **H2 en
memoria**: arranca, carga la carta desde `src/main/resources/datos/catalogo.json`
y sirve. Al parar se pierde todo, que es justo lo que se quiere mientras se
prueba.

La primera vez crea la cuenta de administración. Si no le das clave, **genera
una al azar y la escribe en el registro de arranque** — apúntala, no se vuelve
a mostrar:

```
===========================================================
 Cuenta de administracion creada
   usuario: admin
   clave:   xxxxxxxxxxxxxxxx
===========================================================
```

Para fijarla tú:

```bash
ELNIU_ADMIN_USUARIO=alejandro ELNIU_ADMIN_CLAVE=... mvn spring-boot:run
```

## Endpoints

### Públicos

| Método | Ruta | Qué hace |
| --- | --- | --- |
| `GET` | `/api/catalogo` | Carta entera: restaurante, categorías, productos, menús, eventos, galería y avisos |
| `POST` | `/api/reservas` | Petición de mesa. Nace **pendiente** |
| `POST` | `/api/auth/login` | Devuelve el token |

### Con token de administración

Todo bajo `/api/admin/**`, con la cabecera `Authorization: Bearer <token>`.

| Método | Ruta | Qué hace |
| --- | --- | --- |
| `GET` | `/api/admin/reservas` | Todas |
| `GET` | `/api/admin/reservas/pendientes` | Las que esperan decisión, por orden de llegada |
| `GET` | `/api/admin/reservas/proximas` | Confirmadas de hoy en adelante |
| `GET` | `/api/admin/reservas/rango?desde=&hasta=` | Confirmadas del periodo (calendario y PDF) |
| `POST` | `/api/admin/reservas/{id}/confirmar` | |
| `POST` | `/api/admin/reservas/{id}/rechazar` | |
| `POST` | `/api/admin/reservas/{id}/reabrir` | Devuelve a pendientes |
| `DELETE` | `/api/admin/reservas/{id}` | |
| `POST` `PUT` `DELETE` | `/api/admin/productos[/{id}]` | |
| `POST` `PUT` `DELETE` | `/api/admin/menus[/{id}]` | |
| `POST` `PUT` `DELETE` | `/api/admin/categorias[/{id}]` | Borrar una categoría arrastra sus productos |

Ejemplo:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"usuario":"admin","clave":"TU_CLAVE"}' | jq -r .token)
```

## Avisos de reserva por correo

Cuando entra una petición, la API manda un correo a la casa. Va en texto plano
(se lee igual en el móvil que en el ordenador de la barra y pasa mejor los
filtros de spam), y el `Reply-To` es el correo del cliente: al responder, le
escribes directamente a él.

Se envía **después de que la reserva quede grabada** y en segundo plano. Si el
servidor de correo falla, la reserva no se pierde: queda en el panel y el fallo
solo se anota en el registro. Medido con el SMTP caído, el alta responde en
menos de 10 ms.

### Con Gmail

Gmail no acepta tu clave normal desde una aplicación: hace falta una **clave de
aplicación**, que se crea en <https://myaccount.google.com/apppasswords> (pide
tener la verificación en dos pasos activada).

Con esa clave en la mano, arranca así:

```bash
ELNIU_SMTP_HOST=smtp.gmail.com ELNIU_SMTP_PUERTO=587 ELNIU_SMTP_AUTENTICA=true ELNIU_SMTP_TLS=true ELNIU_SMTP_USUARIO=tu-cuenta@gmail.com ELNIU_SMTP_CLAVE=la-clave-de-aplicacion ELNIU_AVISOS_REMITENTE=tu-cuenta@gmail.com ELNIU_AVISOS_DESTINO=tu-cuenta@gmail.com mvn spring-boot:run
```

`ELNIU_AVISOS_REMITENTE` tiene que ser **la misma cuenta** que
`ELNIU_SMTP_USUARIO`: Gmail rechaza los correos que dicen venir de otra
dirección.

Ni la clave ni la dirección de destino están escritas en el repositorio, y no
deben estarlo: este código es público y los rastreadores peinan los repos
buscando precisamente eso.

### Probando sin proveedor

Sin `ELNIU_SMTP_HOST` apunta a `localhost:1025`, donde puedes poner cualquier
buzón de pruebas (Mailpit, MailHog o un servidor SMTP de juguete) para ver el
correo sin mandar nada de verdad. Y sin `ELNIU_AVISOS_DESTINO` no se envía nada:
solo queda una línea en el registro.

## Formatos

`dia` en `AAAA-MM-DD` y `hora` en `HH:MM`, tal cual los emiten los campos del
formulario y sin zona horaria: el restaurante siempre está en Sueca. `creada` y
`resuelta` en ISO-8601 UTC. `estado` es `pendiente`, `confirmada` o `rechazada`.

## Seguridad

- **JWT** con HS256, sin sesión ni cookies: la identidad viaja en cada petición
  dentro del token. Por eso CSRF está desactivado — no hay nada que un tercero
  pueda hacer enviar al navegador sin querer.
- Claves con **bcrypt**. En la base de datos solo se guarda el hash.
- El login responde lo mismo si falla el usuario o la clave: decir cuál de los
  dos es incorrecto confirmaría que ese usuario existe.
- La comprobación de que no se reserva para un día pasado se repite en el
  servidor aunque el formulario ya la haga: `/api/reservas` es público y
  cualquiera puede llamarlo sin pasar por la página.

**No hay ninguna credencial escrita en este repositorio.** Todo sale de
variables de entorno.

## Variables de entorno

| Variable | Para qué | Si falta |
| --- | --- | --- |
| `ELNIU_JWT_SECRETO` | Firma de los tokens, 32 caracteres o más | Se genera uno temporal y las sesiones se pierden al reiniciar |
| `ELNIU_ADMIN_USUARIO` | Cuenta de administración | `admin` |
| `ELNIU_ADMIN_CLAVE` | Su clave | Se genera al azar y se escribe en el registro |
| `ELNIU_CORS_ORIGENES` | Orígenes permitidos, separados por comas | El de GitHub Pages |
| `ELNIU_BD_URL` `ELNIU_BD_USUARIO` `ELNIU_BD_CLAVE` | PostgreSQL (perfil `vps`) | — |
| `ELNIU_BD_ESQUEMA` | `update` o `validate` | `update` |

## Llevarlo al VPS

1. Empaquetar: `mvn clean package` → `target/elniu-api-0.0.1-SNAPSHOT.jar`
2. Crear la base de datos en PostgreSQL.
3. Arrancar con el perfil del servidor:

```bash
java -jar elniu-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=vps
```

con estas variables en el entorno (por ejemplo, en la unidad de systemd):

```
ELNIU_BD_URL=jdbc:postgresql://localhost:5432/elniu
ELNIU_BD_USUARIO=elniu
ELNIU_BD_CLAVE=...
ELNIU_JWT_SECRETO=...
ELNIU_ADMIN_CLAVE=...
ELNIU_CORS_ORIGENES=https://tu-dominio.es
```

La primera vez carga la carta desde `catalogo.json`; después no vuelve a
tocarla, así que reiniciar no pisa lo que la casa haya cambiado desde el panel.

En cuanto el esquema esté estable, pon `ELNIU_BD_ESQUEMA=validate` para que un
despliegue no pueda alterar las tablas sin querer.

## Cómo se guardan los datos

Las listas de texto de la carta (lo que incluye un menú, sus apartados, los
turnos de un horario, los distintivos de un plato) van en **una columna JSON**
en vez de en tablas aparte. Son texto suelto que solo se lee acompañando a su
dueño: nunca se busca ni se ordena por ellas. Una tabla por cada una
multiplicaría las consultas sin dar nada a cambio, y JPA además no admite una
colección dentro de otra, que es justo la forma de los apartados de un menú.

Los productos guardan `categoriaId` como identificador suelto, no como relación
JPA: el catálogo se lee entero de una vez y se sirve tal cual al frontend.

## Lo que falta

- **Enganchar el frontend.** Hoy la aplicación de Angular sigue leyendo su
  `catalogo.json` y guardando en `localStorage`. Para pasarla a esta API hay que
  tocar solo `CatalogoService` y `ReservasService`, más una pantalla de login
  para `/admin`.
- **Aviso por correo** a la casa cuando entra una petición de reserva.
- **Subida de imágenes** desde el panel, en lugar de escribir la ruta a mano.
