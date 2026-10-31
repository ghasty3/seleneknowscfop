# fuentes.md — recursos y transcripciones en bruto

Todo lo de este archivo es **dato de entrada, sin verificar**. Los algoritmos transcritos a mano desde
imagen tienen alta probabilidad de error (apóstrofos y paréntesis se pierden). Regla del proyecto
(ver `project.md` §7): la UI solo publica algoritmos que pasen la verificación del motor; si un transcrito
falla, se sustituye por el generado por BFS y se anota aquí.

Imágenes recibidas en la conversación (adjuntar a `docs/assets/` si se recuperan): tabla F2L 21 casos,
tabla OLL 57 casos, tabla de notación. Las tres son de GANCUBE.

## Enlaces

- Guía CFOP de GANCUBE (estructura Notación → Cross → F2L → OLL → PLL, tips, definiciones):
  `https://www.gancube.com/pages/3x3x3-cfop-guide-gancube`
  Contenido textual de la página: leyenda de notación (minúscula = 2 capas, letra = 90° horario,
  apóstrofo = antihorario, `2` = 180°; azul = índice izquierdo, rojo = pulgar derecho, naranja =
  medio/anular/meñique), "CFOP Steps", tips ("si la arista blanca ya está en su posición objetivo, gira
  la cara superior para crear hueco"), FAQ (definiciones de CFOP, F2L, OLL/PLL). El algoritmo de la
  guía va en imágenes, no en texto.
- Guía F2L intuitiva: `https://speedcube.quest/guides/beginner-f2l`
  Secciones: 1 The basic inserts · 2 Getting a piece out of a slot · 3 Pieces apart on top ·
  4 Pieces misjoined on top · 5 Full solve walkthrough. Conceptos clave:
  - Inserción con par emparejado (colores de la U coinciden): `U R U' R'` y espejo `U' L' U L`.
  - Inserción con par separado (colores de la U difieren, arista a un paso de la esquina):
    `R U R'` y espejo `L' U' L`.
  - Pasos: apartar el par del slot → abrir el slot → meter el par en el slot abierto → cerrar el slot.
  - philosophy explícita de la guía: no memorizar los algoritmos como strings, entender el concepto;
    cada tarjeta visualiza la versión de mano izquierda y de mano derecha.
  - En el walkthrough cada par se resuelve con el slot frontal-derecha, rotando el cubo.
- speedcube.quest tiene además: 2-Look OLL & PLL, Algorithm trainer, PLL/OLL recognition, Notation guide.

## Notación (tabla GANCUBE, imagen de notación)

Fila 1: `R  r  L  l  U  u  D  d`
Fila 2: `F  f  B  b  S  M  E  R2`
Fila 3: `R'  R'2  x  y  z`

Leyenda de dedos de GANCUBE: azul = índice izquierdo · rojo = pulgar derecho ·
naranja = medio / anular / meñique.

## F2L · 21 casos (tabla GANCUBE, transcritos de imagen)

Formato: número + nombre, luego las variantes tal como aparecen (líneas separadas; `/` = variante
alternativa; `或OR` = "o bien"). Estos son los 21 casos canónicos con la esquina y arista blancas en
la capa U y un slot de la segunda capa libre.

| # | Nombre | Variantes transcritas |
|---|---|---|
| 01 | Ua | `M2 U M2 U2` / `M2 U' M2` · `(R' U')(U R)2 (U' R' U' R2)` |
| 02 | Ub | `M2 U' M2 U2` / `M2 U M2` 或OR `(R2 U R U)(R' U' R2)` |
| 03 | H | `M2 U M2` · `U2` · `M2 U M2` |
| 04 | Z | `M' U` · `(M2 U2)` · `M' U2` · `M2 U'` |
| 05 | Aa | `x' R2 D2` · `(R' U' R) D2` · `(R' U R)` |
| 06 | Ab | `x' (R U' R) D2` · `(R' U R) D2 R2` |
| 07 | E | `x' (R U' R' D)` · `(R U R' D')` · `(R U R' D)` |
| 08 | T | `(R U R' U')` · `(R' F)` · `(R2 U' R' U')` · `(R U R' F')` |
| 09 | F | `(R' U F' U')` · `(R F)` · `(R2 U' R' U)` · `(R U R' U)` |
| 10 | V | `R' U R' U' R' F'` · `(U' R U2 R)` · `(R U R') t R` ← línea final ambigua, revisar |
| 11 | Y | `F (R U' R' U)` · `(R U R' F')` · `(R' F R' F')` |
| 12 | Ja | `z (U' R D')` · `(R2 U R' U')` · `(R2 U)` · `(D R')` |
| 13 | Jb | `(R U R' F)` · `(R U R' U')` · `(R' F)` · `(R2 U' R' U')` |
| 14 | Rb | `(R' U2)` · `(R U' R')` · `(R' F R U R' U')` · `(R F' R2 U')` |
| 15 | Ra | `(R U' R' U)` · `(R U R D)` · `(R' U' R D')` · `(R' U2 R' U)` |
| 16 | Gc | `(R2 U' R U R)` · `(U R' U)` · `(R2 f R' f)` |
| 17 | Gd | `(R U R) y'` · `(R2 U R U)` · `(R' U' u' R R2)` |
| 18 | Ga | `R2 U R' U R'` · `U' R' R2` · `(U' D R' U R)` · `(D' U)` |
| 19 | Gb | `(R' d' F)` · `(R2 U)` · `(R' U)` · `(R U' R U' R2)` |
| 20 | Nb | `(R' U R U')` · `(R' F' U)` · `(F R U R' F)` |
| 21 | Na | `(R U R' U)` · `(R U R' F')` · `(R U R') (R' F)` · `(R2 U' R' U2)` · `(R U' R)` |

Nota de formato de GANCUBE: los diagramas de F2L/OLL/PLL de esa guía son **vistas verticales**
(desde arriba); en OLL las barras y cuadrados azules son las piezas amarillas, en PLL las barras
negras marcan piezas del mismo color.

## OLL · 57 casos (tabla GANCUBE, transcritos de imagen, baja confianza)

Objetivo de clasificación (RF-6 de `project.md`): separar los que se resuelven con **2-Look** (cruz
amarilla + orientación de esquinas) y publicar los 57 al final. La clasificación se calcula desde el
estado (vuelos de aristas de la U: punto / L / barra / cruz hecha), no a mano.

```
01 (R U' U)(R2 F R F')(U2 R U' R')
02 F (R U R' U') F' f (R U R' U') f'
03 f (R U R' U') f' F (R U R' U') F'
04 f (R U R' U') f' F (R U R' U') F'
05 (r' U2)(R U' U) r  或OR  y2 r' U2 L U L' U' U
06 (r' U')(R U' R' U r)  或OR  y2 l' U2 L' U' L U' l'
07 (r U R' U')(R U U' r')  或OR  y2 l' U' L' U L U2 l'
08 (r' U' R U)(R' U2 r)  或OR  y2 r' U' L' U' L' U2 l'
09 (R U R' U')(R F)(R2 U R' U') F'
10 (R U R' U)(R' F R F')
11 (r' R2 U' R)(R U' U' R) M'
12 M'(R' U' R U)(R' U2 R' U') M
13 f (R U)(R2 U')(R' U U R) f'
14 (R' F)(R U R' F R)(F U' F')
15 (r' U r)(R' U R U)(R' U r)
16 (r U r')(R U R' U)(R U' r')
17 (R U R' U)(R' F R F') U2 (R' F R F')
18 (r U' U)(R U U' R')(R' U2 R)
19 (r' R U)(R U U' R')(R' F R F')
20 (r U R' U) M2 U'(R U R' U') M'
21 (R U' U')(R' U R' U')(R U' R')
22 (R U' U)(R2 U')(R2 U')(R2 U)(U R)
23 (R2 D)(R' U' R' D')(R U' U R)
24 (r U R' U)(r' F R F')
25 (R U' U')(R' U R U')(r' F R)
26 (R U' U)(R' U R U' R')  或OR  y' R U R' U' R' U2 R  y' U2 R
27 (R U' U)(R' U R U')(R' U2 R) U' U R
28 (r U R' U)(r' F R)
29 (R U R' U)(R U' R' F' U' F)(R U R')
30 f (R U)(R' U' R' U)(R2 U' R') f'
31 (R' F R U R')(U' F2 U F R')
32 (R U)(R' U B R B')  或OR  S (R U' R' U')(R' F R F')
33 (R U' U)(R' F R F')
34 (R U R2 U')(R' F)(R U U' R' F)
35 (R U' U')(R' U R F')(U U' R' U)
36 (R' U' R U')(R' U R U)(U U' R' U)
37 F (R U R' U')(R U R' F')
38 (R U R' U)(R U R' U')(R' F R F')
39 (R U R' F' U' F) U (R U2 R')
40 (R' F)(R2 U' R' U') F'(U R)
41 (R U R' U)(R U R' U') F'
42 (R' U' R U)(R' U2 R) F'
43 (B' U')(R' U R B)  或OR  F (L' U' L U) f
44 (r U R' U')(R U r) f'
45 F (R U R' U') F'
46 (R' U')(R' F R F')(U R)
47 b'(U' U R U R)2 b  或OR  F'(L' U' L' U)2 F
48 F (R U R' U')2 F'
49 (R B')(R2 F R2 B)(R2 F' R)
50 (r' U)(R U' U' r2 U')(r2 U r')
51 f (R U R' U')2 f'
52 (R' F' U' F U')(R U' U R)
53 (r' U2)(R U' U) r
54 (r' U')(R' U R U')(R U' R' r)
55 (r' U' U' R' U)(r' R2 U R' U)(r' U' r')
56 (r U r')(U R U') R2 (r' U' r')  或OR  (r R U F' U' F)(R U R' U)(R' F R F')
57 (R U R' U') M'(U R U' r)
```

Advertencias de transcripción: las líneas 05, 08, 17, 18, 26, 31, 35, 36, 47, 55 son las más dudosas
(glifos de GANCUBE tipo `U1`, `t R`, `R R2`, `U U'` salieron de recortes de imagen). En OLL la
notación de la tabla usa `U' U` para "U2" de capa y `R U U'` para giros de capa ancha; al pasar al
motor hay que normalizar a `R R'`/`R2`/`r`/`r'` según la tabla `MOVE_SPECS`.

## Fuentes de vídeo (pendiente de implementar — el usuario aún no dice cómo usarlas)

- **OLL**: `https://www.youtube.com/watch?v=Q947zZRYMdg` (recibido en m00491)
- **PLL**: `https://youtu.be/QVXKNAjl_0k` (recibido en m00495)
- **F2L beginner**: `https://www.youtube.com/watch?v=ReOZZHscIGk` (recibido en m00514)
- **F2L standard** (lista completa): `https://www.youtube.com/watch?v=3tYj-9f4dA0&list=PLqrfspOsG9B-DNSI6aS4s10atxVYqPxm9`
  (recibido en m00518)

Anotación del pedido: «añade este source a la página, por ahora no te digo cómo implementarlo».
Queda como fuente de referencia de OLL y PLL. Cuando el usuario indique el uso, candidatas:
enlace embebido en la ficha del caso / en la página de la fase, lista de vídeos por grupo, o
cross-check de los transcritos de la tabla GANCUBE contra los algoritmos del vídeo.

## Pasos siguientes de datos

1. Normalizar los transcritos al parser del motor (quitar `/`, `或OR`, paréntesis de grupo, `U1`→`U`).
2. Escribir `scripts/verify.mts` (con `tsx`): para cada caso, `caseState(alg)` + `parseAlg(alg)` ⇒
   `isSolved()`, y comprobar el patrón del caso plantado.
3. Los que fallen → `scripts/gen-oll.mts` / `gen-pll.mts` / `gen-f2l.mts` (BFS) generan un alg
   verificado y corto; se guarda en la tabla con marca `generated: true`.
4. Algoritmos básicos que sí son seguros y que van a la guía 2-Look:
   cruz: `F R U R' U' F'` · `f R U R' U' f'` · punto→L→cruz encadenado;
   esquinas: Sune `R U R' U' R U' R'`, Antyune `R U R' U' R U2 R'`, setups `y U2`, `x' U`, etc.
   (estos también se someten a la prueba 1..4 de `project.md` §6).
