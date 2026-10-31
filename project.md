# project.md — Selene knows CFOP

> Documento de especificación e implementación. Es la fuente de verdad del proyecto.
> Se actualiza en cada conversación: al final hay una sección **Estado** con lo que ya existe en el repo.
> Idioma del producto: español. Idioma del código: inglés (identificadores), comentarios en español.

---

## 1. Objetivo

Página web propia y completa para **aprender el método CFOP de forma intuitiva**.

**Objetivo final declarado por el usuario:** subirlo a **GitHub** (repo + GitHub Pages) para que lo usen él y sus amigos → el build debe ser 100% estático, sin backend, sin cuentas, sin login. Todo el progreso se guarda en `localStorage` del navegador de cada persona.

Solicitud original (m00001, parafraseada): crear un proyecto de página web propia completa para aprender el método CFOP de forma intuitiva, con los recursos que el usuario va pasando (algoritmos) y las características que va pidiendo, poco a poco.

---

## 2. Requisitos funcionales

Numerados para poder referirlos en futuras conversaciones. Todos pedidos explícitamente por el usuario.

### RF-1 · Cubo 3D funcional encima del algoritmo (la pieza estrella)
El usuario (m00009, parafraseada): *"como característica más llamativa, que encima del algoritmo que estás intentando aprender haya un cubo 3D funcional haciendo los movimientos del algoritmo para mostrártelo"*.

- En la ficha de cada algoritmo, **el cubo 3D va arriba y la notación debajo**.
- El cubo ejecuta el algoritmo **movimiento a movimiento**, con animación de giro real (no saltos de estado).
- Debe ser **funcional**: estado cúbico real, no una secuencia de imágenes precalculadas.
- Al terminar el algoritmo el cubo queda **resuelto** → refuerzo visual del efecto del algoritmo (ver RF-2).
- Controles: reproducir/pausar, paso adelante/atrás, velocidad, bucle, ir al caso, ver desde el cubo resuelto, invertir, espejo.
- Interacción: órbita (arrastrar para girar la cámara), zoom, y (fase posterior) girar caras arrastrando sobre el cubo.

### RF-2 · Reproducir el algoritmo desde su caso
Consecuencia técnica de RF-1: para que el cubo "muestre" el caso, el estado inicial tiene que ser el estado del caso.
**Decisión de diseño:** `estadoDelCaso = aplicar inverso(algoritmo) al cubo resuelto`.
Es matemáticamente garantizado: si `algoritmo(estadoCaso) = resuelto`, entonces `estadoCaso = inverso(algoritmo)(resuelto)`. Válido para Cross, F2L, OLL y PLL, y para cualquier algoritmo (incluidos variantes y algoritmos con setup).
Fases visibles en el reproductor:
1. **Preparación** (opcional, lenta y atenuada): cubo resuelto → `inverso(algoritmo)` → estado del caso.
2. **Algoritmo**: estado del caso → cubo resuelto. Esta es la parte que se estudia.
3. Botón **"Ver caso"**: salta directamente a la fase 2 (cubo plantado en el caso, listo para ejecutar).

### RF-3 · Notación interactiva
Recurso (m00036): tabla de notación de GANCUBE con `R r L l U u D d F f B b S M E R2 R' R'2 x y z` y la leyenda de dedos:
- **Letra en mayúscula** = giro 90° horario. **Letra en minúscula** = gira 2 capas. **Apostrofo** = antihorario. **2** = 180°.
- **Azul** = índice izquierdo · **Rojo** = pulgar derecho · **Naranja** = medio/anular/meñique.
Implementación: cada símbolo es una tarjeta clicable que **anima ese movimiento en un cubo 3D** (mismo motor que RF-1), con la flecha de eje y el color del dedo. Explicación del eje y de la capa afectada en texto.

