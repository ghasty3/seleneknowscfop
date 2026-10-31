# Selene knows CFOP

Página web — **Selene knows CFOP** — para aprender el método **CFOP** (Cross → F2L → OLL → PLL)
de forma intuitiva.

La pieza central: encima de cada algoritmo hay un **cubo 3D funcional que lo ejecuta movimiento a
movimiento**, empezando desde el propio plantado del caso, de modo que el algoritmo termina con el
cubo resuelto.

- Especificación completa (requisitos RF-1..RF-12, decisiones técnicas, fases): **[project.md](./project.md)**
- Fuentes y transcripciones en bruto (imágenes, tablas, enlaces): **[docs/fuentes.md](./docs/fuentes.md)**
- Revisión medida del repo y contenido de los PDF (2026-10-31): **[docs/REVISION-2026-10-31.md](./docs/REVISION-2026-10-31.md)**
- Registro de instrucciones de la persona con su referencia de mensaje: **[instructionsIRIS.md](./instructionsIRIS.md)**

## Estado actual (medido el 2026-10-31)

Compila (`npm run typecheck` limpio) y construye (`npm run build`). Las 11 páginas existen y se
navegan. El trabajo en curso es la **Fase 0 del motor**: la convención de matrices y la rotación de
centros, de la que depende la vista canónica (RF-2 y la instrucción de "amarillo arriba").

| Comprobación | Resultado |
|---|---|
| `npm run typecheck` | verde |
| `npm run build` | verde (`dist/`) |
| `npm run verify` | **111 fichas, 0 fallos duros** · 73 pasan todo · 38 avisos de prerequisito |
| `npm run verify:wca` (gate de la lámina WCA) | **rojo hoy por diseño**: 0 de 48 plantados OLL con F2L resuelto (deberían ser 48) |
| `.github/workflows/deploy.yml` (RF-12) | no existe todavía |
| Tests unitarios | no hay fichero de tests del motor; la verificación son los `scripts/` |

### Lo que está construido

| Pieza | Estado |
|---|---|
| Motor cúbico (`src/cube/engine.ts`) | ✅ `MOVE_SPECS` autoritativa, `parseAlg`, `applyMove`, `isSolved`, `caseState`, `scramble`; en curso: giros de 1/2/3 vueltas en un solo paso y sentido de `x`/`y`/`z` |
| Utilidades de caso (`src/cube/caseUtils.ts`) | ✅ estado F2L, cruz, patrón de OLL/PLL, `uCell`, `applySetup`, `frameMatrix`; en curso: `upFrame` y `canonicalByFrame` miden contra el marco de los centros |
| Almacén de progreso (`src/store/progress.ts`) | ✅ niveles 0/33/66/100, watchlist, tiempos, mejores permutaciones, `localStorage` |
| Cubo 3D (`src/components/Cube3D.tsx`) | ✅ proyección isométrica, colores por cara, pegatinas interactivas |
| Cubo manipulable (`src/components/InteractiveCube.tsx`) | ✅ arrastrar una pegatina gira su capa, clic = cara entera, arrastrar el fondo gira la vista, teclado `R U F B L D`, deshacer, plantar/remover, play-along, modo cruces |
| Reproductor de algoritmo (`src/components/AlgoPlayer.tsx`) | ✅ animación movimiento a movimiento, velocidad, bucle, paso a paso, fase de preparación |
| Diagrama 2D del caso (`src/components/CaseDiagram.tsx`) | ✅ redes planas con marcadores |
| Notación interactiva (`src/pages/Notation.tsx`) | ✅ símbolos que animan su movimiento + leyenda de dedos |
| Páginas (`src/pages/`) | ✅ `Home`, `Method`, `Notation`, `StagePage`, `CaseDetail`, `Practice`, `Trainer`, `Algs`, `Reference`, `Mirror`, `Clock`, `Times` |
| Datos (`src/data/`) | ✅ `cross.ts` 6, `f2l.ts` 21, `oll.ts` 53, `pll.ts` 21, `look2.ts` 5, `pll.gan.ts` 17 |
| Verificación (`scripts/verify.mts`) | ✅ ejecuta cada algoritmo publicado sobre su plantado dentro del motor |
| Práctica guiada (`src/pages/Practice.tsx`) | ✅ cubo libre / play-along / solo cruces, cronómetro, registro de tiempos |

