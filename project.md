# project.md — Selene knows CFOP

> Documento de especificación e implementación. Es la fuente de verdad del proyecto.
> Se actualiza en cada conversación: al final hay una sección **Estado** con lo que ya existe en el repo.
> Idioma del producto: español. Idioma del código: inglés (identificadores), comentarios en español.
> El gallego **no** está autorizado en ningún sitio del proyecto (indicación de la persona, 2026-07-30:
> la primera versión del README y de varios comentarios salió en gallego sin que nadie lo pidiera).

---

## 1. Objetivo

Página web propia y completa para **aprender el método CFOP de forma intuitiva**.

**Objetivo final declarado por la persona:** subirlo a **GitHub** (repo + GitHub Pages) para que lo usen
él y sus amigos → el build debe ser 100 % estático, sin backend, sin cuentas, sin login. Todo el
progreso se guarda en `localStorage` del navegador de cada persona.

Solicitud original (m00001, parafraseada): crear un proyecto de página web propia completa para aprender
el método CFOP de forma intuitiva, con los recursos que la persona va pasando (algoritmos) y las
características que va pidiendo, poco a poco.

---

## 2. Requisitos funcionales

Numerados para poder referirlos en futuras conversaciones. Todos pedidos explícitamente por la persona.

### RF-1 · Cubo 3D funcional encima del algoritmo (la pieza estrella)

La persona (m00009, parafraseada): _"como característica más llamativa, que encima del algoritmo que
estás intentando aprender haya un cubo 3D funcional haciendo los movimientos del algoritmo para
mostrártelo"_.

- En la ficha de cada algoritmo, **el cubo 3D va arriba y la notación debajo**.
- El cubo ejecuta el algoritmo **movimiento a movimiento**, con animación de giro real (no saltos de estado).
- Debe ser **funcional**: estado cúbico real, no una secuencia de imágenes precalculadas.
- Al terminar el algoritmo el cubo queda **resuelto** → refuerzo visual del efecto del algoritmo (ver RF-2).
- Controles: reproducir/pausar, paso adelante/atrás, velocidad, bucle, ir al caso, ver desde el cubo
  resuelto, invertir, espejo.
- Interacción: órbita (arrastrar para girar la cámara), zoom, y girar caras arrastrando sobre el cubo.

**Defectos abiertos pedidos por la persona (m01978, parafraseada):** _"se debe poder rotar visualmente el
cubo en el visualizador, al girar una cara oculta al inicio, las piezas nuevas no tienen color"_. Dos
cosas: (1) que se pueda girar la vista/orientar el cubo en el visor, y (2) que al mover una cara que
estaba oculta las piezas que aparecen salgan **con color** (hoy salen sin color). El punto 2 tiene su
caída en el motor: `faceletHome()` (`src/cube/engine.ts:310`) devuelve `''` cuando la matriz `rot` de la
pieza no alinea ninguno de sus ejes con la dirección de la cara, así que el visor pinta esa pegatina sin
color. Es la misma raíz que el defecto de lógica del cubo de m01739.

### RF-2 · Reproducir el algoritmo desde su caso

Consecuencia técnica de RF-1: para que el cubo "muestre" el caso, el estado inicial tiene que ser el
estado del caso.
**Decisión de diseño:** `estadoDelCaso = aplicar inverso(algoritmo) al cubo resuelto`.
Es matemáticamente garantizado: si `algoritmo(estadoCaso) = resuelto`, entonces
`estadoCaso = inverso(algoritmo)(resuelto)`. Válido para Cross, F2L, OLL y PLL, y para cualquier
algoritmo (incluidas variantes y algoritmos con setup).
Fases visibles en el reproductor:

1. **Preparación** (opcional, lenta y atenuada): cubo resuelto → `inverso(algoritmo)` → estado del caso.
2. **Algoritmo**: estado del caso → cubo resuelto. Esta es la parte que se estudia.
3. Botón **"Ver caso"**: salta directamente a la fase 2 (cubo plantado en el caso, listo para ejecutar).

### RF-3 · Notación interactiva

Recurso (m00036): tabla de notación de GANCUBE con `R r L l U u D d F f B b S M E R2 R' R'2 x y z` y la
leyenda de dedos:

- **Letra en mayúscula** = giro 90° horario. **Letra en minúscula** = gira 2 capas. **Apostrofo** =
  antihorario. **2** = 180°.
- **Azul** = índice izquierdo · **Rojo** = pulgar derecho · **Naranja** = medio/anular/meñique.
  Implementación: cada símbolo es una tarjeta clicable que **anima ese movimiento en un cubo 3D** (mismo
  motor que RF-1), con la flecha de eje y el color del dedo. Explicación del eje y de la capa afectada en
  texto.

### RF-4 · Secciones del método (estructura de la guía de GANCUBE)

Estructura extraída de la página de GANCUBE: **Notación → Cross → F2L → OLL → PLL**, con la definición:
CFOP = Cross, F2L (primeras dos capas), OLL (orientar última capa), PLL (permutar última capa). Incluye
los consejos ("tips") de la guía, p. ej. _"si la arista blanca ya está en su posición objetivo, gira la
cara superior para crear hueco"_.