### RF-4 · Secciones del método (estructura de la guía de GANCUBE)
Estructura extraída de la página de GANCUBE: **Notación → Cross → F2L → OLL → PLL**, con la definición: CFOP = Cross, F2L (primeras dos capas), OLL (orientar última capa), PLL (permutar última capa). Incluye los consejos ("tips") de la guía, p.ej. *"si la arista blanca ya está en su posición objetivo, gira la cara superior para crear hueco"*.

### RF-5 · F2L: los 21 casos de la tabla
Recurso: imagen con los 21 casos y sus algoritmos (transcritos en `docs/fuentes.md`, sección F2L, **pendiente de verificación**). Nombres y números: `01 Ua, 02 Ub, 03 H, 04 Z, 05 Aa, 06 Ab, 07 E, 08 T, 09 F, 10 V, 11 Y, 12 Ja, 13 Jb, 14 Rb, 15 Ra, 16 Gc, 17 Gd, 18 Ga, 19 Gb, 20 Nb, 21 Na`.
- Cada caso: diagrama de la vista superior + algoritmo(s) + cubo 3D (RF-1).
- Grupo pedagógico "intuitivo" tomado de speedcube.quest (RF-9).

### RF-6 · OLL 57 casos y clasificación 2-Look
Recurso (m00030): imagen con los 57 OLL de GANCUBE. Solicitud (m00030, parafraseada): **separar los OLL en los que se pueden resolver con 2-Look OLL (cruz amarilla)**, y **añadir los 57 al final**.
Traducción a requisitos:
- Grupo A **"2-Look"** = los casos que se resuelven con el método de dos miradas: **paso 1** cruz amarilla (3 patrones: punto, "L"/90°, barra/180° con `F R U R' U' F'` y sus variantes) + **paso 2** orientar esquinas (`R U R' U' R U' R'` Sune / Antyune y setups).
- Criterio técnico exacto para clasificar (calculable desde el estado, no a mano):
  - Patrón de **vuelos de aristas de la U**: `n` = nº de aristas de la U sin orientar. `n=0` → cruz hecha; `n=2` adyacentes → "L"; `n=2` opuestas → barra; `n=4` → punto. **Cualquier OLL con `n>0` necesita el paso de cruz** → entra en el grupo 2-Look con su patrón de cruz conocido.
  - Patrón de **giros de esquinas de la U** (triple suma módulo 3 de las esquinas mal orientadas = invariante): después de la cruz, el estado de esquinas es resoluble con Sune / Antyune / doble-Sune → cubre **los 57 casos**. Por eso el grupo "2-Look" es el camino de aprendizaje inicial y el grupo "caso único" (algortmo directo) es la capa avanzada.
- UI: filtro/pestañas **"2-Look (empezar aquí)"** / **"Todos los 57"**; cada OLL muestra en qué sub-patrón cae (punto / L / barra / cruz hecha) calculado desde su estado.
- Orden de aprendizaje: primero los 3 de cruz + Sune/Antyune, luego los casos directos.

### RF-7 · Watchlist de algoritmos en aprendizaje
Recurso (m00064, parafraseada): apartado donde marcar ciertos algoritmos como **"watchlist"** de los que estás aprendiendo actualmente.
- Star/pin en cada ficha; vista dedicada **"Watchlist"** con solo los marcados, ordenable por etapa y por tiempo.
- Contador en la navegación (nº de algoritmos en watchlist).

### RF-8 · Barra de progreso por algoritmo con 3 niveles elegidos por el usuario
Recurso (m00064): barra de "ya aprendidos", elegida **libremente por el usuario**, con **3 barras**:
- **33 %** → ya lo tiene aprendido.
- **66 %** → ya puede hacer el algoritmo con soltura, de forma automática.
- **100 %** → sabe todos los fingertricks.
Implementación: control segmentado de 3 tramos (más estado "sin empezar" = 0). Al tocar un tramo se guarda el nivel. Tooltips con las etiquetas de `LEVEL_LABEL`/`LEVEL_HINT` en `src/store/progress.ts`.
- Barras agregadas por etapa (Cross / F2L / OLL / PLL) y globales: media de niveles y nº de casos por nivel, en la portada y en cada etapa.

