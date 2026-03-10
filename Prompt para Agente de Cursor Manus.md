# Prompt para Agente de Cursor — Rediseño de `nishi-katakana-memotest2`

---

## CONTEXTO Y OBJETIVO

Eres un agente de desarrollo frontend especializado. Tu tarea es **rediseñar completamente la interfaz visual** de la aplicación `nishi-katakana-memotest2` inspirándote en dos fuentes estéticas japonesas clásicas, **integrando el color corporativo Teal de Nishi Nihongo Gakko**, sin alterar la lógica de juego ni la identidad de marca de **Nishi Nihongo Gakko**.

---

## PASO 1 — LECTURA DE FUENTES VISUALES (OBLIGATORIO)

Antes de escribir una sola línea de CSS o JSX, **debes leer y analizar visualmente** las siguientes fuentes. Abre cada URL en el navegador, examina las imágenes y toma nota de los patrones visuales:

### Fuente 1 — Ukiyo-e: *One Hundred Famous Views of Edo* (Hiroshige, 1856–1858)
**URL:** https://commons.wikimedia.org/wiki/One_Hundred_Famous_Views_of_Edo

Analiza y documenta:
- La **paleta cromática**: azul Prussian (Hiroshige blue / 広重ブルー), índigo, ocre terroso, rojo bermellón, negro carbón, blanco washi, verde musgo, dorado envejecido.
- La **composición**: encuadres con elementos en primer plano que funcionan como marcos (ramas, tejados, celosías), perspectiva diagonal, horizonte bajo.
- Las **texturas**: papel washi, gradientes de cielo (bokashi), bloques de color plano sin sombras realistas.
- Los **elementos decorativos**: cartelas rectangulares con texto en caligrafía (título + sello rojo), bordes con patrones geométricos japoneses (seigaiha, asanoha, shippo).
- La **tipografía visual**: kanji pintados con pincel, trazos gruesos y expresivos.

### Fuente 2 — Sumi-e y Caligrafía Japonesa: *Shodo & Sumi-e*
**URL:** https://ar.pinterest.com/mxmlln/art-japanese-calligraphy-and-black-ink-painting-sh/

Analiza y documenta:
- El **contraste tinta/vacío**: uso expresivo del espacio negativo (ma / 間), trazos de pincel con variación de grosor.
- La **gestualidad del trazo**: pinceladas fluidas, manchas de tinta con bordes irregulares, efecto de tinta sobre papel absorbente.
- Los **colores de acento**: negro sumi profundo, rojo cinabrio (hanko / sello), toque de dorado o sepia.
- La **caligrafía como elemento gráfico**: caracteres kanji/katakana grandes como elementos decorativos de fondo o encabezado.
- La **minimalidad**: composiciones con mucho espacio en blanco, elementos flotantes, sin marcos rígidos.

---

## PASO 2 — INSTALACIÓN DE SKILLS Y HERRAMIENTAS

Antes de comenzar el rediseño, ejecuta el siguiente script para verificar e instalar las skills necesarias en el workspace:

```bash
# Verificar skills disponibles
ls ~/skills/

# Instalar skills adicionales si el archivo skills.sh existe
if [ -f skills.sh ]; then
  bash skills.sh
fi

# Instalar dependencias de optimización si no están presentes
npm list | grep -E "sharp|next-optimized-images|vite-plugin" || npm install --save-dev
```

Si el proyecto usa **Vite + React**, asegúrate de tener instalados:
- `vite-plugin-imagemin` o `@vite-pwa/assets-generator` para optimización de assets.
- `tailwindcss` con configuración de purge activada.
- `framer-motion` o `@react-spring/web` para animaciones fluidas (sin stuttering).

---

## PASO 3 — SISTEMA DE DISEÑO A IMPLEMENTAR

### 3.1 Paleta de Colores

Implementa las siguientes variables CSS como tokens de diseño en `:root`:

