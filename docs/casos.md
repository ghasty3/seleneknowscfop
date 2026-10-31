# Catálogo de casos

Contenido de `src/data/`, extraído por `npm run docs`. Es el mismo material que
muestra la web, en formato editable: sirve para revisar textos, añadir
algoritmos y verificar la clasificación sin abrir el navegador.

Los estados esperados (`expect`) son los que comprueba `npm run verify`: el
algoritmo, aplicado al cubo plantado del caso, debe dejar el cubo resuelto.
Los casos marcados *generado por simetría* los fabrica el motor aplicando el
espejo R↔L; no son datos escritos a mano.

## Cruz (cross) — 6 casos

Seis posiciones de la arista blanco-verde con el verde de frente.

### cross · F2 — Blanco mirando al frente
- Grupo: arista arriba
- Lectura: La arista blanca está arriba con el blanco de frente: dos medias vueltas de la cara frontal.
- Consejos: Localiza primero el hueco de abajo antes de tocar nada. · Con el blanco mirando a tu cara, F2 lo resuelve sin pensar.
- Estado esperado: `cross`
- Algoritmo 1: `F2`

### cross · B2 — Blanco mirando atrás
- Grupo: arista arriba
- Lectura: Mismo caso con la arista en la cara trasera: B2.
- Estado esperado: `cross`
- Algoritmo 1: `B2`

### cross · U' F2 U — Blanco arriba, hueco a la derecha
- Grupo: arista arriba
- Lectura: Alineas el blanco con su centro y metes con dos medias vueltas.
- Consejos: Primero alinea la arista con el centro de su color, luego F2.
- Estado esperado: `cross`
- Algoritmo 1: `U' F2 U`

### cross · U2 F2 U2 — Blanco arriba, hueco enfrente
- Grupo: arista arriba
- Lectura: Alineación de 180° y media vuelta frontal.
- Estado esperado: `cross`
- Algoritmo 1: `U2 F2 U2`

### cross · R2 — Blanco a la derecha
- Grupo: arista arriba
- Lectura: Igual que F2 pero con la cara derecha.
- Estado esperado: `cross`
- Algoritmo 1: `R2`

### cross · L2 — Blanco a la izquierda
- Grupo: arista arriba
- Lectura: Igual que F2 pero con la cara izquierda.
- Estado esperado: `cross`
- Algoritmo 1: `L2`

## F2L — 21 casos

Pares colocados; el resto de los 41 pares se generan por simetría desde estos.

### f2l · Ua — Ua
- Grupo: par en U, hueco libre
- Lectura: El par entra por la cara frontal con el corte M.
- Estado esperado: `f2l-top`
- Algoritmo 1: `M2 U M2 U2 M2 U M2 U2`

### f2l · Ub — Ub
- Grupo: par en U, hueco libre
- Lectura: Espejo de Ua: el par entra por la derecha con el corte M.
- Estado esperado: `f2l-top`
- Algoritmo 1: `M2 U' M2 U2 M2 U' M2 U2`

### f2l · H — H
- Grupo: par en U, hueco libre
- Lectura: Esquina y arista en la misma cara, la arista por delante.
- Estado esperado: `f2l-top`
- Algoritmo 1: `M2 U M2 U2 M2 U M2`

### f2l · Z — Z
- Grupo: par en U, hueco libre
- Lectura: Esquina y arista en caras contrarias, apuntando al mismo hueco.
- Estado esperado: `f2l-top`
- Algoritmo 1: `M' U M2 U2 M' U2 M2 U'`

### f2l · Aa — Aa
- Grupo: par en U, colores paralelos
- Lectura: Colores paralelos: hay que girar el cubo (x’) para insertar.
- Estado esperado: `f2l-top`
- Algoritmo 1: `x' R2 D2 R' U' R D2 R' U R`

### f2l · Ab — Ab
- Grupo: par en U, colores paralelos
- Lectura: Variante con la arista ya orientada hacia su hueco.
- Estado esperado: `f2l-top`
- Algoritmo 1: `x' R U' R' D2 R' U R D2 R2`

### f2l · E — E
- Grupo: par en U, colores paralelos
- Lectura: Colores paralelos con la esquina abierta a la izquierda.
- Estado esperado: `f2l-top`
- Algoritmo 1: `x' R U' R' D R U R' D' R U R' D`

