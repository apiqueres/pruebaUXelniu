/* La API cuelga del mismo origen que la web.

   En desarrollo lo consigue el proxy de `ng serve` (proxy.conf.json), que
   reenvia /api a localhost:8080; en el servidor lo hara nginx. Asi no hay CORS
   que pelear ni una URL absoluta que cambiar al desplegar. */
export const API = '/api';