```css
:root {
  /* Colores Corporativos Nishi Nihongo Gakko */
  --color-nishi-teal:        #3d8b83;  /* Teal principal del logo */
  --color-nishi-brown:       #9e4a2e;  /* Marrón de la montaña del logo */

  /* Ukiyo-e Core Palette */
  --color-hiroshige-blue:    #1B4F72;  /* Azul Prussian / índigo profundo (para contraste con Teal) */
  --color-sky-bokashi:       #87CEEB;  /* Azul cielo degradado */
  --color-washi-cream:       #F5EDD6;  /* Fondo papel washi */
  --color-washi-warm:        #EDE0C4;  /* Fondo washi más cálido */
  --color-sumi-black:        #1A1008;  /* Negro tinta sumi */
  --color-vermillion:        #C0392B;  /* Rojo bermellón / sello hanko */
  --color-ochre:             #C9A84C;  /* Ocre / dorado envejecido */
  --color-moss-green:        #4A6741;  /* Verde musgo / pino */
  --color-indigo:            #2C3E7A;  /* Índigo / añil */
  --color-sepia:             #7B5E3A;  /* Sepia / madera */

  /* Sumi-e Accents */
  --color-ink-wash-light:    rgba(26, 16, 8, 0.08);
  --color-ink-wash-medium:   rgba(26, 16, 8, 0.25);
  --color-ink-wash-dark:     rgba(26, 16, 8, 0.65);
  --color-cinnabar:          #E74C3C;  /* Rojo cinabrio sello */
}
```

### 3.2 Tipografía

```css
/* Importar fuentes japonesas de Google Fonts */
@import url(\'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;700&family=Noto+Sans+JP:wght@300;400;500&display=swap\');

:root {
  --font-serif-jp:  \'Noto Serif JP\', \'Yu Mincho\', serif;
  --font-sans-jp:   \'Noto Sans JP\', \'Hiragino Kaku Gothic Pro\', sans-serif;
}

/* Títulos principales: serif japonés con peso ligero */
h1, h2, .card-title { font-family: var(--font-serif-jp); font-weight: 300; letter-spacing: 0.05em; }

/* Cuerpo y UI: sans-serif japonés */
body, button, input { font-family: var(--font-sans-jp); }
```

### 3.3 Fondos y Texturas

**Fondo principal de la app:**
- Usa `var(--color-washi-cream)` como base.
- Agrega una textura sutil de papel washi mediante un SVG de ruido o un patrón CSS de líneas finas diagonales.
- Implementa un degradado suave tipo *bokashi* (gradiente vertical de **Teal corporativo** a crema) en el header, integrando el color de la marca.

```css
.app-background {
  background-color: var(--color-washi-cream);
  background-image: 
    url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\'%3E%3Cpath d=\'M0 0h1v1H0zm2 2h1v1H2z\' fill=\'%23c9a84c\' fill-opacity=\'0.07\'/%3E%3C/svg%3E");
}

.header-bokashi {
  background: linear-gradient(
    to bottom,
    var(--color-nishi-teal) 0%,
    var(--color-sky-bokashi) 60%,
    var(--color-washi-cream) 100%
  );
}
```

### 3.4 Componentes de Carta (Memotest Cards)

Las cartas del memotest deben evocar las **cartelas de título** de los grabados ukiyo-e:

```css
.memo-card {
  background: var(--color-washi-warm);
  border: 2px solid var(--color-sumi-black);
  border-radius: 4px 4px 4px 12px; /* esquina inferior izquierda redondeada, estilo pergamino */
  box-shadow: 
    3px 3px 0 var(--color-sumi-black),   /* sombra tipo woodblock */
    inset 0 0 0 1px var(--color-ochre);  /* borde interior dorado */
  position: relative;
  overflow: hidden;
}

/* Marca de agua de kanji decorativo en el reverso de la carta */
.memo-card-back::before {
  content: attr(data-kanji-bg);
  position: absolute;
  font-size: 5rem;
  font-family: var(--font-serif-jp);
  color: var(--color-ink-wash-light);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  pointer-events: none;
  user-select: none;
}

/* Sello rojo (hanko) decorativo en esquina */
.memo-card::after {
  content: \'西\';
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  background: var(--color-vermillion);
  color: white;
  font-family: var(--font-serif-jp);
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}
```