### f2l · T — T
- Grupo: colores en «T», arista a la derecha
- Lectura: La arista mira al frente y la esquina está a su derecha.
- Estado esperado: `f2l-top`
- Algoritmo 1: `R U R' U' R' F R2 U' R' U' R U R' F'`

### f2l · F — F
- Grupo: colores en «T», arista a la izquierda
- Lectura: La arista mira a la derecha y la esquina está a su izquierda.
- Estado esperado: `f2l-top`
- Algoritmo 1: `R' U F' U' R F R2 U' R' U R U R' U`

### f2l · V — V
- Grupo: colores en «V», juntos en U
- Lectura: Esquina y arista juntas, ambas mirando al hueco.
- Estado esperado: `f2l-top`
- Algoritmo 1: `R' U R' U' R' F' U' R U2 R R U R'`

### f2l · Y — Y
- Grupo: colores en «V», separados en U
- Lectura: Esquina y arista en lados opuestos del hueco.
- Estado esperado: `f2l-top`
- Algoritmo 1: `F R U' R' U R U R' F' R' F R' F'`

### f2l · Ja — Ja
- Grupo: colores «J», arista a la izquierda
- Lectura: Arista y esquina en línea, la arista tocando la cara frontal.
- Estado esperado: `f2l-top`
- Algoritmo 1: `z U' R D' R2 U R' U' R2 U D R'`

### f2l · Jb — Jb
- Grupo: colores «J», arista a la derecha
- Lectura: Arista y esquina en línea, la arista separada del hueco.
- Estado esperado: `f2l-top`
- Algoritmo 1: `R U R' F R U R' U' R' F R2 U' R' U'`

### f2l · Ra — Ra
- Grupo: colores en «R», esquina arriba
- Lectura: Esquina sobre la arista, las dos en la cara frontal.
- Estado esperado: `f2l-top`
- Algoritmo 1: `R U' R' U R U R D R' U' R D' R' U2 R' U`

### f2l · Rb — Rb
- Grupo: colores en «R», arista arriba
- Lectura: Arista sobre la esquina, las dos en la cara frontal.
- Estado esperado: `f2l-top`
- Algoritmo 1: `R' U2 R U' R' R' F R U R' U' R F' R2 U'`

### f2l · Gc — Gc
- Grupo: par dentro del hueco
- Lectura: El par está dentro, mal unido: hay que sacarlo y volver a meterlo.
- Estado esperado: `f2l-slot`
- Algoritmo 1: `R2 U' R U R U R' U R2 f R' f`

### f2l · Gd — Gd
- Grupo: par dentro del hueco
- Lectura: Par dentro, esquina y arista cruzadas por la cara derecha.
- Estado esperado: `f2l-slot`
- Algoritmo 1: `R U R y' R2 U R U R' U' u' R R2`

### f2l · Ga — Ga
- Grupo: par dentro del hueco
- Lectura: Par dentro con la arista volteada: sale por arriba y vuelve a entrar.
- Estado esperado: `f2l-slot`
- Algoritmo 1: `R2 U R' U R' U' R' R2 U' D R' U R D' U`

### f2l · Gb — Gb
- Grupo: par dentro del hueco
- Lectura: Par dentro con la esquina volteada.
- Estado esperado: `f2l-slot`
- Algoritmo 1: `R' d' F R2 U R' U R U' R U' R2`

### f2l · Na — Na
- Grupo: par bloqueado en el hueco
- Lectura: El par está bloqueado: hay que abrir la pared, liberarlo y cerrar.
- Estado esperado: `f2l-slot`
- Algoritmo 1: `R U R' U R U R' F' R U R' R' F R2 U' R' U2 R U' R`

### f2l · Nb — Nb
- Grupo: par bloqueado en el hueco
- Lectura: Variante bloqueada por la cara frontal.
- Estado esperado: `f2l-slot`
- Algoritmo 1: `R' U R U' R' F' U F R U R' F`

## OLL en dos miradas — 5 casos

Atajo para el nivel básico: primero cruz, luego esquinas.

