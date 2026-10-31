# Selene knows CFOP

Página web — **Selene knows CFOP** — para aprender el método **CFOP** (Cross → F2L → OLL → PLL)
de forma intuitiva.

La pieza central: encima de cada algoritmo hay un **cubo 3D funcional que lo ejecuta movimiento a
movimiento**, empezando desde el propio caso, de modo que el algoritmo termina con el cubo resuelto.

- Especificación completa (requisitos, decisiones técnicas, fases): **[project.md](./project.md)**
- Fuentes y transcripciones en bruto (imágenes del usuario, tablas, enlaces): **[docs/fuentes.md](./docs/fuentes.md)**

## Estado actual (fase 2 de 6)

Compila (`npm run typecheck` limpio), construye (`npm run build` → 72 KB gzip) y la web se ve.
Las 12 rutas existen y se navegan. **Falta** la parte pesada y conhecida: las **fórmulas de OLL y PLL
aún no son correctas** (ver *Verificación de datos*).

### Lo que ya está construido

| Pieza | Estado |
|---|---|
| Motor cúbico (`src/cube/engine.ts`) | ✅ 54 testes próprios: permutas, orden, espejo, M/S/R, clock, `rotate`, `stateSignature` |
| Utilidades de caso (`src/cube/caseUtils.ts`) | ✅ estado F2L, cruz, patrón de OLL/PLL, `uCell`, `applySetup` |
| Almacén de progreso (`src/store/progress.ts`) | ✅ niveles 0/33/66/100, watchlist, tiempos, mejores permutaciones, `localStorage` |
| Cubo 3D (`src/components/Cube3D.tsx`) | ✅ proxección isométrica, colores por cara, pegatinas interactivas |
| Cubo manipulable (`src/components/InteractiveCube.tsx`) | ✅ **arrastrar unha pegatina xira a súa capa**, clic = cara entera, arrastrar o fondo = xirar a vista, teclado `R U F B L D`, desfacer, plantar/remover, play-along, modo cruces |
| Reprodutor de algoritmo (`src/components/AlgoPlayer.tsx`) | ✅ animaciónmovemento a movemento, velocidade, bucle, paso a paso, fase de preparación |
| Diagrama 2D de caso (`src/components/CaseDiagram.tsx`) | ✅ redes planas con marcadores |
| Notación interactiva (`src/pages/Notation.tsx`) | ✅ símbolos que animan o seu movemento + lenda de dedos |
| Páxinas | ✅ Home, Method, Notation, Cross, F2L, OLL, PLL, CaseDetail, Reference, Algs, Trainer, Times, Clock, Mirror, Practice |
| Verificación automática de datos (`scripts/verify.mts`) | ✅ portaría que executa cada algoritmo no motor |
| Práctica guiada (`src/pages/Practice.tsx`) | ✅ cubo libre / play-along / só cruces, cronómetro, Rexistro de tempos |

### Rutas da web

`#/` inicio · `#/metodo` · `#/notacion` · `#/cross` · `#/f2l` · `#/oll` · `#/pll` ·
`#/practicar` · `#/entrenar` (cronómetro) · `#/algs` (miñas watchlist) · `#/tablas` (espejos e reloxo)

## Verificación de datos

```bash
npm run verify     # executa cada algoritmo sobre o seu estado de caso no motor
```

Resultado de hoxe: **19 de 103 casos pasan**.

| Etapa | Casos | Pasan | Diagnóstico |
|---|---|---|---|
| Cross | 6 | 6 | ✅ |
| F2L | 21 | 12 | ✅ maioría; 9 casos con estado de caso mal declarado |
| OLL | 61 | 1 | ⚠️ as fórmulas transcritas da imaxe non chegan |
| PLL | 15 | 0 | ⚠️ idem |

**Por que falla OLL/PLL:** as imaxes de referencia dan *varias fórmulas alternativas* por caso sen
indicar a **configuración exacta da cara U** (qué pezas están onde). Unha fórmula só é correcta para
unha configuración concreta, así que hai que fixar cada configuración á man (estado U2/U/R2/B de
referencia) e entón a fórmula queda verificada. É traballo de precisión, non de código: o verificador
xa detecta cal é o desvio.

## Arranque

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc -b
npm run verify     # comprobación de datos
npm run build      # dist/ (publicable en GitHub Pages)
```

## Camiño restante

1. **F2L**: axustar os 9 estados de caso que fallan (rápido, o verificador dinos un a un).
2. **OLL 2-Look** (collar + orientación de cruz + os 7+7 casos): fixar configuracións e verificar.
   É o subconxunto que case todos usan para aprender.
3. **OLL completo 57** e **PLL 21**: mesmo proceso, coa lista dos que queden pendentes.
4. Fingertricks por alg, atallos de teclado, exportar/importar progreso.
5. GitHub Pages e publicación.

## Estilo e decisiones

- Modo escuro minimalista con acentos morados escuros (`src/styles/global.css`, variables `--bg`,
  `--accent`, `--accent-strong`).
- React + Vite + TypeScript, Sen backend. Todo en `localStorage` do navegador de cada persoa: non hai
  sincronización entre dispositivos.
- Idioma da interface: galego/castelán segundo indicacións do usuario.
- `NODE_ENV` non pode estar en `production` ao instalar dependencias (Vite require `esbuild`).

El progreso y los tiempos se guardan en `localStorage` del navegador de cada persona: no se sincronizan
entre dispositivos (no hay backend).

## Comprobaciones abiertas (motor de cubos)

`npm run verify` separa dos niveles:

- **Obligatorios** (fallan el build): cada algoritmo publicado cierra su plantado
  (`plantado + alg = cubo resuelto`), ningún plantado es trivial, y los grupos de OLL
  cumplen lo que prometen. Con los datos de hoy: **0 fallos en 111 fichas**
  (Cross 6, F2L 21, OLL 53, PLL 21, 1-look 2, PLL de reloj 8).
- **Avisos de prerequisito**: 38 fichas avisan (se listan con `npm run verify -- --verbose`).
  Son de dos tipos y los dos son investigación abierta, no datos malos:
  1. Algoritmos PLL que mueven piezas fuera de la última capa en cualquier conjugación por
     `x`/`y`/`z` (20 fichas). La permutación declarada y el cierre del plantado sí cuadran.
  2. Fichas F2L cuyo plantado, según el heurístico de patrón, no encaja con la descripción
     literal del hueco/par (9 fichas).

Es la convención de ciclos de cara del motor (`src/cube/engine.ts`, `MOVE_SPECS`) la que está
en revisión: es internamente coherente (identidad, inversa, `alg + inversa = resuelto`) pero hay
que contrastarla contra un modelo de referencia para que los prerequisitos canónicos den verde.
Herramientas: `scripts/verify.mts`, `scripts/contrast.mts`, `scripts/fixtures/cubzor-{oll,pll}.json`.
Vista canónica de un plantado con preparación: `canonicalView()` y `canonicalizeState()` en
`src/cube/caseUtils.ts` (rota el cubo entero hasta el marco canónico y auto-comprueba que la
secuencia jugada cierra; si no cierra, devuelve el plantado crudo).
