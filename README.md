# Cara & Cruz — Moneda 3D

Lanzador de moneda en 3D con física realista (rebotes, fricción, giro) hecho con
[Three.js](https://threejs.org/) + [cannon-es](https://github.com/pmndrs/cannon-es) y TypeScript, empaquetado con [Vite](https://vite.dev/).

El resultado (cara / cruz / lado) no se sortea con `Math.random()`: se lee de la
orientación final de un cuerpo rígido simulado con física real, así que el
"lado" es un resultado genuino (raro) de la simulación, no un caso especial.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Compilar para producción

```bash
npm run build
```

Esto genera la carpeta `dist/` con HTML + CSS + JS estáticos (sin build step
en el servidor, sin Node ni PHP necesarios para que la app funcione — solo
sirve los ficheros). Pesa unos ~650 KB sin comprimir (~170 KB gzip), muy por
debajo del límite de 5 GB.

## Desplegar en un servidor WordPress

La app es 100% estática una vez compilada: no necesita Node en el servidor,
solo que Apache/Nginx (lo que sirva tu WordPress) devuelva esos ficheros tal
cual. Dos formas de integrarla:

### Opción A — Carpeta propia dentro de wp-content (recomendada)

1. Ejecuta `npm run build`.
2. Copia **todo el contenido** de `dist/` (no la carpeta `dist` en sí, sino lo
   que hay dentro) a una carpeta nueva en tu servidor, por ejemplo:
   `wp-content/coin-flip/`.
3. Visita `https://tu-dominio.com/wp-content/coin-flip/` — la app carga
   directamente. `vite.config.ts` usa `base: "./"` (rutas relativas), así que
   funciona en cualquier subcarpeta sin tocar nada.
4. Si quieres que aparezca dentro de una página de WordPress en vez de en su
   propia URL, incrusta un iframe en esa página (bloque HTML personalizado):

   ```html
   <iframe
     src="/wp-content/coin-flip/"
     style="width:100%; height:80vh; border:0; border-radius:12px;"
     loading="lazy"
     allow="autoplay"
   ></iframe>
   ```

### Opción B — Shortcode de WordPress (para incrustarla en cualquier entrada)

1. `npm run build`.
2. Sube la carpeta `dist/` completa a `wp-content/uploads/coin-flip/` (por
   FTP, o con el gestor de archivos de tu hosting).
3. Añade este shortcode al `functions.php` de tu tema (o a un plugin de
   fragmentos de código tipo "Code Snippets"):

   ```php
   function coin_flip_3d_shortcode() {
       $base = content_url( '/uploads/coin-flip/' );
       return '<iframe src="' . esc_url( $base ) . '" style="width:100%;height:80vh;border:0;border-radius:12px;" loading="lazy"></iframe>';
   }
   add_shortcode( 'moneda_3d', 'coin_flip_3d_shortcode' );
   ```

4. Usa `[moneda_3d]` en cualquier página o entrada.

### Notas

- No hace falta configurar nada en PHP: los ficheros de `dist/` son HTML, JS
  y CSS puros. WordPress (o el propio Apache/Nginx) los sirve como archivos
  estáticos sin pasar por PHP.
- Si sirves la carpeta directamente (Opción A) y quieres una URL más limpia
  sin iframe, también puedes crear una página en blanco de WordPress y pegar
  el contenido de `dist/index.html` en un bloque HTML personalizado — pero
  como esa plantilla ya referencia sus propios `assets/*.js`/`*.css` con
  rutas relativas, es más sencillo y fiable usar el iframe.
- Las estadísticas (cara/cruz/lado) se guardan en `localStorage` del
  navegador de cada visitante, no en el servidor.
- Vuelve a ejecutar `npm run build` y a subir `dist/` cada vez que cambies el
  código; no hay watch/hot-reload en producción.

## Estructura del proyecto

```
src/
  audio/     sonidos sintetizados por WebAudio (sin ficheros de audio)
  coin/      geometría y texturas (procedurales, via canvas) de la moneda
  physics/   mundo cannon-es, lanzamiento y lectura del resultado
  scene/     cámara, luces, entorno y controles orbitales de Three.js
  ui/        HUD (marcador, botón, estadísticas)
  main.ts    orquesta todo y el bucle de animación
```

## Cómo se decide cara / cruz / lado

`src/physics/flip.ts` lanza la moneda con velocidad e impulso de giro
aleatorios y dispositivo real (cannon-es simula gravedad, rebotes, fricción).
Cuando el cuerpo se queda quieto, se compara su eje local "arriba" con la
vertical del mundo:

- si apunta claramente hacia arriba → **cara**
- si apunta claramente hacia abajo → **cruz**
- si queda casi horizontal (moneda de canto) → **lado**

Los parámetros de fricción/restitución/grosor se calibraron con una
simulación de 3000 lanzamientos en Node (ver historial de commits) para que
"lado" salga en ~2–3% de los casos, como en una moneda física gruesa — poco
común, pero no imposible.