### oll (2 look) · 2L-1 — Barra → cruz
- Grupo: cruz amarilla
- Lectura: Dos aristas amarillas enfrentadas. Es la base de las otras dos.
- Consejos: Se aplica con la barra mirándote, horizontal.
- Estado esperado: `oll`
- Probabilidad: 1/8 (de las siete cruces amarillas)
- Algoritmo 1: `F R U R' U' F'`

### oll (2 look) · 2L-2 — L → cruz
- Grupo: cruz amarilla
- Lectura: Aristas amarillas en la izquierda y detrás: gira el cubo y la misma fórmula.
- Consejos: Coloca la L en la esquina frontal-izquierda y aplica la fórmula de la barra.
- Estado esperado: `oll`
- Probabilidad: 1/8
- Algoritmo 1: `F R U R' U' F'`

### oll (2 look) · 2L-3 — Punto → L
- Grupo: cruz amarilla
- Lectura: Ninguna arista amarilla: primero convierte el punto en L.
- Consejos: Después del punto ya tienes L: aplica la fórmula anterior.
- Estado esperado: `oll`
- Probabilidad: 1/8
- Algoritmo 1: `f R U R' U' f'`

### oll (2 look) · 2L-4 — Sune (esquinas)
- Grupo: orientation de esquinas
- Lectura: Con la cruz hecha, 3 esquinas torcidas. La fórmula más rentable de todo el CFOP.
- Consejos: La esquina ya orientada va detrás a la derecha. Setup: y U2, y’ U, x’ U.
- Estado esperado: `oll`
- Algoritmo 1: `R U R' U R U2 R'`

### oll (2 look) · 2L-5 — Antisune (esquinas)
- Grupo: orientation de esquinas
- Lectura: Las 3 esquinas torcidas al revés: misma mano con U2 al principio.
- Consejos: Se reconoce porque la esquina orientada queda delante a la izquierda.
- Estado esperado: `oll`
- Algoritmo 1: `R U2 R' U' R U' R'`

## OLL (57) — 53 casos

Los 57 casos completos, nombrados según las tablas de Gan.

### oll · 1 — OLL 1
- Estado esperado: `oll`
- Probabilidad: 1/54 (OLL resuelto)
- Ilustración de referencia: `/ref/oll/1.png`
- Algoritmo 1: `R U2 R2 F R F' U2 R' F R F'`
- Algoritmo 2: `U R U2 R2 F R F' U2 R' F R F' U'`
- Algoritmo 3: `U2 R U2 R2 F R F' U2 R' F R F' U2`
- Algoritmo 4: `U' R U2 R2 F R F' U2 R' F R F' U`

### oll · 2 — OLL 2
- Estado esperado: `oll`
- Probabilidad: 1/54
- Ilustración de referencia: `/ref/oll/2.png`
- Algoritmo 1: `F R U R' U' F' f R U R' U' f'`
- Algoritmo 2: `U F R U R' U' F' f R U R' U' f' U'`
- Algoritmo 3: `U2 F R U R' U' F' f R U R' U' f' U2`
- Algoritmo 4: `U' F R U R' U' F' f R U R' U' f' U`

### oll · 3 — OLL 3
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/3.png`
- Algoritmo 1: `f R U R' U' f' U' F R U R' U' F'`
- Algoritmo 2: `U f R U R' U' f' U' F R U R' U' F' U'`
- Algoritmo 3: `U2 f R U R' U' f' U' F R U R' U' F' U2`
- Algoritmo 4: `U' f R U R' U' f' U' F R U R' U' F' U`

### oll · 4 — OLL 4
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/4.png`
- Algoritmo 1: `f R U R' U' f' U F R U R' U' F'`
- Algoritmo 2: `U f R U R' U' f' U F R U R' U' F' U'`
- Algoritmo 3: `U2 f R U R' U' f' U F R U R' U' F' U2`
- Algoritmo 4: `U' f R U R' U' f' U F R U R' U' F' U`

### oll · 17 — OLL 17
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/17.png`
- Algoritmo 1: `R U R' U R' F R F' U2 R' F R F'`
- Algoritmo 2: `U R U R' U R' F R F' U2 R' F R F' U'`
- Algoritmo 3: `U2 R U R' U R' F R F' U2 R' F R F' U2`
- Algoritmo 4: `U' R U R' U R' F R F' U2 R' F R F' U`