### 3.5 Elementos Decorativos de Fondo

Agrega elementos SVG decorativos que evoquen el estilo ukiyo-e sin interferir con la jugabilidad:

- **Patrón seigaiha** (escamas de ola) como borde inferior o header, utilizando el `color-nishi-teal`.
- **Rama de cerezo o pino** en SVG, posicionada en esquina superior derecha, con `opacity: 0.12` y `pointer-events: none`.
- **Líneas de ola** estilo Hokusai como separadores de sección.

```css
/* Borde decorativo con patrón asanoha (cáñamo) */
.section-divider {
  height: 16px;
  background-image: url("data:image/svg+xml, /* SVG de patrón asanoha aquí */ ");
  opacity: 0.3;
}

/* Ejemplo de uso del color corporativo en un elemento decorativo */
.seigaiha-pattern {
  background-color: var(--color-nishi-teal);
  /* ... otros estilos para el patrón ... */
}
```

---

## PASO 4 — IDENTIDAD DE NISHI NIHONGO GAKKO (INTOCABLE)

> **RESTRICCIÓN CRÍTICA:** Los siguientes elementos NO deben modificarse bajo ninguna circunstancia:

| Elemento | Acción requerida |
|---|---|
| Logo de Nishi Nihongo Gakko | Conservar exactamente, sin filtros ni transformaciones |
| Favicon | Conservar exactamente |
| Nombre "Nishi Nihongo Gakko" / "西日本語学校" | Conservar en todos los textos donde aparezca |
| Colores corporativos del logo | No sobreescribir; el logo debe verse sobre fondos compatibles |
| Fuentes del logo (si son imágenes) | No alterar |

El logo debe colocarse sobre fondos de color `var(--color-washi-cream)` o `var(--color-nishi-teal)` para garantizar contraste y legibilidad. Si el logo tiene fondo transparente, asegúrate de que el fondo detrás sea compatible.

---

## PASO 5 — RESPONSIVIDAD (PC y MÓVIL)

### Breakpoints

```css
/* Sistema de breakpoints */
--bp-mobile:  480px;
--bp-tablet:  768px;
--bp-desktop: 1024px;
--bp-wide:    1280px;
```

### Grid de Cartas Adaptativo

```css
.cards-grid {
  display: grid;
  gap: clamp(8px, 2vw, 16px);
  padding: clamp(12px, 3vw, 24px);
}

/* Móvil: 3 columnas */
@media (max-width: 480px) {
  .cards-grid { grid-template-columns: repeat(3, 1fr); }
  .memo-card  { aspect-ratio: 3/4; font-size: clamp(1.2rem, 5vw, 1.8rem); }
}

/* Tablet: 4 columnas */
@media (min-width: 481px) and (max-width: 768px) {
  .cards-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Desktop: 5–6 columnas */
@media (min-width: 769px) {
  .cards-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
}
```

### Touch Targets (Móvil)

Todos los elementos interactivos deben tener un área mínima de toque de **44×44px** en móvil:

```css
@media (max-width: 768px) {
  button, .memo-card, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## PASO 6 — OPTIMIZACIÓN DE RENDIMIENTO (SIN LAG NI STUTTERING)

### 6.1 Animaciones de Volteo de Cartas

Usa **exclusivamente transformaciones CSS** para las animaciones. Nunca animes `width`, `height`, `top`, `left` o `opacity` en el bucle de juego:

```css
.memo-card {
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform; /* Activa GPU compositing */
}

.memo-card.flipped {
  transform: rotateY(180deg);
}

