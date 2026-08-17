# Restaurant el Niu

Web y panel de gestión del restaurante, en dos mitades:

| Carpeta | Qué es |
| --- | --- |
| [`elniu-app/`](elniu-app) | La web, en Angular 21. Carta, menús, eventos, reservas y el panel de administración |
| [`elniu-api/`](elniu-api) | La API, en Spring Boot 3.5 y Java 17. Datos, login y avisos por correo |

Cada una tiene su propio README con el detalle.

## Arrancar en local

Hacen falta las dos: la web no trae datos propios.

```bash
cd elniu-api && mvn spring-boot:run
```

Y en otra terminal:

```bash
cd elniu-app && npm install && npm start
```

La web queda en <http://localhost:4200> y la API en el 8080. `ng serve` reenvía
`/api` al backend, así que comparten origen y no hay CORS de por medio.

La primera vez, la API crea la cuenta de administración y **escribe su clave en
el registro de arranque**. El panel está en `/admin`.

## Qué hace

Un cliente pide mesa desde `/reservar` dejando nombre, teléfono, correo, día,
hora y personas. La petición nace **pendiente** y le llega un aviso por correo a
la casa. Desde el panel se confirma o se rechaza, y entonces el cliente recibe
su respuesta por correo. Las confirmadas aparecen en el calendario del panel, y
se pueden descargar en PDF por día, semana o mes.

El panel también mantiene la carta: platos, bebidas, menús y categorías.

## Llevarlo al VPS

1. **PostgreSQL**: crear base de datos y usuario. En PostgreSQL 15 o superior no
   olvides `GRANT ALL ON SCHEMA public`, o el usuario podrá conectarse pero no
   crear tablas.
2. **API**: `mvn clean package` y arrancar el jar con
   `--spring.profiles.active=vps`. Las tablas y la carta inicial las crea sola
   en el primer arranque; después no vuelve a tocarlas.
3. **Web**: `npm run build` y servir `dist/elniu-app/browser` con nginx.
4. **nginx**: que sirva la web y reenvíe `/api` al 8080. Así el frontend sigue
   llamando a `/api` sin saber dónde está el backend.

Todas las claves —base de datos, correo, firma de sesiones— van en variables de
entorno, nunca en el repositorio. La lista completa está en el
[README de la API](elniu-api/README.md).

## Lo que falta

- Subida de imágenes desde el panel, en lugar de escribir la ruta a mano.
- Cambiar la clave del administrador sin tocar la base de datos.
- Un servicio de envío con dominio verificado: los correos a clientes desde una
  cuenta de Gmail normal acaban en spam con cierto volumen.

## GitHub Pages

El workflow publica **solo la web**, y desde que lee la carta de la API eso ya
no funciona por sí solo: sin backend accesible enseña un aviso. Sirve para ver
el diseño; el sitio de verdad es el VPS.