### oll · 18 — OLL 18
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/18.png`
- Algoritmo 1: `r U R' U R U2 r2 U' R U' R' U2 r`
- Algoritmo 2: `U r U R' U R U2 r2 U' R U' R' U2 r U'`
- Algoritmo 3: `U2 r U R' U R U2 r2 U' R U' R' U2 r U2`
- Algoritmo 4: `U' r U R' U R U2 r2 U' R U' R' U2 r U`

### oll · 19 — OLL 19
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/19.png`
- Algoritmo 1: `M U R U R' U' M' R' F R F'`
- Algoritmo 2: `U M U R U R' U' M' R' F R F' U'`
- Algoritmo 3: `U2 M U R U R' U' M' R' F R F' U2`
- Algoritmo 4: `U' M U R U R' U' M' R' F R F' U`

### oll · 20 — OLL 20
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/20.png`
- Algoritmo 1: `M U R U R' U' M2 U R U' r'`
- Algoritmo 2: `U M U R U R' U' M2 U R U' r' U'`
- Algoritmo 3: `U2 M U R U R' U' M2 U R U' r' U2`
- Algoritmo 4: `U' M U R U R' U' M2 U R U' r' U`

### oll · 51 — OLL 51
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/51.png`
- Algoritmo 1: `f R U R' U' R U R' U' f'`
- Algoritmo 2: `U f R U R' U' R U R' U' f' U'`
- Algoritmo 3: `U2 f R U R' U' R U R' U' f' U2`
- Algoritmo 4: `U' f R U R' U' R U R' U' f' U`

### oll · 52 — OLL 52
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/52.png`
- Algoritmo 1: `R U R' U R U' B U' B' R'`
- Algoritmo 2: `U R U R' U R U' B U' B' R' U'`
- Algoritmo 3: `U2 R U R' U R U' B U' B' R' U2`
- Algoritmo 4: `U' R U R' U R U' B U' B' R' U`

### oll · 55 — OLL 55
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/55.png`
- Algoritmo 1: `R U2 R2 U' R U' R' U2 F R F'`
- Algoritmo 2: `U R U2 R2 U' R U' R' U2 F R F' U'`
- Algoritmo 3: `U2 R U2 R2 U' R U' R' U2 F R F' U2`
- Algoritmo 4: `U' R U2 R2 U' R U' R' U2 F R F' U`

### oll · 56 — OLL 56
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/56.png`
- Algoritmo 1: `r U r' U R U' R' U R U' R' r U' r'`
- Algoritmo 2: `U r U r' U R U' R' U R U' R' r U' r' U'`
- Algoritmo 3: `U2 r U r' U R U' R' U R U' R' r U' r' U2`
- Algoritmo 4: `U' r U r' U R U' R' U R U' R' r U' r' U`

### oll · 28 — OLL 28
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/28.png`
- Algoritmo 1: `r U R' U' r' R U R U' R'`
- Algoritmo 2: `U r U R' U' r' R U R U' R' U'`
- Algoritmo 3: `U2 r U R' U' r' R U R U' R' U2`
- Algoritmo 4: `U' r U R' U' r' R U R U' R' U`

### oll · 57 — OLL 57
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/57.png`
- Algoritmo 1: `R U R' U' M' U R U' r'`
- Algoritmo 2: `U R U R' U' M' U R U' r' U'`
- Algoritmo 3: `U2 R U R' U' M' U R U' r' U2`
- Algoritmo 4: `U' R U R' U' M' U R U' r' U`

### oll · 48 — OLL 48
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/48.png`
- Algoritmo 1: `F R U R' U' R U R' U' F'`
- Algoritmo 2: `U F R U R' U' R U R' U' F' U'`
- Algoritmo 3: `U2 F R U R' U' R U R' U' F' U2`
- Algoritmo 4: `U' F R U R' U' R U R' U' F' U`

### oll · 47 — OLL 47
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/47.png`
- Algoritmo 1: `F' L' U' L U L' U' L U F`
- Algoritmo 2: `U F' L' U' L U L' U' L U F U'`
- Algoritmo 3: `U2 F' L' U' L U L' U' L U F U2`
- Algoritmo 4: `U' F' L' U' L U L' U' L U F U`