### RF-5 · F2L: los 21 casos de la tabla

Recurso: imagen con los 21 casos y sus algoritmos (transcritos en `docs/fuentes.md`, sección F2L).
Nombres y números: `01 Ua, 02 Ub, 03 H, 04 Z, 05 Aa, 06 Ab, 07 E, 08 T, 09 F, 10 V, 11 Y, 12 Ja, 13 Jb,
14 Rb, 15 Ra, 16 Gc, 17 Gd, 18 Ga, 19 Gb, 20 Nb, 21 Na`.

- Cada caso: diagrama de la vista superior + algoritmo(s) + cubo 3D (RF-1).
- Grupo pedagógico "intuitivo" tomado de speedcube.quest (RF-9).

### RF-6 · OLL 57 casos y clasificación 2-Look

Recurso (m00030): imagen con los 57 OLL de GANCUBE. Solicitud (m00030, parafraseada): **separar los OLL
en los que se pueden resolver con 2-Look OLL (cruz amarilla)**, y **añadir los 57 al final**.
Traducción a requisitos:

- Grupo A **"2-Look"** = los casos que se resuelven con el método de dos miradas: **paso 1** cruz
  amarilla (3 patrones: punto, "L"/90°, barra/180° con `F R U R' U' F'` y sus variantes) + **paso 2**
  orientar esquinas (`R U R' U' R U' R'` Sune / Antisune y setups).
- Criterio técnico exacto para clasificar (calculable desde el estado, no a mano):
  - Patrón de **vuelos de aristas de la U**: `n` = nº de aristas de la U sin orientar. `n=0` → cruz hecha;
    `n=2` adyacentes → "L"; `n=2` opuestas → barra; `n=4` → punto. **Cualquier OLL con `n>0` necesita el
    paso de cruz** → entra en el grupo 2-Look con su patrón de cruz conocido.
  - Patrón de **giros de esquinas de la U** (triple suma módulo 3 de las esquinas mal orientadas =
    invariante): después de la cruz, el estado de esquinas es resoluble con Sune / Antisune / doble-Sune →
    cubre **los 57 casos**. Por eso el grupo "2-Look" es el camino de aprendizaje inicial y el grupo
    "caso único" (algoritmo directo) es la capa avanzada.
- UI: filtro/pestañas **"2-Look (empezar aquí)"** / **"Todos los 57"**; cada OLL muestra en qué
  sub-patrón cae (punto / L / barra / cruz hecha) calculado desde su estado.
- Orden de aprendizaje: primero los 3 de cruz + Sune/Antisune, luego los casos directos.

### RF-7 · Watchlist de algoritmos en aprendizaje

Recurso (m00064, parafraseada): apartado donde marcar ciertos algoritmos como **"watchlist"** de los que
estás aprendiendo actualmente.

- Star/chincheta en cada ficha; vista dedicada **"Watchlist"** con solo los marcados, ordenable por etapa
  y por tiempo.
- Contador en la navegación (nº de algoritmos en watchlist).

### RF-8 · Barra de progreso por algoritmo con 3 niveles elegidos por la persona

Recurso (m00064): barra de "ya aprendidos", elegida **libremente por la persona**, con **3 barras**:

- **33 %** → ya lo tiene aprendido.
- **66 %** → ya puede hacer el algoritmo con soltura, de forma automática.
- **100 %** → sabe todos los fingertricks.
  Implementación: control segmentado de 3 tramos (más estado "sin empezar" = 0). Al tocar un tramo se
  guarda el nivel. Tooltips con las etiquetas de `LEVEL_LABEL`/`LEVEL_HINT` en `src/store/progress.ts`.
- Barras agregadas por etapa (Cross / F2L / OLL / PLL) y globales: media de niveles y nº de casos por
  nivel, en la portada y en cada etapa.

### RF-9 · Guía F2L intuitiva (contenido pedagógico)

Recurso (m00064, mensaje con enlace): `https://speedcube.quest/guides/beginner-f2l`. Sección propia con
el enfoque de la guía (extraído, en `docs/fuentes.md`):

- F2L = introducir par esquina+arista a la vez, 4 pares.
- **Las dos inserciones básicas** (base de la intuición, sin memorizar cadenas):
  - Par emparejado (colores de la U coinciden): `U R U' R'` y su espejo `U' L' U L`.
  - Par separado (colores de la U difieren, la arista a un paso de la esquina): `R U R'` y espejo `L' U' L`.
  - Explicación en 4 pasos: apartar el par del hueco → abrir el hueco → meter el par en el hueco abierto
    → cerrar el hueco.
- Secciones: _Qué es F2L_ · _Inserciones básicas_ · _Preparar el par_ · _Sacar una pieza del hueco_ ·
  _Piezas separadas arriba (mismo color / colores distintos / blanco arriba)_ · _Piezas mal unidas arriba
  (split)_ · _Resolución completa guiada_ (cada par se resuelve con el hueco frontal-derecha, rotando el cubo).
