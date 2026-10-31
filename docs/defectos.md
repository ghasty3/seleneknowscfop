# Estado medido y defectos conocidos

Documento de trabajo: lo que está comprobado, lo que está roto y qué hace falta
decidir. Todo lo de aquí se puede reproducir con los mandos del proyecto.

## Cómo comprobarlo

```bash
npm install --include=dev   # ver «Instalación» más abajo: si NODE_ENV=production, npm omite las devDependencies
npm run test                # typecheck + verify + verify:wca + verify:refs + verify:cube
npm run docs                # regenera docs/casos.md y docs/notacion.md desde src/data/
```

Mandos sueltos: `typecheck`, `verify`, `verify:verbose`, `verify:wca`,
`verify:refs`, `verify:cube`, `build`, `dev`, `preview`, `docs`.

## Estado de las comprobaciones (medido en este árbol)

| Mando | Resultado | Qué comprueba |
| --- | --- | --- |
| `typecheck` | verde (salida 0) | TypeScript 5.9.3, sin errores |
| `verify` | verde: **74 de 111** casos, 37 avisos de prerrequisito | el algoritmo de cada caso deja el cubo resuelto desde su plantado |
| `verify:refs` | verde | las imágenes de referencia existen y ninguna está compartida |
| `verify:wca` | **rojo**: 3a 48/48, **3b 44/48** | los plantados de última capa se comportan como un cubo real |
| `verify:cube` | **rojo**: **9 hechos** | aritmética del motor contra hechos del cubo real |
| `build` | verde | `tsc -b && vite build` compila el bundle |

Salida 1 de `verify:wca` y `verify:cube` significa que `npm run test` falla:
el motor todavía no reproduce la realidad en esos puntos. Es trabajo abierto,
no un problema de los datos ni de la web.

### Los 9 hechos que fallan (`verify:cube`, literal)

```
FALLO T-perm x2 = identidad
FALLO y = U E' D'
FALLO 338 voltea 2 aristas de arriba y 2 de la cruz (medido: 1+1)
FALLO 338 deja todas las piezas en su capa
FALLO R U R' U' saca la pareja del hueco FR a la capa U
FALLO la pareja queda con la blanca mirando a la izquierda
FALLO U' L' U L reinserta esa pareja
FALLO la pareja de la derecha queda con la blanca mirando a la derecha
FALLO U R U' R' reinserta la pareja derecha
```

Lectura: el motor acierta las órdenes de las caras y los ejes (los 22 hechos
de orden, inversos, identidades y equivalencias de cortes pasan), y falla en
dos familias de comportamiento:

- **Rotaciones del cubo entero.** `y` debería equivaler a `U E' D'`; el motor
  no lo produce. Ese hecho y `T-perm x2 = identidad` apuntan a la convención
  de las rotaciones (`x`, `y`, `z`) y su interacción con los cortes.
- **F2L con el hueco arriba.** `338` (`R U R' U' R' F R2 U' R' U' R U R' F'`)
  en un cubo real voltea dos aristas de arriba y dos de la cruz; el motor
  mide 1+1 y deja piezas fuera de su capa. Y la pareja sacada al hueco
  delantero-derecho por `R U R' U'` no acaba con la blanca mirando a la
  izquierda, ni `U' L' U L` la reinserta igual que en la derecha.
  El mismo síntoma en los cuatro casos = una sola causa probable:
  cómo coloca el motor las piezas al plantar y cómo afecta la orientación
  de la cara U a la pareja.

El gate WCA (`3b`, 44 de 48) es el mismo síntoma en los plantados de última
capa: en cuatro plantados la anilla central llega ya resuelta, así que la
foto del caso no es la posición de un cubo real.

Diagnóstico hecho (no arreglado): la siembra de causas apunta a
`src/cube/engine.ts` (tabla `MOVE_SPECS`, `parseAlg` y las rotaciones) y a la
manera de plantar los casos de F2L en `src/cube/caseUtils.ts`. Nada tocado en
esta sesión: se dejan los gates en rojo para no tapar el síntoma.

## Imágenes de referencia: defecto encontrado y arreglado

Encontrado (medido antes de tocar nada):

- `public/ref/` contiene **105 imágenes**: `ref/oll/` 57, `ref/pll/` 27,
  `ref/notation/` 21.
- Los casos de OLL y PLL apuntaban a muy pocas de esas imágenes y varias
  estaban mal asignadas: OLL **9 de 53** casos con referencia, PLL **8 de 21**.
- **5 imágenes compartidas** por casos distintos: `ref/oll/28.png` servía para
  OLL 19 y OLL 25; `ref/oll/33.png` para OLL 32 y OLL 39; `ref/oll/29.png`
  para OLL 6 y OLL 30; `ref/pll/Ua.png` para PLL Ua, Aa y Ab; `ref/pll/H.png`
  para PLL H y PLL E. Dos casos con la misma foto es información falsa.