### RF-9 · Guía F2L intuitiva (contenido pedagógico)
Recurso (m00064, mensaje con enlace): `https://speedcube.quest/guides/beginner-f2l`. Sección propia con el enfoque del guide (extraído, en `docs/fuentes.md`):
- F2L = introducir par esquina+arista a la vez, 4 pares.
- **Las dos inserciones básicas** (base de la intuición, sin memorizar strings):
  - Par emparejado (colores de la U coinciden): `U R U' R'` y su espejo `U' L' U L`.
  - Par separado (colores de la U difieren, la arista a un paso de la esquina): `R U R'` y espejo `L' U' L`.
  - Explicación en 4 pasos: apartar el par del slot → abrir el slot → meter el par en el slot abierto → cerrar el slot.
- Secciones: *Qué es F2L* · *Inserciones básicas* · *Preparar el par* · *Sacar una pieza del slot* · *Piezas separadas arriba (mismo color / colores distintos / blanco arriba)* · *Piezas mal unidas arriba (split)* · *Resolución completa guiada* (cada par se resuelve con el slot frontal-derecha, rotando el cubo).
- Idea clave a transmitir: **no memorizar algoritmos como strings**, leer la descripción y entender el concepto.

### RF-10 · Cronómetro por algoritmo
Recurso (m00069, parafraseada): temporizador básico **debajo de cada algoritmo** para cronometrarse al ejecutarlo y ver progreso.
- Debajo del cubo 3D: Start/Stop (tecla **Espacio**), lectura grande `segundos.centésimas`, Auto-reset tras grabar, botón borrar.
- Al parar se **registra** el tiempo en el almacén del caso (lista de tiempos + mejor + media + nº de intentos).
- Inspección opcional (15 s) en fase posterior.
- Debajo de la lectura: mejor tiempo, media de los últimos 5, nº de intentos, y mini-histograma de los últimos tiempos.

### RF-11 · Apartado "Tus mejores permutaciones"
Recurso (m00069): apartado separado con **tus mejores permutaciones ordenadas de menor a mayor tiempo**.
- Vista **"Ranking"**: todas las permutaciones/algoritmos con tiempo registrado, **ordenadas por mejor tiempo de menor a mayor**.
- Columnas: puesto, nombre (etapa + código, p.ej. `F2L 05 · Aa`), mejor tiempo, media, nº de intentos, nivel de aprendizaje (RF-8), en watchlist.
- Filtros por etapa; vaciar ranking con confirmación; orden alternativo por media.
- Términos en español para el usuario: "mejores permutaciones", "mejor tiempo", "media", "intentos".

### RF-12 · Publicación en GitHub
- Repositorio git con `README.md` + `project.md`.
- **GitHub Pages** con GitHub Actions (build → deploy `dist/`).
- **Requisito técnico:** `vite.config.ts` debe fijar `base` según el path del repo (`/NOMBRE/`), vía variable de entorno, para que Assets funcionen en Pages.

---

## 3. Estilo (requisito visual)

Usuario (m00001, parafraseado): **estilo minimalista en modo oscuro con acentos morados oscuros**.

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
- Tipografía: Inter/`system-ui` para texto; `ui-monospace`/JetBrains Mono para **algoritmos** (los símbolos de giro se leen mejor en monoespaciada).
- Minimalismo: poco texto por pantalla, mucho aire, bordes de 1 px, sin sombras gordas, sin emojis decorativos, una sola cosa destacada por pantalla (el cubo).
- Los colores del cubo mantienen la convención clásica (necesaria para aprender): U blanco, D negro, F verde, B azul, R rojo/naranja, L ámbar. El morado se usa solo en acentos UI.
- Responsive: móvil primero en ancho; en móvil el cubo ~55 % de la pantalla y la notación debajo; controles táctiles grandes.
- Accesibilidad: foco visible, `prefers-reduced-motion` → animación por pasos sin giro continuo, contraste AA en texto, `aria-label` en los controles del cubo.

---

## 4. Stack técnico y decisiones