- Idea clave a transmitir: **no memorizar algoritmos como cadenas**, leer la descripción y entender el concepto.

### RF-10 · Cronómetro por algoritmo

Recurso (m00069, parafraseada): temporizador básico **debajo de cada algoritmo** para cronometrarse al
ejecutarlo y ver progreso.

- Debajo del cubo 3D: Start/Stop (tecla **Espacio**), lectura grande `segundos.centésimas`, auto-reset
  tras grabar, botón borrar.
- Al parar se **registra** el tiempo en el almacén del caso (lista de tiempos + mejor + media + nº de intentos).
- Inspección opcional (15 s) en fase posterior.
- Debajo de la lectura: mejor tiempo, media de los últimos 5, nº de intentos, y mini-histograma de los
  últimos tiempos.

### RF-11 · Apartado "Tus mejores permutaciones"

Recurso (m00069): apartado separado con **tus mejores permutaciones ordenadas de menor a mayor tiempo**.

- Vista **"Ranking"**: todas las permutaciones/algoritmos con tiempo registrado, **ordenadas por mejor
  tiempo de menor a mayor**.
- Columnas: puesto, nombre (etapa + código, p. ej. `F2L 05 · Aa`), mejor tiempo, media, nº de intentos,
  nivel de aprendizaje (RF-8), en watchlist.
- Filtros por etapa; vaciar ranking con confirmación; orden alternativo por media.
- Términos en español para el usuario: "mejores permutaciones", "mejor tiempo", "media", "intentos".

### RF-12 · Publicación en GitHub

- Repositorio git con `README.md` + `project.md`.
- **GitHub Pages** con GitHub Actions (build → desplegar `dist/`).
- **Requisito técnico:** `vite.config.ts` debe fijar `base` según la ruta del repo (`/NOMBRE/`), vía
  variable de entorno, para que los assets funcionen en Pages.

---

## 3. Estilo (requisito visual)

La persona (m00001, parafraseada): **estilo minimalista en modo oscuro con acentos morados oscuros**.

Tokens propuestos (`src/styles/global.css`):

```
--bg: #0a0810        /* fondo principal, casi negro con tinte violeta */
--bg-2: #120e1c      /* degradado superior */
--surface: #171223   /* tarjetas */
--surface-2: #1d1729 /* hover / chips activos */
--line: rgba(147,112,219,.14)
--text: #e8e4f2
--muted: #9a92ae
--accent: #7c4dff         /* morado de acento */
--accent-strong: #9a6bff
--accent-dim: #4a2f7a
--good: #34b27a  --warn: #e9a24b  --bad: #de4a44
```

- Tipografía: Inter/`system-ui` para texto; `ui-monospace`/JetBrains Mono para **algoritmos** (los
  símbolos de giro se leen mejor en monoespaciada).
- Minimalismo: poco texto por pantalla, mucho aire, bordes de 1 px, sin sombras gordas, sin emojis
  decorativos, una sola cosa destacada por pantalla (el cubo).
- Los colores del cubo mantienen la convención clásica (necesaria para aprender): U blanco, D negro,
  F verde, B azul, R rojo/naranja, L ámbar. El morado se usa solo en acentos de interfaz.
- Responsive: móvil primero en ancho; en móvil el cubo ~55 % de la pantalla y la notación debajo;
  controles táctiles grandes.
- Accesibilidad: foco visible, `prefers-reduced-motion` → animación por pasos sin giro continuo,
  contraste AA en texto, `aria-label` en los controles del cubo.

---

## 4. Stack técnico y decisiones

| Elección          | Decisión                                                                                                                      | Motivo                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Build             | **Vite 5 + React 18 + TypeScript**                                                                                            | estático para Pages, HMR rápido, sin backend                                                                               |
| 3D                | **three.js + @react-three/fiber 8** (+ @react-three/drei para `OrbitControls`)                                                | control imperativo del cubo, animación por frame                                                                           |
| Enrutado          | navegación propia con estado (`useState` + hash `#/f2l/05`)                                                                   | evitar dependencia extra; URLs compartibles con amigos                                                                     |
| Estado            | **`localStorage` + `useSyncExternalStore`** (módulo singleton)                                                                | sin backend, sin librerías de estado; persistencia inmediata                                                               |
| Diagramas         | **SVG generados desde el estado cúbico** (no imágenes de GANCUBE)                                                             | evita dependencias de imágenes externas, siempre coherente con el 3D, escalable a cualquier caso                           |
| Algoritmos        | **tablas transcritas de las imágenes + verificación/generación por BFS** (ver §7)                                             | las transcripciones de imagen son propensas a error; el solver garantiza que el algoritmo mostrado **sí** resuelve el caso |
| Idioma UI         | español                                                                                                                       | la persona y sus amigos son hispanohablantes                                                                               |
| Versiones fijadas | react 18.3, @react-three/fiber ^8.17, three ^0.171, @react-three/drei ^9.117, vite ^5.4, typescript ^5.6, tsx ^4.19 (scripts) | compatibilidad React 18 ↔ fiber 8                                                                                          |