- **13 referencias** con número que no coincidía con el código del caso
  (OLL 13 → `15.png`, OLL 16 → `37.png`, OLL 19 → `28.png`, OLL 25 → `28.png`,
  OLL 30 → `29.png`, OLL 32 → `33.png`, OLL 39 → `33.png`, OLL 42 → `41.png`,
  OLL 6 → `29.png`; PLL T → `Ra.png`, PLL E → `H.png`, PLL Aa y PLL Ab → `Ua.png`).

Arreglado con una transformación mecánica: la referencia de cada caso pasa a
señalar el fichero que corresponde a su código (`/ref/oll/19.png` para OLL 19,
`/ref/pll/T.png` para PLL T), y se añade a los casos que no la tenían.
Resultado medido con `npm run verify:refs`: OLL **53 de 53** con imagen y 0
desajustes, PLL **21 de 21** con imagen y 0 desajustes, ninguna compartida.

El gate `scripts/check-refs.mts` falla si una ruta no existe o si dos casos de
la misma etapa comparten imagen, e informa de los números que no coinciden con
el código.

Queda sin decidir: **ningún componente de la web usa esas imágenes**.
`src/components/CaseDiagram.tsx` dibuja la posición de las piezas de forma
procedimental y no lee el campo `ref`; las 21 imágenes de
`public/ref/notation/` no las consume nadie (`src/pages/NotationPage.tsx`
escribe la notación en texto). Opciones: mostrarlas como referencia de la
tabla de Gan junto al diagrama, o dejar el campo `ref` como metadato. No es
un fallo de datos, es una decisión de producto.

## F2L sin fotos de referencia

`src/data/f2l.ts` define los 21 casos sin campo `ref` y no existen imágenes
`public/ref/f2l/`. La ficha de F2L se apoya en el diagrama procedimental y en
la lectura escrita, así que no hay nada roto: es un hueco de contenido, y las
fotos del PDF de Cube Academy (`Cube+Academy+Free+F2L.pdf`, 11 páginas, solo
imágenes) serían la fuente si se quisiera rellenar.

## Instalación: por qué `npm run dev` podía fallar

`npm install` respondía «up to date» y dejaba `node_modules` con 29 paquetes,
sin `vite`, sin `typescript` y sin `tsx`: con `NODE_ENV=production` npm omite
las devDependencies (`npm config get omit` daba `dev`), y el proyecto solo
está en `dependencies` React y three.js. Con `npm install --include=dev` se
añadieron 130 paquetes y `npm run typecheck`, `verify` y `build` pasan.
Los mandos que solo usaban `npx tsx …` funcionaban por casualidad (npx
descarga tsx cada vez).

## Avisos de prerrequisito de `verify`

`verify` informa de 37 casos cuyo algoritmo parte de una posición que la web
no plantó exactamente (el algoritmo presupone, por ejemplo, la cruz hecha).
No hacen fallar el gate a propósito: son datos del material, no fallos del
motor. Se listan con `npm run verify:verbose`.

## Afirmaciones de la documentación que no se sostenían (corregidas en el README)

- El README afirmaba «0 de 48 plantados OLL con F2L resuelto». Medido hoy con
  `npm run verify:wca`: **44 de 48**. El gate sigue rojo, pero el punto de
  partida descrito estaba desactualizado.
- Afirmaba «111 fichas, 0 fallos duros · 73 pasan todo · 38 avisos». Medido:
  **74 pasan todo y 37 avisos**.
- Afirmaba «los tres PDF están en el repo sin commitear». Falso:
  `gancube-3x3-cfop-tutorial.pdf` **sí está versionado**, y con él los **105 PNG de
  GANCUBE** de `public/ref/`, que el propio README llama material de marca tercera
  a sustituir. Los otros dos PDF no están versionados.
- Describía `CaseDiagram.tsx` como «redes planas con marcadores». Hoy dibuja un
  diagrama procedimental por modo y **no consume las imágenes de referencia**, así
  que el desajuste de esas rutas pasó inadvertido en la web.

## Pendientes abiertos

1. Cerrar la convención del motor para que `verify:cube` y `verify:wca` den
   verde (9 hechos + 4 plantados).
2. Decidir el uso de las imágenes de referencia en la ficha del caso.
3. Revisar si los 4 OLL que faltan de la tabla de Gan (`53 de 57` casos en el
   repo) entran en el catálogo o se documenta la elección.
4. Elección de diseño pendiente sobre las flechas de permutación de los
   diagramas de PLL (petición del usuario, m00907).