.memo-card-front,
.memo-card-back {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
```

### 6.2 Reducir Repaints

```css
/* Aislar capas de composición para elementos animados */
.memo-card,
.decorative-branch,
.header-bokashi {
  isolation: isolate;
  contain: layout style paint;
}
```

### 6.3 Lazy Loading de Assets

```jsx
// En React: cargar imágenes decorativas de forma diferida
const DecorativeBranch = React.lazy(() => import(\'./DecorativeBranch\'));

// Usar Suspense con fallback vacío para no bloquear el render
<Suspense fallback={null}>
  <DecorativeBranch />
</Suspense>
```

### 6.4 Optimización de Fuentes

```html
<!-- En index.html: preconectar y precargar fuentes críticas -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400&family=Noto+Sans+JP:wght@400;500&display=swap">
```

### 6.5 Vite Config (si aplica)

```js
// vite.config.js — optimizaciones de build
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          \'vendor-react\': [\'react\', \'react-dom\'],
          \'vendor-motion\': [\'framer-motion\'],
        }
      }
    },
    cssCodeSplit: true,
    minify: \'esbuild\',
  },
  optimizeDeps: {
    include: [\'react\', \'react-dom\'],
  }
}
```

---

## PASO 7 — PRUEBAS DE RESPONSIVIDAD Y RENDIMIENTO

Después de implementar el rediseño, ejecuta las siguientes pruebas:

### 7.1 Pruebas Visuales

```bash
# Abrir en navegador y probar en estos viewports:
# - 375×667  (iPhone SE)
# - 390×844  (iPhone 14)
# - 768×1024 (iPad)
# - 1280×800 (laptop)
# - 1920×1080 (desktop)
```

Verifica en cada viewport:
- [ ] El logo de Nishi se ve correctamente y sin distorsión.
- [ ] Las cartas del memotest son tocables y tienen tamaño adecuado.
- [ ] El texto katakana en las cartas es legible.
- [ ] Los elementos decorativos no tapan el contenido jugable.
- [ ] El header bokashi se ve bien en todos los tamaños.
- [ ] No hay scroll horizontal indeseado.

### 7.2 Pruebas de Rendimiento

Abre las DevTools del navegador (F12) y verifica:

```
Performance tab:
- FPS durante volteo de cartas: debe ser ≥ 60fps
- No debe haber "Layout Thrashing" (recálculos de layout en cada frame)
- Las animaciones deben aparecer en la capa "Compositor" (verde), no en "Main Thread" (amarillo)

Lighthouse:
- Performance score: ≥ 85
- First Contentful Paint: < 1.5s
- Total Blocking Time: < 200ms
```

### 7.3 Correcciones Comunes

Si hay lag o stuttering:
1. Verificar que `will-change: transform` está aplicado a las cartas.
2. Verificar que no hay `box-shadow` animado (reemplazar por `filter: drop-shadow` o usar pseudo-elemento).
3. Reducir el número de elementos con `backdrop-filter` activos simultáneamente.
4. Asegurarse de que las imágenes decorativas de fondo usan `loading="lazy"`.

---

## PASO 8 — ENTREGABLES ESPERADOS

Al finalizar el rediseño, debes proporcionar:

1. **Todos los archivos CSS/SCSS modificados** con los nuevos tokens de diseño.
2. **Componentes React actualizados** con las nuevas clases y estructura.
3. **Capturas de pantalla** del resultado en móvil (375px) y desktop (1280px).
4. **Reporte de Lighthouse** o métricas de rendimiento.
5. **Confirmación explícita** de que el logo, favicon y nombre de Nishi Nihongo Gakko están intactos.

---

## NOTAS FINALES PARA EL AGENTE

- El estilo debe sentirse **auténticamente japonés clásico**, no un pastiche superficial. Cada decisión de diseño debe poder justificarse en referencia a las fuentes visuales proporcionadas.
- La **jugabilidad es prioritaria**: ningún elemento decorativo debe dificultar la interacción con las cartas.
- Usa **CSS custom properties** para todos los valores de diseño, facilitando futuras actualizaciones.
- Si el proyecto usa **Tailwind CSS**, extiende la configuración en `tailwind.config.js` con los tokens de color y tipografía definidos arriba, en lugar de escribir CSS inline.
- Documenta brevemente cada decisión de diseño en comentarios CSS con el formato `/* [ukiyo-e] ... */` o `/* [sumi-e] ... */`.

---

*Prompt generado por Manus AI para el proyecto nishi-katakana-memotest2 — Nishi Nihongo Gakko*