### oll · 49 — OLL 49
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/49.png`
- Algoritmo 1: `r U' r2 U r2 U r2 U' r`
- Algoritmo 2: `U r U' r2 U r2 U r2 U' r U'`
- Algoritmo 3: `U2 r U' r2 U r2 U r2 U' r U2`
- Algoritmo 4: `U' r U' r2 U r2 U r2 U' r U`

### oll · 50 — OLL 50
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/50.png`
- Algoritmo 1: `r' U r2 U' r2 U' r2 U r'`
- Algoritmo 2: `U r' U r2 U' r2 U' r2 U r' U'`
- Algoritmo 3: `U2 r' U r2 U' r2 U' r2 U r' U2`
- Algoritmo 4: `U' r' U r2 U' r2 U' r2 U r' U`

### oll · 53 — OLL 53
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/53.png`
- Algoritmo 1: `r' U' R U' R' U R U' R' U2 r`
- Algoritmo 2: `U r' U' R U' R' U R U' R' U2 r U'`
- Algoritmo 3: `U2 r' U' R U' R' U R U' R' U2 r U2`
- Algoritmo 4: `U' r' U' R U' R' U R U' R' U2 r U`

### oll · 54 — OLL 54
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/54.png`
- Algoritmo 1: `r U R' U R U' R' U R U2 r'`
- Algoritmo 2: `U r U R' U R U' R' U R U2 r' U'`
- Algoritmo 3: `U2 r U R' U R U' R' U R U2 r' U2`
- Algoritmo 4: `U' r U R' U R U' R' U R U2 r' U`

### oll · 35 — OLL 35
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/35.png`
- Algoritmo 1: `R U2 R2 F R F' R U2 R'`
- Algoritmo 2: `U R U2 R2 F R F' R U2 R' U'`
- Algoritmo 3: `U2 R U2 R2 F R F' R U2 R' U2`
- Algoritmo 4: `U' R U2 R2 F R F' R U2 R' U`

### oll · 33 — OLL 33
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/33.png`
- Algoritmo 1: `R U R' U' R' F R F'`
- Algoritmo 2: `U R U R' U' R' F R F' U'`
- Algoritmo 3: `U2 R U R' U' R' F R F' U2`
- Algoritmo 4: `U' R U R' U' R' F R F' U`

### oll · 45 — OLL 45
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/45.png`
- Algoritmo 1: `F R U R' U' F'`
- Algoritmo 2: `U F R U R' U' F' U'`
- Algoritmo 3: `U2 F R U R' U' F' U2`
- Algoritmo 4: `U' F R U R' U' F' U`

### oll · 44 — OLL 44
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/44.png`
- Algoritmo 1: `f R U R' U' f'`
- Algoritmo 2: `U f R U R' U' f' U'`
- Algoritmo 3: `U2 f R U R' U' f' U2`
- Algoritmo 4: `U' f R U R' U' f' U`

### oll · 43 — OLL 43
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/43.png`
- Algoritmo 1: `f' L' U' L U f`
- Algoritmo 2: `U f' L' U' L U f U'`
- Algoritmo 3: `U2 f' L' U' L U f U2`
- Algoritmo 4: `U' f' L' U' L U f U`

### oll · 34 — OLL 34
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/34.png`
- Algoritmo 1: `R U R2 U' R' F R U R U' F'`
- Algoritmo 2: `U R U R2 U' R' F R U R U' F' U'`
- Algoritmo 3: `U2 R U R2 U' R' F R U R U' F' U2`
- Algoritmo 4: `U' R U R2 U' R' F R U R U' F' U`

### oll · 46 — OLL 46
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/46.png`
- Algoritmo 1: `R' U' R' F R F' U R`
- Algoritmo 2: `U R' U' R' F R F' U R U'`
- Algoritmo 3: `U2 R' U' R' F R F' U R U2`
- Algoritmo 4: `U' R' U' R' F R F' U R U`

### oll · 38 — OLL 38
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/38.png`
- Algoritmo 1: `R U R' U R U' R' U' R' F R F'`
- Algoritmo 2: `U R U R' U R U' R' U' R' F R F' U'`
- Algoritmo 3: `U2 R U R' U R U' R' U' R' F R F' U2`
- Algoritmo 4: `U' R U R' U R U' R' U' R' F R F' U`