| Elección | Decisión | Motivo |
|---|---|---|
| Build | **Vite 5 + React 18 + TypeScript** | estático para Pages, HMR rápido, sin backend |
| 3D | **three.js + @react-three/fiber 8** (+ @react-three/drei para `OrbitControls`) | control imperativo del cubo, animación por frame |
| Enrutado | navegación propia con estado (`useState` + hash `#/f2l/05`) | evitar dependencia extra; URLs compartibles con amigos |
| Estado | **`localStorage` + `useSyncExternalStore`** (módulo singleton) | sin backend, sin librerías de estado; persistencia inmediata |
| Diagramas | **SVG generados desde el estado cúbico** (no imágenes de GANCUBE) | evita dependencias de imágenes externas, siempre coherente con el 3D, escalable a cualquier caso |
| Algoritmos | **tablas transcritas de las imágenes + verificación/generación por BFS** (ver §7) | las transcripciones de imagen son propensas a error; el solver garantiza que el algoritmo mostrado **sí** resuelve el caso |
| Idioma UI | español | usuario y amigos hispanohablantes |
| Versiones fijadas | react 18.3, @react-three/fiber ^8.17, three ^0.171, @react-three/drei ^9.117, vite ^5.4, typescript ^5.6, tsx ^4.19 (scripts) | compatibilidad React 18 ↔ fiber 8 |

Versiones incompatibles a evitar: @react-three/fiber v9 requiere React 19. No mezclar.

---

## 5. Estructura de archivos planeada

```
index.html                     # lang="es", theme-color #0a0810
vite.config.ts                 # plugins + server + base (para Pages)
tsconfig.json
package.json                   # scripts: dev, build, preview, typecheck, gen
.github/workflows/deploy.yml   # build → pages
project.md                     # este documento
README.md                      # resumen + cómo arrancar + cómo publicar
docs/fuentes.md                # recursos, enlaces, transcripciones en bruto (sin verificar)
src/
  main.tsx  App.tsx            # navegación + layout
  styles/global.css
  cube/
    engine.ts        [EXISTE] # modelo de cubies, movimientos, parser, inverso, scramble, facelets
    Cube3D.tsx                 # escena three.js, animación por movimiento, API imperativa
    AlgoPlayer.tsx             # cubo + notación + controles + cronómetro + niveles
    solver.ts                  # BFS: OLL / PLL / F2L (fase 3)
  components/
    LevelControl.tsx           # 3 barras de nivel (RF-8)
    WatchButton.tsx            # watchlist (RF-7)
    CaseDiagram.tsx            # SVG de vista superior/frontal desde estado
    AlgorithmText.tsx          # chips de notación con dedo-coloreado y resaltado
    Timer.tsx                  # cronómetro (RF-10)
    ProgressBars.tsx           # barras agregadas por etapa
    Nav.tsx  Card.tsx
  pages/
    Home.tsx                   # qué es CFOP, 4 etapas, resumen de progreso
    Notation.tsx               # RF-3
    Cross.tsx  F2L.tsx  Oll.tsx  Pll.tsx   # listas de casos + filtros
    CaseDetail.tsx             # RF-1/2/7/8/10 (plantilla única por caso)
    Watchlist.tsx              # RF-7
    Ranking.tsx                # RF-11
    Practice.tsx               # (fase 4) cubo libre + scramble + timer
  data/
    notation.ts  cross.ts  f2l.ts  oll.ts  pll.ts  stages.ts
scripts/
  gen-oll.mts  gen-pll.mts  gen-f2l.mts  verify.mts   # con tsx
```

---

## 6. Motor cúbico (`src/cube/engine.ts`, ya escrito)

Modelo: **26 cubies** (sin núcleo), cada uno con `home` (posición resuelta), `pos` ∈ {-1,0,1}³ y `rot` (matriz 3×3 de enteros). Los colores de sticker son fijos por `home`; al girar se actualiza `pos` y `rot` → los colores se mueven solos. Esto hace trivial el render 3D y los diagramas.