Versiones incompatibles a evitar: @react-three/fiber v9 requiere React 19. No mezclar.

---

## 5. Estructura de archivos

```
index.html                     # lang="es", theme-color #0a0810
vite.config.ts                 # plugins + server + base (para Pages)
tsconfig.json
package.json                   # scripts: dev, build, preview, typecheck, verify, test
.github/workflows/deploy.yml   # build → pages
project.md                     # este documento
README.md                      # resumen + cómo arrancar + cómo publicar
docs/fuentes.md                # recursos, enlaces, transcripciones en bruto
public/gan/                    # imágenes oficiales de GANCUBE (láminas recortadas)
src/
  main.tsx  App.tsx            # navegación + layout
  styles/global.css
  cube/
    engine.ts        [EXISTE] # modelo de cubies, movimientos, parser, inverso, scramble, facelets
    caseUtils.ts     [EXISTE] # estado de caso, patrones OLL/PLL, vista canónica, estructura
    notationFacts.ts [EXISTE] # tabla de notación con dedos
  components/
    Cube3D.tsx  InteractiveCube.tsx  AlgoPlayer.tsx  CaseDiagram.tsx
    AlgorithmText.tsx  Timer.tsx  Controls.tsx (LevelBar, Star, StageProgress, SolveTrainer)
    Nav.tsx  Card.tsx
  pages/
    Home.tsx  Method.tsx  Notation.tsx  Cross.tsx  F2L.tsx  Oll.tsx  Pll.tsx
    CaseDetail.tsx  Reference.tsx  Trainer.tsx  Times.tsx  Clock.tsx  Mirror.tsx
    Practice.tsx  Algs.tsx
  data/
    types.ts  stages.ts  notation.ts  cross.ts  f2l.ts  oll.ts  pll.ts  oll.gan.ts  pll.gan.ts
scripts/
  verify.mts  build-cases.mts  oll-patterns.mts  pll-patterns.mts  contrast.mts  fixtures/
```

---

## 6. Motor cúbico (`src/cube/engine.ts`)

Modelo: **26 cubies** (sin núcleo), cada uno con `home` (posición resuelta), `pos` ∈ {-1,0,1}³ y `rot`
(matriz 3×3 de enteros). Los colores de pegatina son fijos por `home`; al girar se actualiza `pos` y
`rot` → los colores se mueven solos. Esto hace trivial el render 3D y los diagramas.

Coordenadas y signos (decisión clave, implementada):

- `x` = derecha (cara R), `y` = arriba (cara U), `z` = frente (cara F).
- Giro horario de una cara = **−90°** sobre su eje.
- Matrices: ver `mat()` en `src/cube/engine.ts:24` (rotX/rotY/rotZ a ±90°, enteros), derivadas de la
  convención "horario = −90°".
- Capas: R=[1], L=[-1], M=[0], r=[1,0], l=[-1,0], U=[1], D=[-1], E=[0], u=[1,0], d=[-1,0], F=[1],
  B=[-1], S=[0], f=[1,0], b=[-1,0], x/y/z = [-1,0,1].
- Direcciones base (`dir`): R,U,F = -1 · L,D,B = +1 · M=+1 (sigue a L) · E=+1 (sigue a D) · S=-1 (sigue
  a F) · x,y,z = -1.
- `MOVE_SPECS` es la tabla autoritativa: cualquier movimiento nuevo (p. ej. `Rw`, `f2`, setups de PLL) se
  añade ahí.
- Notación: minúscula = 2 capas, `'` = antihorario, `2` = 180° (que se **descompone en dos cuartos**, con
  flag `half`, así la animación de un `R2` se ve como dos giros, que es lo que hace una persona).
- API: `solvedState()`, `cloneState()`, `applyMove()`, `applyMoves()`, `isSolved()`, `parseAlg()`,
  `invertMoves()`, `caseState(alg)`, `faceletHome(state, face, row, col)`, `gridToPos()`, `topGrid()`,
  `frontGrid()`, `cubieIdentity()`, `scramble(len, seed)`, `frameMatrix()`.
- `scramble` evita repetición de la misma cara y de la cara +2 consecutivas; pool `R U L F B` + primos + `2`.

### 6.1 Estado real del motor (medido, no deseado)

Esto es lo que la persona ha señalado y lo que los scripts muestran hoy. **No hay que dar por bueno
ningún punto; son trabajo abierto.**

1. **Convención de matrices y colores de pegatina (abierto, el más grave).** `apply3(m, v)` multiplica
   `m` por componentes, es decir aplica la **transpuesta** de la matriz guardada, y `mul(a,b)` produce
   filas `a·fila(b)`. Con esa mezcla, la actualización de `rot` en `applyMove` (`c.rot = mul(M, c.rot)`,
   `src/cube/engine.ts:78`) no es compatible con la lectura que hace `faceletHome`
   (`apply3(c.rot, n)`, `src/cube/engine.ts:317`).
   Medido en `scripts/dbg-conventions.mts`: tras un escramble de 20 movimientos quedan **41 pegatinas sin
   color** con ambas reglas candidatas (`rot' = M·rot` y `rot' = Mᵀ·rot`), y la inversa del escramble
   **no devuelve** el cubo resuelto con la comprobación basada en centros. Sí cierran (por construcción)
   los 111 plantados de `npm run verify`, así que el daño se ve en el visor (piezas sin color,
   m01978) y en la comprobación de "resuelto" con rotaciones de cubo completo (m01739).
   Falta: fijar **una** convención de matriz (fila-major o columna-major) en todo el motor, derivar la
   actualización de `rot` de esa convención, y re-verificar identidades reales (`R L` + `R' L'`,
   escramble + inversa, `(R U R' U')×6`, `M2 U2 ×4`, `F R U R' U' F' ×4`, T-perm ×2).