### oll · 36 — OLL 36
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/36.png`
- Algoritmo 1: `L' U' L U' L' U L U L F' L' F`
- Algoritmo 2: `U L' U' L U' L' U L U L F' L' F U'`
- Algoritmo 3: `U2 L' U' L U' L' U L U L F' L' F U2`
- Algoritmo 4: `U' L' U' L U' L' U L U L F' L' F U`

### oll · 22 — OLL 22
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/22.png`
- Algoritmo 1: `R U2 R2 U' R2 U' R2 U2 R`
- Algoritmo 2: `U R U2 R2 U' R2 U' R2 U2 R U'`
- Algoritmo 3: `U2 R U2 R2 U' R2 U' R2 U2 R U2`
- Algoritmo 4: `U' R U2 R2 U' R2 U' R2 U2 R U`

### oll · 24 — OLL 24
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/24.png`
- Algoritmo 1: `r U R' U' r' F R F'`
- Algoritmo 2: `U r U R' U' r' F R F' U'`
- Algoritmo 3: `U2 r U R' U' r' F R F' U2`
- Algoritmo 4: `U' r U R' U' r' F R F' U`

### oll · 25 — OLL 25
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/25.png`
- Algoritmo 1: `F' r U R' U' r' F R`
- Algoritmo 2: `U F' r U R' U' r' F R U'`
- Algoritmo 3: `U2 F' r U R' U' r' F R U2`
- Algoritmo 4: `U' F' r U R' U' r' F R U`

### oll · 13 — OLL 13
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/13.png`
- Algoritmo 1: `r U' r' U' r U r' F' U F`
- Algoritmo 2: `U r U' r' U' r U r' F' U F U'`
- Algoritmo 3: `U2 r U' r' U' r U r' F' U F U2`
- Algoritmo 4: `U' r U' r' U' r U r' F' U F U`

### oll · 14 — OLL 14
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/14.png`
- Algoritmo 1: `R' F R U R' F' R F U' F'`
- Algoritmo 2: `U R' F R U R' F' R F U' F' U'`
- Algoritmo 3: `U2 R' F R U R' F' R F U' F' U2`
- Algoritmo 4: `U' R' F R U R' F' R F U' F' U`

### oll · 15 — OLL 15
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/15.png`
- Algoritmo 1: `r' U' r R' U' R U r' U r`
- Algoritmo 2: `U r' U' r R' U' R U r' U r U'`
- Algoritmo 3: `U2 r' U' r R' U' R U r' U r U2`
- Algoritmo 4: `U' r' U' r R' U' R U r' U r U`

### oll · 16 — OLL 16
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/16.png`
- Algoritmo 1: `r U r' R U R' U' r U' r'`
- Algoritmo 2: `U r U r' R U R' U' r U' r' U'`
- Algoritmo 3: `U2 r U r' R U R' U' r U' r' U2`
- Algoritmo 4: `U' r U r' R U R' U' r U' r' U`

### oll · 31 — OLL 31
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/31.png`
- Algoritmo 1: `R' U' F U R U' R' F' R`
- Algoritmo 2: `U R' U' F U R U' R' F' R U'`
- Algoritmo 3: `U2 R' U' F U R U' R' F' R U2`
- Algoritmo 4: `U' R' U' F U R U' R' F' R U`

### oll · 32 — OLL 32
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/32.png`
- Algoritmo 1: `R U B' U' R' U R B R'`
- Algoritmo 2: `U R U B' U' R' U R B R' U'`
- Algoritmo 3: `U2 R U B' U' R' U R B R' U2`
- Algoritmo 4: `U' R U B' U' R' U R B R' U`

### oll · 29 — OLL 29
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/29.png`
- Algoritmo 1: `R U R' U' R U' R' F' U' F R U R'`
- Algoritmo 2: `U R U R' U' R U' R' F' U' F R U R' U'`
- Algoritmo 3: `U2 R U R' U' R U' R' F' U' F R U R' U2`
- Algoritmo 4: `U' R U R' U' R U' R' F' U' F R U R' U`

### oll · 30 — OLL 30
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/30.png`
- Algoritmo 1: `F R' F R2 U' R' U' R U R' F2`
- Algoritmo 2: `U F R' F R2 U' R' U' R U R' F2 U'`
- Algoritmo 3: `U2 F R' F R2 U' R' U' R U R' F2 U2`
- Algoritmo 4: `U' F R' F R2 U' R' U' R U R' F2 U`