Coordenadas y signos (decisión clave, ya implementada):
- `x` = derecha (cara R), `y` = arriba (cara U), `z` = frente (cara F).
- Giro horario de una cara = **−90°** sobre su eje.
- Matrices: ver `mat()` en engine.ts (rotX/rotY/rotZ a ±90°, enteros). Derivadas de la convención "horario = −90°", **todavía sin ejecutar las pruebas de identidad** (ver lista abajo: es lo primero que hay que correr).
- Capas: R=[1], L=[-1], M=[0], r=[1,0], l=[-1,0], U=[1], D=[-1], E=[0], u=[1,0], d=[-1,0], F=[1], B=[-1], S=[0], f=[1,0], b=[-1,0], x/y/z = [-1,0,1].
- Direcciones base (`dir`): R,U,F = -1 · L,D,B = +1 · M=+1 (sigue a L) · E=+1 (sigue a D) · S=-1 (sigue a F) · x,y,z = -1.
- `MOVE_SPECS` es la tabla authoritative: cualquier movimiento nuevo (p.ej. `Rw`, `f2`, setups dePLL) se añade ahí.
- Notación: minúscula = 2 capas, `'` = antihorario, `2` = 180° (que se **descompone en dos cuartos**, con flag `half`, así la animación de un `R2` se ve como dos giros, que es lo que hace una persona).
- API: `solvedState()`, `cloneState()`, `applyMove()`, `applyMoves()`, `isSolved()`, `parseAlg()`, `invertMoves()`, `caseState(alg)`, `faceletHome(state, face, row, col)`, `gridToPos()`, `topGrid()`, `frontGrid()`, `cubieIdentity()`, `scramble(len, seed)`.
- `scramble` evita repetición de la misma cara y de la cara +2 consecutivas; pool `R U L F B` + primos + `2`.

**Pruebas que hay que mantener** (`scripts/verify.mts`, con `tsx`, falta por escribir):
1. `(R U R' U')` × 6 = resuelto (sexy move).
2. `M2 U2 M2 U2 M2 U2 M2` (caso H) = resuelto.
3. `F R U R' U' F'` × 4 = resuelto; × 2 deja 2 aristas de la U orientadas (barra) → valida la lógica de orientación de aristas y los facelets.
4. Para toda la base de datos: `applyMoves(caseState(alg), parseAlg(alg))` ⇒ `isSolved()` y el caso plantado debe ser el patrón declarado (para F2L: 1 slot vacío + par en la U; para OLL: F2L resuelto y patrón de orientación declarado; para PLL: LL orientada y permutación declarada).

Estas pruebas son la red que impide publicar algoritmos transcritos mal. **No quitarlas.**

---

## 7. Pipeline de datos de algoritmos

1. **Fuente en bruto**: tablas de GANCUBE transcritas por lectura de imagen → `docs/fuentes.md` (F2L 21, OLL 57, notación). Estado: **sin verificar**.
2. **Firma de caso** (lo que define el caso, y es legible de la imagen sin ambigüedad):
   - F2L: posición de la esquina blanca y la arista blanca en la U + slot objetivo + ocupación del slot.
   - OLL: 4 orientaciones de esquina LL + 4 vuelos de arista LL.
   - PLL: permutación de 4 esquinas LL + 4 aristas LL (con LL orientada).
   - Cross: 4 aristas de la D respecto al centro.
3. **Generador BFS** (`scripts/gen-*.mts`, fase 3, con `tsx`): búsqueda de amplitud desde el estado del caso hasta resuelto, con conjunto de movimientos estético y coste = nº de movimientos. Move sets propuestos:
   - OLL: `U U2 · R R' R2 · r r' · F F' F2 · f f' · M M' M2 · L' · x y` (incluye M y wide → salen algoritmos tipo los de la tabla).
   - PLL: `R R' R2 r L L' L2 l U U2 y F F'`… espacios pequeños (PLL completo ≈ 288 estados de permutación de LL) → BFS trivial.
   - OLL completo: 3⁷ × 2¹¹ ≈ 4.5 M estados → BFS bidireccional en typed arrays, se ejecuta en el script de generación (no en runtime).
