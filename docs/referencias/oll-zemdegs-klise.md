# Tabla OLL de Feliks Zemdegs y Andy Klise (contenido extraído)

Referencia: `oll-algorithms.pdf` (258.944 bytes, 4.953 caracteres de texto, 59 diagramas en el PDF).
Cabecera del documento: «OLL Algorithms (Orientation of Last Layer) — Developed by Feliks Zemdegs and Andy Klise — Algorithm Presentation Format».
La tabla organiza los 57 casos por familia de forma (OCLL, T, S, C, W, E, P, I, Fish, Knight, Awkward, L, B, O) y da para cada caso nombre, número, probabilidad y algoritmos segmentados con paréntesis para memorizar.

La probabilidad solo aparece en dos valores: 1/54 y 1/108 y 1/216 (los casos con dos esquinas en la misma cara valen 1/108).

El documento es también una plantilla: en algunos huecos pone «Suggested algorithm here» y «Alternative algorithms here», así que hay casos sin algoritmo escrito (por ejemplo T2 - 45).

## Uso en este proyecto

- Los nombres de los 57 OLL de la web (`src/data/oll.ts`) vienen de las tablas de Gan, no de esta tabla: aquí se nombra por familia y número (T1, S1, O1…). Sirve como verificación cruzada de algoritmos y de probabilidades.
- La notación del PDF usa `2`' y `2` indistinto (por ejemplo `U 2`') y prefijos de cara entera (`r`, `f`, `M`, `E`) con rotaciones `y`, `y2`, `x`. El parser del motor admite esas letras.
- El PDF no es fuente de los datos de la web: los casos provienen de `oll.gan.ts` y se procesan con `scripts/build-cases.mts`.

## Familias y casos citados

Etiqueta de familia → casos de la tabla de 57 (número de caso y probabilidad).

- **OCLL**: 26 (1/54), 27 (1/54), 21 (1/108), 22 (1/54), 24 (1/54), 25 (1/54), 23 (1/54)
- **T**: 33 (1/54), 45 (1/54)
- **S**: 5 (1/54), 6 (1/54)
- **C**: 34 (1/54), 46 (1/54)
- **W**: 36 (1/54), 38 (1/54)
- **E**: 28 (1/54), 57 (1/108)
- **P**: 31 (1/54), 32 (1/54), 43 (1/54), 44 (1/54)
- **I**: 51 (1/54), 56 (1/108), 52 (1/54), 55 (1/108)
- **F**: 9 (1/54), 10 (1/54), 35 (1/54), 37 (1/54)
- **K**: 13 (1/54), 14 (1/54), 16 (1/54), 15 (1/54)
- **A**: 29 (1/54), 30 (1/54), 41 (1/54), 42 (1/54)
- **L**: 48 (1/54), 47 (1/54), 49 (1/54), 50 (1/54), 53 (1/54), 54 (1/54)
- **B**: 7 (1/54), 8 (1/54), 11 (1/54), 12 (1/54), 39 (1/54), 40 (1/54)
- **O**: 1 (1/108), 2 (1/54), 3 (1/54), 4 (1/54), 18 (1/54), 19 (1/54), 17 (1/54), 20 (1/216)

Casos citados en total: 57
## Texto extraído del PDF (literal, en el orden del documento)

Normalizado: espacios colapsados, sin saltos de página. Los huecos de la plantilla se mantienen tal cual.