### oll · 41 — OLL 41
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/41.png`
- Algoritmo 1: `R U R' U R U2 R' F R U R' U' F'`
- Algoritmo 2: `U R U R' U R U2 R' F R U R' U' F' U'`
- Algoritmo 3: `U2 R U R' U R U2 R' F R U R' U' F' U2`
- Algoritmo 4: `U' R U R' U R U2 R' F R U R' U' F' U`

### oll · 42 — OLL 42
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/42.png`
- Algoritmo 1: `R' U' R U' R' U2 R F R U R' U' F'`
- Algoritmo 2: `U R' U' R U' R' U2 R F R U R' U' F' U'`
- Algoritmo 3: `U2 R' U' R U' R' U2 R F R U R' U' F' U2`
- Algoritmo 4: `U' R' U' R U' R' U2 R F R U R' U' F' U`

### oll · 7 — OLL 7
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/7.png`
- Algoritmo 1: `r U R' U R U2 r'`
- Algoritmo 2: `U r U R' U R U2 r' U'`
- Algoritmo 3: `U2 r U R' U R U2 r' U2`
- Algoritmo 4: `U' r U R' U R U2 r' U`

### oll · 8 — OLL 8
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/8.png`
- Algoritmo 1: `r' U' R U' R' U2 r`
- Algoritmo 2: `U r' U' R U' R' U2 r U'`
- Algoritmo 3: `U2 r' U' R U' R' U2 r U2`
- Algoritmo 4: `U' r' U' R U' R' U2 r U`

### oll · 9 — OLL 9
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/9.png`
- Algoritmo 1: `R U R' U' R' F R2 U R' U' F'`
- Algoritmo 2: `U R U R' U' R' F R2 U R' U' F' U'`
- Algoritmo 3: `U2 R U R' U' R' F R2 U R' U' F' U2`
- Algoritmo 4: `U' R U R' U' R' F R2 U R' U' F' U`

### oll · 10 — OLL 10
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/10.png`
- Algoritmo 1: `R U R' U R' F R F' R U2 R'`
- Algoritmo 2: `R U R' U R' F R F'`
- Algoritmo 3: `U R U R' U R' F R F' R U2 R' U'`
- Algoritmo 4: `U2 R U R' U R' F R F' R U2 R' U2`

### oll · 11 — OLL 11
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/11.png`
- Algoritmo 1: `r U R' U R' F R F' R U2 r'`
- Algoritmo 2: `U r U R' U R' F R F' R U2 r' U'`
- Algoritmo 3: `U2 r U R' U R' F R F' R U2 r' U2`
- Algoritmo 4: `U' r U R' U R' F R F' R U2 r' U`

### oll · 12 — OLL 12
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/12.png`
- Algoritmo 1: `F R U R' U' F' U F R U R' U' F'`
- Algoritmo 2: `U F R U R' U' F' U F R U R' U' F' U'`
- Algoritmo 3: `U2 F R U R' U' F' U F R U R' U' F' U2`
- Algoritmo 4: `U' F R U R' U' F' U F R U R' U' F' U`

### oll · 5 — OLL 5
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/5.png`
- Algoritmo 1: `r' U2 R U R' U r`
- Algoritmo 2: `U r' U2 R U R' U r U'`
- Algoritmo 3: `U2 r' U2 R U R' U r U2`
- Algoritmo 4: `U' r' U2 R U R' U r U`

### oll · 6 — OLL 6
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/6.png`
- Algoritmo 1: `r U2 R' U' R U' r'`
- Algoritmo 2: `U r U2 R' U' R U' r' U'`
- Algoritmo 3: `U2 r U2 R' U' R U' r' U2`
- Algoritmo 4: `U' r U2 R' U' R U' r' U`

### oll · 37 — OLL 37
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/37.png`
- Algoritmo 1: `F R U' R' U' R U R' F'`
- Algoritmo 2: `U F R U' R' U' R U R' F' U'`
- Algoritmo 3: `U2 F R U' R' U' R U R' F' U2`
- Algoritmo 4: `U' F R U' R' U' R U R' F' U`

### oll · 39 — OLL 39
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/39.png`
- Algoritmo 1: `L F' L' U' L U F U' L'`
- Algoritmo 2: `U L F' L' U' L U F U' L' U'`
- Algoritmo 3: `U2 L F' L' U' L U F U' L' U2`
- Algoritmo 4: `U' L F' L' U' L U F U' L' U`