4. Salida → `src/data/oll.ts`, `pll.ts`, `f2l.ts` con `{ id, code, name, alg, variants[], pattern, group, setup? }`, y **la prueba de que el alg resuelve el patrón** (paso 6.4).
5. Regla de oro: **la UI solo muestra algoritmos que han pasado la verificación.** Si un transcrito no pasa, se sustituye por el generado por BFS y se anota en `docs/fuentes.md`.

---

## 8. Visor 3D (`src/cube/Cube3D.tsx`, por escribir)

- Escena: `<Canvas dpr={[1,2]}>`, `PerspectiveCamera` pos `[4.6, 3.9, 5.8]`, fov 20, target origen; `OrbitControls` (sin pan, zoom limitado, `enableDamping`).
- Composición por cubie: `THREE.Group` con (a) caja base oscura `BoxGeometry(0.96)` y (b) hasta 6 stickers: `ShapeGeometry` de cuadrado redondeado (radio ≈ 0.09) a `±0.5` en su eje local, material por sticker (156 materiales → permite teñir la capa que gira). Total ≈ 26 grupos + 182 mallas, viable.
- Fondos: CSS (degradado violeta) detrás del canvas, sin fondo de escena → encaja con el minimalismo.
- Luces: `ambientLight 0.75` + `directionalLight` clave (intensidad 1.1, desde [5,6,4]) + relleno frío. `MeshLambertMaterial` para stickers, `MeshStandardMaterial` (rugosidad alta) para la caja.
- **Verdad de estado:** el estado lógico vive en `engine.ts`; los meshes se colocan desde el estado. Secuencia de un movimiento:
  1. `pivot` (Object3D en la raíz, rotación 0) se añade; los cubies de las capas del movimiento se **re-parentan** al pivot con `Object3D.attach()` (conserva la transformada mundial), con `matrixAutoUpdate=false` y su matriz = estado *antes* del giro.
  2. `useFrame(dt)`: `pivot.rotation[axis] = ease(animT) * dir * π/2`, con `animT` avanzado por `dt * movimientosPorSegundo`.
  3. Al llegar a 1: `applyMove(estado, mov)`, `detach` de vuelta a la raíz, y se fijan las matrices desde el estado (sin redondeos: el estado ya es exacto).
- API imperativa (vía `useImperativeHandle`): `setQueue(moves, mainStart)`, `setBase(state)`, `play()`, `pause()`, `toggle()`, `step(+1|-1)`, `seek(i)`, `reset()`, `setSpeed(n)`, callback `onCursor(i)` (para resaltar el chip de notación), callback `onDone()`.
- Regla de render: `React.memo` en la escena; no reconstruir la escena al cambiar el algoritmo, solo la cola de movimientos.
- Teñido del giro activo: stickers de los cubies de las capas giradas suben `emissive` al acento `--accent` durante la animación.
- Flecha de eje: `Line`/`Mesh` de un arco corto sobre el plano de giro, con el color del dedo (azul/rojo/naranja, RF-3).
- `prefers-reduced-motion`: sin animación continua → salto a 90° por paso.
- Rendimiento: un solo canvas por pantalla (el de la ficha); las tarjetas de lista usan SVG, no canvas.

---

## 9. Ficha de caso (`src/pages/CaseDetail.tsx`), orden visual