### Rutas de la web

`#/` inicio · `#/metodo` · `#/notacion` · `#/cross` · `#/f2l` · `#/oll` · `#/pll` (lista de casos) ·
`#/oll/31` ficha de un caso · `#/practicar` · `#/entrenar` (cronómetro) · `#/algs` (mi watchlist) ·
`#/tablas` (espejos y reloj)

## Arranque

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc -b
npm run verify     # comprueba las 111 fichas en el motor
npm run verify:wca # gate de la lámina oficial de OLL (rojo hasta cerrar la Fase 0)
npm test           # typecheck + verify + verify:wca
npm run build      # dist/ (publicable en GitHub Pages)
```

`NODE_ENV` no puede estar en `production` al instalar dependencias (Vite requiere `esbuild`).

## Verificación

`npm run verify` (`scripts/verify.mts`) separa dos niveles:

- **Obligatorios** (fallan): cada algoritmo publicado cierra su plantado
  (`plantado + alg = cubo resuelto`), ningún plantado es trivial, y los grupos de OLL cumplen lo que
  prometen. Hoy: **0 fallos en 111 fichas** (Cross 6, F2L 21, OLL 53, PLL 21, 1-look 2, PLL de reloj 8).
- **Avisos de prerequisito**: 38 fichas avisan (se listan con `npm run verify -- --verbose`). Son
  investigación abierta, no datos malos:
  1. Algoritmos PLL que mueven piezas fuera de la última capa en cualquier conjugación por
     `x`/`y`/`z` (20 fichas). La permutación declarada y el cierre del plantado sí cuadran.
  2. Fichas F2L cuyo plantado, según el heurístico de patrón, no encaja con la descripción literal
     del hueco/par (9 fichas).

`npm run verify:wca` (`scripts/check-wca-oll.mts`) es el **gate duro de la Fase 0** sobre la lámina
oficial de OLL (ver *Fuentes*). Comprueba tres cosas sobre los 57 casos / 128 algoritmos:

1. El parser del motor entiende toda la notación de la lámina (`r`, `M`, `S`, `x`, `y`, `R2'`, `U2'`).
   Hoy: **0 fallos**.
2. `plantado + alg = cubo resuelto` en el plantado `inverse(alg)`. Hoy: **128 de 128**.
3. Los 48 algoritmos que no rotan el cubo dejan las **dos primeras capas resueltas** en su plantado
   (es matemáticamente forzoso). Hoy: **0 de 48** → el gate está en rojo y ahí está el defecto a cerrar.

Herramientas: `scripts/verify.mts`, `scripts/check-wca-oll.mts`, `scripts/contrast.mts`,
`scripts/build-cases.mts`, `scripts/extract-wca-oll.mjs`, `scripts/fixtures/{cubzor-oll,cubzor-pll,wca-oll}.json`.

## Fuentes de los datos

**La lámina oficial de OLL es la fuente autoritativa de OLL** (decisión de 2026-10-31): es
`oll-algorithms.pdf`, «OLL Algorithms, Developed by Feliks Zemdegs and Andy Klise», la referencia
canónica de la WCA. Está en el repo, es multi-columna (el texto plano no da orden legible) y se
extrae con `scripts/extract-wca-oll.mjs` → `scripts/fixtures/wca-oll.json`: **57 casos, 128
algoritmos, 0 faltan, 29 con alternativos, con probabilidad 1/x** y numeración WCA 1..57. La
numeración GANCUBE 01..57 coincide con la WCA.

| PDF del repo | Qué es | Extracto |
|---|---|---|
| `oll-algorithms.pdf` | Lámina oficial WCA de OLL 57 (fuente autoritativa) | `scripts/fixtures/wca-oll.json`, `docs/pdf-text/oll-algorithms.txt` |
| `gancube-3x3-cfop-tutorial.pdf` | Láminas GANCUBE: notación con dedos, F2L 01-18, OLL 01-57, PLL 01-21. Fuente de las transcripciones de `docs/fuentes.md` | `docs/pdf/gancube-page1.png`, teselas legibles `docs/pdf/gancube-tiles/` |
| `Cube+Academy+Free+F2L.pdf` | Guía *Intuitive F2L* (CubeHead Comm.V): 41 casos con hueco objetivo y setup | **No se usa**: licencia de uso personal solo |

Licencias y material de terceros (decidido el 2026-10-31):

- El sitio es **privado** (repo privado, GitHub Pages accesible solo para la persona).
- Los **105 PNG de GANCUBE** (`public/ref/{oll,pll,notation}`) y las imágenes de casos son material de
  marca tercera: se **sustituirán por diagramas SVG propios** generados con la convención del motor.
- La guía de F2L de Cube Academy **no se usa** («licensed for personal use only»). El F2L se construye
  con GANCUBE, speedcube.quest y el motor.
- Los tres PDF están en el repo **sin commitear**: solo se versionan los extractos y transcripciones.

## Camino restante

El plan de fases está en `project.md` §13/§14. Resumen:

0. **Fase 0 (en curso)**: arreglar la convención de matrices y la rotación de centros para que el cubo
   se vea con la última capa arriba al rotar la vista. Gate: `npm run verify:wca` en verde.
1. **F2L** (RF-5, RF-9): cerrar los 9 casos cuyo plantado no encaja con la descripción del hueco/par,
   con modelo de hueco + setup explícito.
2. **OLL** (RF-6): pasar de 53 a los 57 casos de la lámina, con algoritmo sugerido + alternativos +
   probabilidad.
3. **PLL** (RF-7): watchlist y verificación de las 21 permutaciones.
4. **Guía F2L intuitiva** (RF-9) con diagramas propios.
5. Fingertricks, cronómetro y ranking (RF-10, RF-11).
6. Diseño según la crítica de `.impeccable/critique/` (26/40, 1 P0) y `DESIGN.md` por crear.
7. **GitHub Pages** (RF-12): `deploy.yml`, base `/selene-knows-cfop/`, Node 22.

## Estilo y decisiones

- Modo oscuro minimalista con acentos morados oscuros (`src/styles/global.css`, variables `--bg`,
  `--accent`, `--accent-strong`).
- React 18 + Vite 5 + TypeScript, sin backend. El progreso y los tiempos se guardan en `localStorage`
  del navegador de cada persona: no hay sincronización entre dispositivos.
- **Idioma del proyecto: castellano.** El gallego no se usa en la interfaz, en el README ni en los
  comentarios del código. La notación de cubos (`R U R' U'`, `x`, `M`) tampoco se traduce.
  *(Corregido tras la indicación de la persona: la primera versión se escribió en gallego sin que
  nadie la pidiera.)*

## Comprobaciones abiertas del motor

Dos limitaciones de `src/cube/engine.ts` están abiertas y explican la mayoría de avisos:

1. **Las rotaciones de cubo completo (`x`, `y`, `z`) no giran los centros.** `applyMove` solo mueve
   aristas y esquinas; los 48 facelets de centro (`CubeState.centers`) son estáticos y `isSolved`
   exige además `c.rot[0] === 1`. Por eso no se puede presentar un plantado en el marco canónico
   (última capa arriba) de forma fiel: `canonicalView()` / `canonicalizeState()` en
   `src/cube/caseUtils.ts` prueban las 24 rotaciones, se auto-comprueban con `isSolved` y **caen
   siempre al plantado crudo**, que es lo que muestra la ficha.
2. **Convención de ciclos de cara en revisión.** Los prerequisitos canónicos (capa orientada,
   permutación que solo toca la última capa) no dan verde en 38 fichas, mientras la permutación
   declarada y el cierre del plantado sí cuadran en las 111. El diagnóstico medido: en los plantados
   de la lámina oficial `f2lSolved()` da verde 0 de 48 veces, cuando debería darlo siempre.

El work in progress del arreglo está en `src/cube/engine.ts` y `src/cube/caseUtils.ts` (giros de 1/2/3
vueltas en un solo paso, sentido de `x`/`y`/`z`, `upFrame`, `canonicalByFrame`).