### oll · 40 — OLL 40
- Estado esperado: `oll`
- Ilustración de referencia: `/ref/oll/40.png`
- Algoritmo 1: `R' F R U R' U' F' U R`
- Algoritmo 2: `U R' F R U R' U' F' U R U'`
- Algoritmo 3: `U2 R' F R U R' U' F' U R U2`
- Algoritmo 4: `U' R' F R U R' U' F' U R U`

## PLL (21) — 21 casos

Permutas de la última capa: adyacentes, opuestas, diagonal y ciclos.

### pll · Ua — PLL Ua
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Ua.png`
- Algoritmo 1: `R U' R U R U R U' R' U' R2`

### pll · Ub — PLL Ub
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Ub.png`
- Algoritmo 1: `R2 U R U R' U' R' U' R' U R'`

### pll · H — PLL H
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/H.png`
- Algoritmo 1: `M2 U M2 U2 M2 U M2`
- Algoritmo 2: `U M2 U M2 U2 M2 U M2 U'`
- Algoritmo 3: `U2 M2 U M2 U2 M2 U M2 U2`
- Algoritmo 4: `U' M2 U M2 U2 M2 U M2 U`

### pll · Z — PLL Z
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Z.png`
- Algoritmo 1: `M' U M2 U M2 U M' U2 M2`

### pll · T — PLL T
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/T.png`
- Algoritmo 1: `R U R' U' R' F R2 U' R' U' R U R' F'`

### pll · Ja — PLL Ja
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Ja.png`
- Algoritmo 1: `R' U L' U2 R U' R' U2 R L`

### pll · Jb — PLL Jb
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Jb.png`
- Algoritmo 1: `R U R' F' R U R' U' R' F R2 U' R'`

### pll · Ra — PLL Ra
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Ra.png`
- Algoritmo 1: `R U R' F' R U2 R' U2 R' F R U R U2 R'`

### pll · Rb — PLL Rb
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Rb.png`
- Algoritmo 1: `R' U2 R U2 R' F R U R' U' R' F' R2`

### pll · F — PLL F
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/F.png`
- Algoritmo 1: `R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R`

### pll · Ga — PLL Ga
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Ga.png`
- Algoritmo 1: `R2 U R' U R' U' R U' R2 D U' R' U R D'`

### pll · Gb — PLL Gb
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Gb.png`
- Algoritmo 1: `R' U' R U D' R2 U R' U R U' R U' R2 D`

### pll · Gc — PLL Gc
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Gc.png`
- Algoritmo 1: `R2 U' R U' R U R' U R2 D' U R U' R' D`

### pll · Gd — PLL Gd
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Gd.png`
- Algoritmo 1: `R U R' U' D R2 U' R U' R' U R' U R2 D'`

### pll · Aa — PLL Aa
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Aa.png`
- Algoritmo 1: `x R' U R' D2 R U' R' D2 R2 x'`

### pll · Ab — PLL Ab
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Ab.png`
- Algoritmo 1: `x R2 D2 R U R' D2 R U' R x'`

### pll · E — PLL E
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/E.png`
- Algoritmo 1: `x' R U' R' D R U R' D' R U R' D R U' R' D' x`
- Algoritmo 2: `U x' R U' R' D R U R' D' R U R' D R U' R' D' x U'`
- Algoritmo 3: `U2 x' R U' R' D R U R' D' R U R' D R U' R' D' x U2`
- Algoritmo 4: `U' x' R U' R' D R U R' D' R U R' D R U' R' D' x U`

### pll · Y — PLL Y
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Y.png`
- Algoritmo 1: `F R U' R' U' R U R' F' R U R' U' R' F R F'`

### pll · V — PLL V
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/V.png`
- Algoritmo 1: `R' U R' U' y R' F' R2 U' R' U R' F R F`

### pll · Na — PLL Na
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Na.png`
- Algoritmo 1: `R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'`

### pll · Nb — PLL Nb
- Estado esperado: `pll`
- Ilustración de referencia: `/ref/pll/Nb.png`
- Algoritmo 1: `R' U R U' R' F' U' F R U R' F R' F' R U' R`