1. Migas: `F2L · 05 Aa` + botones anterior/siguiente.
2. **Cubo 3D** (grande) — fase de preparación/caso/algoritmo, controles de reproducción, velocidad, bucle, invertir, espejo, órbita.
3. **Notación** debajo del cubo: chips monoespaciados; el chip en curso resaltado en morado; cada chip clicable (salta a ese movimiento); variantes del algoritmo en pestañas; símbolos coloreados por dedo.
4. Controles de **nivel (RF-8)**: 3 barras (33/66/100) + "sin empezar".
5. **Watchlist** (RF-7): botón marcar/desmarcar.
6. **Cronómetro (RF-10)**: Start/Stop (Espacio), lectura grande, mejor/media/intentos, mini-histograma.
7. **Explicación intuitiva**: pasos en lenguaje natural (plantilla por etapa; F2L usa la estructura de 4 pasos de RF-9) + "qué pasa si…" + consejos de GANCUBE.
8. Diagramas auxiliares (SVG) del estado del caso: vista superior (y frontal si aporta).
9. Trucos/fingertricks (campo opcional por caso, editable en datos).
10. Navegación a casos relacionados (mismo grupo / espejo).

Atajos de teclado en la ficha: `Espacio` play/pausa · `←/→` paso · `R` reiniciar · `Espacio` con `Shift` = cronómetro · `M` espejo · `I` invertir. Dejar la lista en un sitio visible de la ficha.

---

## 10. Niveles, watchlist y tiempos (`src/store/progress.ts`, ya escrito)

Esquema por id (`"f2l:05"`, `"oll:17"`, `"pll:03"`, `"cross:04"`, `"notation:R"`):
```ts
interface ProgressEntry { level: 0|33|66|100; watched: boolean; times: number[]; best: number; updatedAt: number }
```
- Claves localStorage: `cubo.cfop.progress.v2` (con migración automática desde `cubo.cfop.progress.v1`).
- API: `setLevel`, `toggleWatch`, `setWatch`, `recordTime(id, ms)` (guarda hasta 40 tiempos, calcula `best`), `clearTimes`, `resetAll`, `get`.
- Hooks: `useProgress(id)`, `useAllProgress()`, `useStore()` vía `useSyncExternalStore`.
- `LEVEL_LABEL`: `Sin empezar / Aprendido / Automático / Fingertricks`; `LEVEL_HINT` con el texto explicativo de cada tramo (33 = aprendido, 66 = me sale solo, 100 = fingertricks completos).
- `fmtTime(ms)`: `< 60s` → `12.34`; si no `0:12.34`. `avg(times)`.
- Sin backend: el progreso **no se sincroniza** entre navegadores. Anotarlo en la UI y en README.

---

## 11. Páginas

- **Home**: definición de CFOP (frase de GANCUBE: Cross → F2L → OLL → PLL), 4 tarjetas de etapa con % de progreso, entrada rápida a Notación, watchlist y ranking, aviso de que el progreso es local.
- **Notación** (RF-3): tabla de símbolos (R r L l U u D d F f B b S M E R2 R' R'2 x y z) + leyenda de dedos en azul/rojo/naranja + cubo 3D interactivo por símbolo.
- **Cross**: explicación (cruz blanca en la D, lógica "blanco arriba / blanco al frente", hueco), casos/atajos, práctica, tips de GANCUBE.
- **F2L** (RF-5/RF-9): guía intuitiva (inserciones básicas `U R U' R'` / `U' L' U L` / `R U R'` / `L' U' L`) + los 21 casos con filtros (emparejado/separado/mal unido) y niveles.
- **OLL** (RF-6): pestañas **2-Look (empezar aquí)** y **Todos los 57**, sub-grupos por patrón (punto / L / barra / cruz hecha), niveles, cronómetro.
- **PLL**: los 21 casos (T, Ua/Ub, Za/Zb, H, G1-G6, J1/J2, R, F, A1/A2, E, N1/N2, V, Y, adj/swap) con sub-grupo "permuta de aristas primero" para aprender antes de las esquinas.
- **Watchlist** (RF-7) y **Ranking** (RF-11).
- **Práctica** (fase 4): cubo libre arrastrando caras, scramble, temporizador, resolución paso a paso con sugerencias.

---

## 12. Publicación en GitHub (RF-12)