```text
O LL Algorithms ( Orientation of Last Layer) Developed by Feliks Zemdegs and Andy Klise Algorithm Presentation Format All Edges Oriented Correctly R U2 R' U' R U' R' y' R' U' R U' R' U2 R
O
C
L
L6 - 26 - Probability = 1/54 R U R' U R U 2' R' y' R' U 2 ' R U R' U R
O
C
L
L7 - 27 - Probability = 1/54 ( R U 2 R') (U' R U R') (U' R U' R' ) y (R U R' U) (R U' R' U) (R U 2' R')
O
C
L
L1 - 21 - Probability = 1/108 R U 2 ' R 2 ' U' R 2 U' R 2 ' U 2' R
O
C
L
L2 - 22 - Probability = 1/54 (r U R' U') (r' F R F' ) y (R U R D) (R' U' R D') R2'
O
C
L
L4 - 24 - Probability = 1/54 y F' (r U R' U') r' F R x (R' U R) D' (R' U' R) D x'
O
C
L
L5 - 25 - Probability = 1/54 R 2 D (R' U 2 R) D' (R' U 2 R') y 2 R 2 ' D' (R U 2 R') D (R U 2 R)
O
C
L
L3 - 23 - Probability = 1/54 T - Shapes (R U R' U') (R' F R F')
T1 - 33 - Probability = 1/54 F (R U R' U') F'
T2 - 45 - Probability = 1/54 Suggested algorithm here Alternative algorithms here O LL Case Name - Probability = 1/x Round brackets are used to segment algorithms to assist memorisation and group move triggers. It is recommended to learn the algorithms in the order presented. Squares (r' U2' R U R' U r)
S1 - 5 - Probability = 1/54 ( r U2 R' U' R U' r')
S2 - 6 - Probability = 1/54 C - Shapes (R U R2' U') (R' F R U) R U' F'
C1 - 34 - Probability = 1/54 R' U' (R' F R F') U R
C2 - 46 - Probability = 1/54 W - Shapes (R' U' R U') (R' U R U) l U' R' U x y2 (R U R' F') (R U R' U') (R' F R U') (R' F R F')
W1 - 36 - Probability = 1/54 (R U R' U) (R U' R' U') (R' F R F')
W2 - 38 - Probability = 1/54 Corners Correct, Edges Flipped (r U R' U') M (U R U' R')
E1 - 28 - Probability = 1/54 (R U R' U') M' (U R U' r')
E2 - 57 - Probability = 1/108 P - Shapes (R' U' F) (U R U' R') F' R
P1 - 31 - Probability = 1/54 R U B' (U' R' U) (R B R') S (R U R' U') (R' F R f')
P2 - 32 - Probability = 1/54 y R' U' F' U F R f' (L' U' L U) f
P3 - 43 - Probability = 1/54 f (R U R' U') f' y2 F (U R U' R') F'
P4 - 44 - Probability = 1/54 I - Shapes f (R U R' U') (R U R' U') f' y2 F (U R U' R') (U R U' R') F'
I1 - 51 - Probability = 1/54 r' U' r (U' R' U R) (U' R' U R) r' U r
I4 - 56 - Probability = 1/108 (R' U' R U' R' U) y' (R' U R) B (R U R' U R U ' ) y (R U' R') F'
I2 - 52 - Probability = 1/54 y (R' F R U) (R U' R2' F') R2 U' R' (U R U R')
I3 - 55 - Probability = 1/108 Fish Shapes (R U R' U') R' F (R 2 U R' U' ) F' ( R' U' R ) y r U' r' U r U r'
F1 - 9 - Probability = 1/54 (R U R' U) (R' F R F') (R U 2 ' R') (R U R') y (R' F R U') (R' F' R)
F2 - 10 - Probability = 1/54 (R U 2 ') (R 2 ' F R F') (R U 2 ' R')
F3 - 35 - Probability = 1/54 F (R U' R' U' ) ( R U R' F')
F4 - 37 - Probability = 1/54 Knight Move Shapes (r U' r') (U' r U r') y ' (R ' U R) F U R U' R 2 ' F' R U (R U' R')
K1 - 13 - Probability = 1/54 (R' F R) (U R' F' R) (F U' F')
K2 - 14 - Probability = 1/54 (r U r') (R U R' U') (r U' r')
K4 - 16 - Probability = 1/54 (r' U' r) (R' U' R U) (r' U r)
K3 - 15 - Probability = 1/54 Awkward Shapes y (R U R' U') (R U' R') (F' U' F) (R U R') M U (R U R' U')(R' F R F') M'
A1 - 29 - Probability = 1/54 y' F U (R U2 R' U') (R U2 R' U') F' y ' ( F R' F ) ( R2 U' R' U' ) ( R U R' ) F2
A2 - 30 - Probability = 1/54 ( R U R' U R U 2 ' R') F (R U R' U' ) F'
A3 - 41 - Probability = 1/54 (R' U' R U' R' U 2 R) F (R U R' U' ) F' y (R' F R F') (R' F R F') (R U R' U') (R U R')
A4 - 42 - Probability = 1/54 L - Shapes F (R U R' U') (R U R' U') F'
L2 - 48 - Probability = 1/54 F' (L' U' L U) (L' U' L U) F R' U' (R' F R F') (R' F R F') U R
L1 - 47 - Probability = 1/54 r U' r2' U r2 U r2' U' r
L3 - 49 - Probability = 1/54 r' U r2 U' r2' U' r2 U r' y' (R U2 R' U' R U' R') F (R U R' U') F'
L4 - 50 - Probability = 1/54 (r' U' R U') (R' U R U') R' U2 r y r' U2' R (U R' U' R) (U R' U r)
L5 - 53 - Probability = 1/54 (r U R' U) (R U' R' U) R U2' r' y' ( r U2 R' U' ) (R U R' U') R U' r'
L6 - 54 - Probability = 1/54 Lightning Bolts (r U R' U R U 2 ' r')
B1 - 7 - Probability = 1/54 (r' U' R U' R' U 2 r) y2 l' U' L U' L' U2 l
B2 - 8 - Probability = 1/54 r' (R 2 U R' U R U 2 R') U M'
B3 - 11 - Probability = 1/54 M' (R ' U' R U' R' U2 R ) U' M y F (R U R' U') F' U F (R U R' U' ) F'
B4 - 12 - Probability = 1/54 ( L F') (L' U' L U) F U' L' F (R U R' U') F' (R' U' R U' R' U2 R )
B5 - 39 - Probability = 1/54 (R' F) (R U R' U') F' U R
B6 - 40 - Probability = 1/54 No Edges Flipped Correctly (R U 2 ') (R 2 ' F R F') U 2 ' (R' F R F' )
O1 - 1 - Probability = 1/108 F (R U R' U') F' f (R U R' U') f' y ( r U r' ) U2 R U2' R' U2 ( r U' r' )
O2 - 2 - Probability = 1/54 f (R U R' U') f' U' F (R U R' U') F'
O3 - 3 - Probability = 1/54 f (R U R' U') f' U F (R U R' U') F'
O4 - 4 - Probability = 1/54 y R U2' (R2' F R F') U2 ' M' (U R U' r') (r U R' U R U 2 r') (r' U' R U' R' U 2 r )
O6 - 18 - Probability = 1/54 M U (R U R' U') M' (R' F R F' )
O7 - 19 - Probability = 1/54 ( R U R' U) (R' F R F') U 2 ' (R' F R F')
O5 - 17 - Probability = 1/54 M U (R U R' U') M 2 ' (U R U' r') (r U R' U' ) M2 ' (U R U ' R ' ) U ' M '
O8 - 20 - Probability = 1/216
```