2. **`isSolved` medida contra los centros (abierto, en curso).** Los centros son el marco físico: un cubo
   resuelto agarrado con `x`/`y`/`z` debe contar como resuelto. `frameMatrix()` (`src/cube/engine.ts:91`)
   ya lee el marco de los centros. La versión con marco del `isSolved` actual falla en 20 fichas
   (`look2`, PLL) porque la rotación de las piezas no se compone de forma compatible con el marco
   (punto 1). La versión anterior (posición + rotación identidad contra la identidad) sí daba verde en
   las 111, y no reconocía los estados girados.
3. **Vista canónica (en pausa).** `canonicalByFrame` / `canonicalView` / `canonicalizeState`
   (`src/cube/caseUtils.ts:317-505`) prueban las 24 rotaciones y se auto-comprueban; hoy la comprobación
   no pasa en los casos con setup escrito, así que `canonicalView` **cae siempre al plantado crudo** y la
   ficha muestra el plantado crudo. Interfaz: `CaseDetail`, `Trainer` y `StagePage` quedaron en plantado
   crudo (commit `ffcf3f4`).
4. **Avisos de prerequisito**: 38 fichas avisan en `npm run verify` (algoritmos PLL que, según el
   detector, mueven piezas fuera de la última capa; fichas F2L cuyo patrón no encaja con la descripción
   del hueco). Son la señal del punto 1, no datos malos.

**Pruebas que hay que mantener** (`scripts/verify.mts`, con `tsx`):

1. `(R U R' U')` × 6 = resuelto (sexy move).
2. `M2 U2 M2 U2 M2 U2 M2` (caso H) = resuelto.
3. `F R U R' U' F'` × 4 = resuelto; × 2 deja 2 aristas de la U orientadas (barra) → valida la lógica de
   orientación de aristas y las pegatinas.
4. `x` solo = resuelto (girar el cubo entero no desordena); escramble + su inversa = resuelto.
5. Ninguna pegatina visible se queda vacía tras cualquier secuencia (medidor de `emptyStickers`).
6. Para toda la base de datos: `applyMoves(caseState(alg), parseAlg(alg))` ⇒ `isSolved()` y el caso
   plantado debe ser el patrón declarado (para F2L: 1 hueco vacío + par en la U; para OLL: F2L resuelto y
   patrón de orientación declarado; para PLL: última capa orientada y permutación declarada).

Estas pruebas son la red que impide publicar algoritmos transcritos mal. **No quitarlas.**

---

## 7. Pipeline de datos de algoritmos

1. **Fuente en bruto**: tablas de GANCUBE transcritas por lectura de imagen → `docs/fuentes.md` (F2L 21,
   OLL 57, notación, PLL 21). Estado: verificadas contra el motor con `npm run verify`.
2. **Firma de caso** (lo que define el caso, y es legible de la imagen sin ambigüedad):
   - F2L: posición de la esquina blanca y la arista blanca en la U + hueco objetivo + ocupación del hueco.
   - OLL: 4 orientaciones de esquina de la última capa + 4 vuelos de arista de la última capa.
   - PLL: permutación de 4 esquinas + 4 aristas de la última capa (con la última capa orientada).
   - Cross: 4 aristas de la D respecto al centro.
3. **Generador BFS** (`scripts/gen-*.mts`, con `tsx`): búsqueda en amplitud desde el estado del caso hasta
   resuelto, con conjunto de movimientos estético y coste = nº de movimientos.
4. Salida → `src/data/oll.ts`, `pll.ts`, `f2l.ts` con `{ id, code, name, algs[], variants, expect,
sig, source }`, y **la prueba de que el alg cierra el plantado** (§6.1 punto 6).
5. Regla de oro: **la interfaz solo muestra algoritmos que han pasado la verificación.** Si un transcrito
   no pasa, se sustituye por el generado por BFS y se anota en `docs/fuentes.md`.
6. Imágenes oficiales: las láminas de GANCUBE recortadas están en `public/gan/` y se enlazan desde la
   ficha con su enlace directo en `source`. Los PLL se publican solo con las variantes canónicas de la
   lámina de 21 casos.

---

## 8. Visor 3D (`src/components/Cube3D.tsx`, `src/components/InteractiveCube.tsx`)

- Escena: `<Canvas dpr={[1,2]}>`, `PerspectiveCamera` en `[4.6, 3.9, 5.8]`, fov 20, objetivo en el origen;
  `OrbitControls` (sin pan, zoom limitado, `enableDamping`).
