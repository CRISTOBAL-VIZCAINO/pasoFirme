# Paso Firme · Frontend

Sitio web de **P.A.S.O. FIRME** (Pedagogía contable, Acompañamiento in-situ, Simulación tributaria y Organización financiera), iniciativa de inclusión financiera para los micronegocios de la economía popular de Barranquilla y el Atlántico.

Proyecto **exclusivamente frontend** (Angular 22, componentes standalone, signals, sin zone.js). No hay backend: los formularios guardan las solicitudes en `localStorage` mediante `core/services/solicitudes.ts`, el único punto que habría que reemplazar por llamadas HTTP.

## Comandos

```bash
npm install
npm start          # http://localhost:4200
npm run build      # salida en dist/paso-firme-web
npm test           # pruebas unitarias (Vitest)
npm run test:e2e   # compila y ejecuta 172 pruebas funcionales en Chrome (rutas, enlaces, menú,
                   # calculadoras, formularios, carrusel, accesibilidad y errores de consola)
npm run serve:dist # sirve el build de producción en http://localhost:4400
```

> **Al publicar:** el hosting debe redirigir cualquier ruta desconocida a `index.html` (fallback SPA);
> si no, recargar una página como `/herramientas/caja-diaria` daría error 404. En Netlify se logra con
> un archivo `_redirects` (`/* /index.html 200`); en Vercel, Firebase y Nginx, con su regla equivalente.

## Estructura

```
src/
├── styles/                 Tokens de diseño y estilos globales (botones, tarjetas, formularios, calculadoras)
└── app/
    ├── core/               Layout (header, footer, botón WhatsApp), título/SEO por ruta, servicio de solicitudes
    ├── shared/             Iconos SVG, logo, encabezados, hero de páginas, CTA, directiva de aparición, pipe COP
    ├── data/               Contenido editorial, configuración del sitio y parámetros tributarios de referencia
    └── features/
        ├── home/           Inicio
        ├── programa/       Método P.A.S.O., ruta de 90 días, humano + IA, requisitos
        ├── herramientas/   Caja diaria, gota a gota vs. microcrédito, simulador tributario, autodiagnóstico
        │                   (lógica pura en calculos.ts, con pruebas en calculos.spec.ts)
        ├── entidades/      Propuesta B2B / B2G / academia y formulario institucional
        ├── impacto/        Metas del piloto, SROI, tablero demostrativo, hoja de ruta, fuentes
        ├── aprende/        Mitos y realidades, cartilla, glosario con búsqueda, preguntas frecuentes
        ├── nosotros/       Propósito (MTP), historia, valores, modelo ExO, cultura, equipo
        ├── inscripcion/    Formulario de inscripción de comerciantes
        └── privacidad/     Tratamiento de datos (Ley 1581 de 2012)
```

## Fotos (carruseles de confianza)

Los carruseles muestran un espacio reservado con la toma sugerida mientras falte el archivo. Para activar una foto basta con guardarla con el nombre exacto:

| Dónde | Carpeta | Archivos |
| --- | --- | --- |
| Inicio · «En el territorio» | `public/images/territorio/` | `01-conversacion-paseo-bolivar.jpg` … `06-comerciante-orgulloso.jpg` |
| Nosotros · «Nuestro equipo en acción» | `public/images/equipo/` | `01-equipo-fundador.jpg` … `04-presentacion.jpg` |
| Nosotros · tarjetas del equipo | `public/images/equipo/` | `daniel-sarmiento.jpg`, `jorge-rueda.jpg`, `cristian-baena.jpg`, `estefania-baron.jpg`, `cristobal-vizcaino.jpg` |

Los textos, nombres de archivo y sugerencias están en `FOTOS_TERRITORIO`, `FOTOS_EQUIPO` y `EQUIPO` (`src/app/data/content.ts`).
Recomendado: JPG o WebP horizontal 1600×1067 (3:2) de menos de 300 KB; retratos del equipo cuadrados de 400×400.
Cada comerciante que aparezca debe firmar una autorización de uso de imagen.

## Antes de publicar

- Reemplazar el WhatsApp y el correo de marcador en `src/app/data/site.config.ts`.
- Verificar la UVT y las tarifas de referencia en `src/app/data/tax-params.ts`.
- Revisar y adoptar formalmente la política de datos de `/privacidad`.