- `vite.config.ts`: `base: process.env.PAGES_BASE ?? '/'`, y en build de Pages `PAGES_BASE=/REPO/`. (También sirve `base: './'` para build portable; documentar el elegido.)
- `.github/workflows/deploy.yml`: `on: push` a `main` → `actions/checkout`, `actions/setup-node` (node 22), `npm ci`, `npm run build`, `actions/upload-pages-artifact` (`path: dist`), `actions/deploy-pages` con `permissions.pages: write`, `concurrency.group: pages`.
- Configurar Pages en rama `gh-pages` **o** "GitHub Actions" como fuente. Dejar el repo público.
- Nombre de la web: **Selene knows CFOP**. Slug del repo: **`selene-knows-cfop`** (usar `PAGES_BASE=/selene-knows-cfop/`).
- La marca aparece en `index.html` (título), en la cabecera de la app y en el README.
- `.gitignore`: `node_modules`, `dist`, `.DS_Store`, `*.log`, `.vercel` etc.
- README: cómo ejecutar (`npm install`, `npm run dev`), cómo publicar, y la advertencia de que el progreso es por navegador.
- Notas: sin claves ni tokens en el repo. Si se sube con `gh`, usar `gh repo create`/`gh auth` y pedir credenciales al usuario (no asumir permisos).

---

## 13. Fases de implementación (orden de trabajo)

1. **Base**: scaffold Vite/React/TS, tokens de estilo, layout + navegación, Home, motor cúbico y sus pruebas (`scripts/verify.mts`). ← motor y store ya escritos.
2. **Visor 3D + reproductor** (RF-1/RF-2): `Cube3D.tsx` con animación por movimiento y `AlgoPlayer.tsx` con notación, fases, controles y atajos. Validar con casos reales.
3. **Datos verificados** (§7): BFS para OLL/PLL/F2L, tablas finales, diagramas SVG generados, filtros 2-Look (RF-6).
4. **Progreso**: niveles de 3 barras (RF-8), watchlist (RF-7), barras agregadas, Watchlist page.
5. **Cronómetro + ranking** (RF-10/RF-11).
6. **Contenido pedagógico** de Cross, F2L (RF-9), OLL, PLL en español (texto escrito a mano, plantillas por etapa).
7. **Notación interactiva** (RF-3).
8. **Práctica** (cubo libre + scramble + timer).
9. **Pulido**: responsive, accesibilidad, reduced-motion, SEO básico, favicon, OG.
10. **Publicación**: git init, GitHub, Actions, Pages, README.

Cada fase termina con `npm run typecheck` y `npm run build` en verde.

---

## 14. Estado

**Decidido y pedido por el usuario**: RF-1..RF-12 de este documento. Recursos: guía CFOP de GANCUBE, tabla F2L 21 (imagen), tabla OLL 57 (imagen), tabla de notación (imagen), guía F2L de speedcube.quest.

**En el repo ahora**:
- `README.md` (resumen + arranque) · `project.md` (este documento) · `docs/fuentes.md` (recursos, enlaces,
  transcripción en bruto de F2L 21 y OLL 57 y notación, con los casos dudosos marcados) · `.gitignore`.
- `package.json` (deps fijadas, script `typecheck`), `vite.config.ts`, `tsconfig.json`, `index.html`.
- `src/cube/engine.ts` — motor completo (parse, apply, inverso, `caseState`, facelets, scramble, identidades).
- `src/store/progress.ts` — niveles 0/33/66/100, watchlist, tiempos, migración v1→v2, hooks.
- `node_modules` **incompleto**: la instalación quedó cortada (faltan vite/tsc/tsx binarios) → re-ejecutar `npm install` antes de trabajar.
- Falta todo lo demás (UI, visor 3D, datos, scripts, git).

**Pendiente de confirmar con el usuario**: nombre del repo y usuario/organización de GitHub; si el progreso debe compartirse entre dispositivos (hoy: no, por ser estático); si quiere que el cubo se pueda girar arrastrando caras desde la v1; idioma extra (inglés).

**Open objectives (abiertos)**: RF-1..RF-12 completos; publicar en GitHub Pages. Ninguno está terminado; la especificación es el primer entregable.