- Composición por cubie: `THREE.Group` con (a) caja base oscura `BoxGeometry(0.96)` y (b) hasta 6
  pegatinas: `ShapeGeometry` de cuadrado redondeado (radio ≈ 0.09) a `±0.5` en su eje local, material por
  pegatina (permite teñir la capa que gira).
- Fondos: CSS (degradado violeta) detrás del canvas, sin fondo de escena → encaja con el minimalismo.
- Luces: `ambientLight 0.75` + `directionalLight` clave (intensidad 1.1, desde [5,6,4]) + relleno frío.
  `MeshLambertMaterial` para pegatinas, `MeshStandardMaterial` (rugosidad alta) para la caja.
- **Verdad de estado:** el estado lógico vive en `engine.ts`; las mallas se colocan desde el estado.
  Secuencia de un movimiento:
  1. `pivot` (Object3D en la raíz, rotación 0); los cubies de las capas del movimiento se **re-parentan**
     al pivot con `Object3D.attach()` (conserva la transformada mundial), con `matrixAutoUpdate=false` y
     su matriz = estado _antes_ del giro.
  2. `useFrame(dt)`: `pivot.rotation[axis] = ease(animT) * dir * π/2`, con `animT` avanzado por
     `dt * movimientosPorSegundo`.
  3. Al llegar a 1: `applyMove(estado, mov)`, `detach` de vuelta a la raíz, y se fijan las matrices desde
     el estado (sin redondeos: el estado ya es exacto).
- API imperativa (vía `useImperativeHandle`): `setQueue(moves, mainStart)`, `setBase(state)`, `play()`,
  `pause()`, `toggle()`, `step(+1|-1)`, `seek(i)`, `reset()`, `setSpeed(n)`, callback `onCursor(i)` (para
  resaltar el chip de notación), callback `onDone()`.
- Interacción directa (RF-1): arrastrar una pegatina gira su capa, clic = cara entera, arrastrar el fondo
  = girar la vista, teclado `R U F B L D`, desfacer, plantar/quitar, play-along, modo cruces.
  **Defecto abierto (m01978):** al girar una cara que estaba oculta al inicio, las piezas que quedan
  visibles salen **sin color** → hay que arreglar el color de pegatina en el motor (§6.1 punto 1) y
  asegurar que la vista se pueda rotar en el visor.
- Regla de render: `React.memo` en la escena; no reconstruir la escena al cambiar el algoritmo, solo la
  cola de movimientos.
- Teñido del giro activo: pegatinas de los cubies de las capas giradas suben `emissive` al acento
  `--accent` durante la animación.
- Flecha de eje: arco corto sobre el plano de giro, con el color del dedo (azul/rojo/naranja, RF-3).
- `prefers-reduced-motion`: sin animación continua → salto a 90° por paso.
- Rendimiento: un solo canvas por pantalla (el de la ficha); las tarjetas de lista usan SVG, no canvas.

---

## 9. Ficha de caso (`src/pages/CaseDetail.tsx`), orden visual

1. Migas: `F2L · 05 Aa` + botones anterior/siguiente.
2. **Cubo 3D** (grande) — fase de preparación/caso/algoritmo, controles de reproducción, velocidad,
   bucle, invertir, espejo, órbita.
3. **Notación** debajo del cubo: chips monoespaciados; el chip en curso resaltado en morado; cada chip
   clicable (salta a ese movimiento); variantes del algoritmo en pestañas; símbolos coloreados por dedo.
4. Controles de **nivel (RF-8)**: 3 barras (33/66/100) + "sin empezar".
5. **Watchlist** (RF-7): botón marcar/desmarcar.
6. **Cronómetro (RF-10)**: Start/Stop (Espacio), lectura grande, mejor/media/intentos, mini-histograma.
7. **Explicación intuitiva**: pasos en lenguaje natural (plantilla por etapa; F2L usa la estructura de 4
   pasos de RF-9) + "qué pasa si…" + consejos de GANCUBE.
8. Diagramas auxiliares (SVG) del estado del caso: vista superior (y frontal si aporta) + imagen oficial.
9. Trucos/fingertricks (campo opcional por caso, editable en datos).
10. Navegación a casos relacionados (mismo grupo / espejo).

Atajos de teclado en la ficha: `Espacio` play/pausa · `←/→` paso · `R` reiniciar · `Espacio` con `Shift` =
cronómetro · `M` espejo · `I` invertir. Dejar la lista en un sitio visible de la ficha.

---

## 10. Niveles, watchlist y tiempos (`src/store/progress.ts`)

Esquema por id (`"f2l:05"`, `"oll:17"`, `"pll:03"`, `"cross:04"`, `"notation:R"`):

```ts
interface ProgressEntry {
  level: 0 | 33 | 66 | 100;
  watched: boolean;
  times: number[];
  best: number;
  updatedAt: number;
}
```

- Claves localStorage: `cubo.cfop.progress.v2` (con migración automática desde `cubo.cfop.progress.v1`).
- API: `setLevel`, `toggleWatch`, `setWatch`, `recordTime(id, ms)` (guarda hasta 40 tiempos, calcula
  `best`), `clearTimes`, `resetAll`, `get`.
- Hooks: `useProgress(id)`, `useAllProgress()`, `useStore()` vía `useSyncExternalStore`.
- `LEVEL_LABEL`: `Sin empezar / Aprendido / Automático / Fingertricks`; `LEVEL_HINT` con el texto
  explicativo de cada tramo (33 = aprendido, 66 = me sale solo, 100 = fingertricks completos).
- `fmtTime(ms)`: `< 60s` → `12.34`; si no `0:12.34`. `avg(times)`.
- Sin backend: el progreso **no se sincroniza** entre navegadores. Anotarlo en la interfaz y en el README.

---

## 11. Páginas

- **Home**: definición de CFOP (frase de GANCUBE: Cross → F2L → OLL → PLL), 4 tarjetas de etapa con % de
  progreso, entrada rápida a Notación, watchlist y ranking, aviso de que el progreso es local.
- **Notación** (RF-3): tabla de símbolos (R r L l U u D d F f B b S M E R2 R' R'2 x y z) + leyenda de
  dedos en azul/rojo/naranja + cubo 3D interactivo por símbolo.
- **Cross**: explicación (cruz blanca en la D, lógica "blanco arriba / blanco al frente", hueco),
  casos/atajos, práctica, consejos de GANCUBE.
- **F2L** (RF-5/RF-9): guía intuitiva (inserciones básicas `U R U' R'` / `U' L' U L` / `R U R'` / `L' U' L`)
  - los 21 casos con filtros (emparejado/separado/mal unido) y niveles.
- **OLL** (RF-6): pestañas **2-Look (empezar aquí)** y **Todos los 57**, sub-grupos por patrón (punto /
  L / barra / cruz hecha), niveles, cronómetro.
- **PLL**: los 21 casos (T, Ua/Ub, Za/Zb, H, G1-G6, J1/J2, R, F, A1/A2, E, N1/N2, V, Y) con sub-grupo
  "permuta de aristas primero" para aprender antes que las esquinas.
- **Watchlist** (RF-7) y **Ranking** (RF-11).
- **Práctica**: cubo libre arrastrando caras, escramble, temporizador, resolución paso a paso con sugerencias.

---

## 12. Publicación en GitHub (RF-12)

- `vite.config.ts`: `base: process.env.PAGES_BASE ?? '/'`, y en build de Pages `PAGES_BASE=/REPO/`.
  (También sirve `base: './'` para un build portable; documentar el elegido.)
- `.github/workflows/deploy.yml`: `on: push` a `main` → `actions/checkout`, `actions/setup-node` (node 22),
  `npm ci`, `npm run build`, `actions/upload-pages-artifact` (`path: dist`), `actions/deploy-pages` con
  `permissions.pages: write`, `concurrency.group: pages`.
- Configurar Pages en rama `gh-pages` **o** "GitHub Actions" como fuente. Dejar el repo público.
- Nombre de la web: **Selene knows CFOP**. Ruta del repo: **`selene-knows-cfop`**
  (`PAGES_BASE=/selene-knows-cfop/`).
- La marca aparece en `index.html` (título), en la cabecera de la app y en el README.
- `.gitignore`: `node_modules`, `dist`, `.DS_Store`, `*.log`, `.vercel` etc.
- README: cómo ejecutar (`npm install`, `npm run dev`), cómo publicar, y la advertencia de que el progreso
  es por navegador.
- Notas: sin claves ni tokens en el repo. Si se sube con `gh`, usar `gh repo create`/`gh auth` y pedir
  credenciales a la persona (no asumir permisos).

---

## 13. Fases de implementación (orden de trabajo)

1. **Base**: andamio Vite/React/TS, tokens de estilo, layout + navegación, Home, motor cúbico y sus pruebas.
2. **Visor 3D + reproductor** (RF-1/RF-2): `Cube3D.tsx` con animación por movimiento y `AlgoPlayer.tsx`.
3. **Datos verificados** (§7): tablas finales, diagramas SVG, filtros 2-Look (RF-6).
4. **Progreso**: niveles de 3 barras (RF-8), watchlist (RF-7), barras agregadas, página Watchlist.
5. **Cronómetro + ranking** (RF-10/RF-11).
6. **Contenido pedagógico** de Cross, F2L (RF-9), OLL, PLL en español.
7. **Notación interactiva** (RF-3).
8. **Práctica** (cubo libre + escramble + temporizador).
9. **Pulido**: responsive, accesibilidad, reduced-motion, SEO básico, favicon, OG.
10. **Publicación**: git, GitHub, Actions, Pages, README.

**Fase 0 nueva, añadida tras los avisos de la persona (m01739, m01978):** arreglar la convención de
matrices y colores del motor (§6.1 punto 1) antes de seguir añadiendo datos o pantallas, porque todo lo
que consume el estado cúbico (visor 3D, diagramas, patrones, `isSolved`) arrastra ese defecto.

Cada fase termina con `npm run typecheck` y `npm run build` en verde.

### 13.1 Cadena de defectos de la vista canónica (auditoría de la fase 0)

Medido sobre el plantado de `Ua` (`src/data/pll.ts`, alg `R U' R U R U R U' R' U' R2`), que es el
caso más simple de todos. Comprobado con sondas desechables (borradas tras medir):

1. **Convención de casa**: en `solvedState()` (`src/cube/engine.ts:58`) las 8 piezas de la última
   capa tienen `home[1] === +1` y la cruz + F2L tienen `home[1] === -1`.
2. **`llLayerIsTop` era trivialmente verdadera** (`src/cube/caseUtils.ts:107`): comparaba claves de
   POSICIÓN contra las 8 claves de la anilla, y las 8 posiciones de arriba coinciden siempre con
   esas claves → devolvía `true` para cualquier giro. Arreglada comparando IDENTIDADES por firma de
   color; con eso da `false` en crudo y en las 24 rotaciones, que es lo correcto aquí.
3. **`canonicalizeState`** (`src/cube/caseUtils.ts:395`) recorre las 24 palabras de `ROT_WORDS`
   pidiendo `f2lSolvedRel(state2)`. La comprobación de posición de `f2lSolvedRel` quiere
   `posición = marco·casa`, pero el marco que sale de `frameMatrix` (`src/cube/engine.ts:91`, que
   guarda las matrices POR COLUMNAS) aplicado con `applyVec` fila-major devuelve la transpuesta: la
   cuenta queda invertida. Medido sobre las 7 palabras de control: 7 de 12 piezas F2L cuadran en
   crudo (`F = I`) y sólo 4 con `x` — ninguna rotación pasa. Por eso `canonicalView` devuelve siempre
   `rot: ''` y cae al plantado crudo, que es el estado honesto (plantado + alg = resuelto).
4. **Consecuencia visible**: en el plantado crudo la última capa está abajo, así que `permOf` sobre
   el anillo de arriba mide la capa blanca → `[ -1, -1, 2, 3 ]` en esquinas y `[ 0, 3, -1, 2 ]` en
   aristas, y las flechas de PLL salían sin esquinas. La lámina ya NO depende de ese anillo: los
   recuadros y las flechas se dibujan por COLOR del sticker (`CaseDiagram.stickerColor`, rotación de
   la pieza = permutación de sus colores), que sí es correcto, como se ve en las capturas.
5. **Sondeo añadido**: `f2lSolvedHere` (`src/cube/caseUtils.ts:112`) mide «dos primeras capas
   resueltas en estas coordenadas» excluyendo por identidad de pieza, para que la auditura no
   dependa
   de la exclusión por capa de arriba de `f2lSolved`.

**Falta**: fijar UNA convención de matriz (columnas de `frameMatrix` vs helpers fila-major) con un
test único, y entonces la vista canónica + el anillo por posición + `f2lSolvedRel` +
`canonicalByFrame`. Los verificadores siguen en verde: `casos verificados: 73 de 111`,
`Avisos de prerrequisito: 38`, 0 fallos, `tsc` limpio, `✓ built in 747ms`.

---

## 14. Estado

**Decidido y pedido por la persona**: RF-1..RF-12 de este documento. Recursos: guía CFOP de GANCUBE, tabla
F2L 21 (imagen), tabla OLL 57 (imagen), lámina PLL 21 (imagen), tabla de notación (imagen), guía F2L de
speedcube.quest.

**En el repo ahora**: `README.md`, `project.md`, `docs/fuentes.md`, `.gitignore`, `package.json` con
`verify`, `vite.config.ts`, `tsconfig.json`, `index.html`, `public/gan/` (láminas recortadas),
`src/cube/engine.ts`, `src/cube/caseUtils.ts`, `src/store/progress.ts`, `src/data/*` (111 fichas),
componentes (`Cube3D`, `InteractiveCube`, `AlgoPlayer`, `CaseDiagram`, `AlgorithmText`, `Timer`,
`Controls`, `Nav`, `Card`) y 15 páginas, `scripts/verify.mts` + utilidades de depuración.

**Comprobaciones:** `npm run verify` → 111 fichas, 0 fallos duros con la comprobación de "resuelto"
medida contra la identidad; 73 fichas pasan todo y 38 con aviso. Con la comprobación medida contra los
centros fallaban 20 fichas (`look2` y PLL), así que quedó revertida a la versión identidad.
`npm run typecheck` y `npm run build` en verde (último build 930 ms, ~72 KB gzip).

**Pendiente de confirmar con la persona**: nombre del repo y usuario/organización de GitHub; si quiere que
el progreso se comparta entre dispositivos (hoy: no, por ser estático); idioma extra (inglés).

**Open objectives (abiertos):**

- Arreglar la lógica del cubo señalada en m01739 (convención de matrices/rotaciones, ver §6.1).
- Que se pueda girar visualmente el cubo en el visor y que las piezas que aparecen al girar una cara
  oculta salgan con color (m01978, §8).
- RF-1..RF-12 completos; publicar en GitHub Pages.
