# instructionsIRIS.md — instrucciones de la persona (registro acumulativo)

> Archivo pedido por la persona (m02192): *"todas las instrucciones que te acabo de dar guárdalas en un
> archivo llamado instrucctionsIRIS.md y desarrollalas"*. Este archivo es el registro de **todas** las
> instrucciones recibidas, en orden, con su referencia de mensaje. Se actualiza cuando llegan otras.
> Las citas textuales se copian tal cual; cuando el mensaje era largo se parafrasea y se marca como tal.

## Objetivo general (no cambia)

Aprender el método **CFOP** con una página web propia, completa e intuitiva, en **modo oscuro minimalista
con acentos morados oscuros**, para subirlo a **GitHub / GitHub Pages** y que lo usen la persona y sus amigos.
Idioma de la interfaz: **castellán**. La notación de cubo no se traduce. Los algoritmos se publican solo
si el verificador confirma que cierran su caso.

## Instrucciones recibidas

1. **(m00001)** Crear el proyecto; estilo minimalista modo oscuro con acentos morados oscuros; recursos:
   guía CFOP de GANCUBE (gancube.com/pages/3x3x3-cfop-guide-gancube) e imágenes de tablas (F2L 21, OLL 57,
   PLL 21, notación). Trabajo incremental: la persona va dando instrucciones poco a poco.
2. **(m00009, parafraseada)** Lo más llamativo: **encima del algoritmo** que se está aprendiendo debe haber
   un **cubo 3D funcional** que ejecuta el algoritmo movimiento a movimiento (no una imagen).
3. **(m00030, parafraseada)** OLL: separar los que se resuelven con **2-Look** (cruz amarilla) y **añadir los 57**.
4. **(m00036)** Notación de GANCUBE (R r L l U u D d F f B b S M E R2 R' R'2 x y z) con leyenda de dedos:
   azul = índice izquierdo, rojo = pulgar derecho, naranja = medio/anular/meñique.
5. **(m00064, parafraseada)** Apartado **watchlist** con los algoritmos que estoy aprendiendo; barra de
   progreso por algoritmo elegida libremente por la persona, con **3 tramos**: 33 % aprendido,
   66 % lo hago con soltura/automático, 100 % sé todos los fingertricks. Guía F2L intuitiva
   (speedcube.quest/guides/beginner-f2l) como contenido.
6. **(m00069, parafraseada)** **Cronómetro** debajo de cada algoritmo para cronometrarme y ver progreso;
   apartado **"Tus mejores permutaciones"** ordenadas de menor a mayor tiempo.
7. **(RF-12, de la conversación de publicación)** Dejar **GitHub** como destino final (repo + Pages),
   100 % estático.
8. **(m01739)** **"la logica del cubo no funciona correctamente"** → arreglar la lógica del cubo
   (estado, giros, comprobación de resuelto, movimiento del pegatinado).
9. **(m01741)** **"por qué hay cosas escritas en gallego??? no hablo nada de gallego y no te dije que
   escribieras en gallego"** → **todo el proyecto en castellán**; el gallego queda prohibido en
   README, docs, comentarios, UI y textos de script. (Fix aplicado: `914196c`.)
10. **(m01978)** **"se debe poder rotar visualmente el cubo en el visualizador, al girar una cara oculta
    al inicio, las piezas nuevas no tienen color"** → (a) que la vista se pueda rotar/orientar en el
    visor; (b) que al girar una cara que estaba oculta las piezas que aparecen salgan **con color**.
11. **(m02147)** — tarea explícita, copiada literal:
    > "Tienes como tarea arreglar el visualizador 3d del cubo, las previews de PLL, para que se vean
    > flechas por encima en vez de circulos, puedes sacar capturas y revisarlas, arreglar el OLL COMPLETO,
    > ya que solo deberían aparecer recuadros amarillos y grises que son los unicos que importan, y que
    > sean apropiados y ordenados ya que ahora son un desastre, no hacen falta los puntos negros, Para f2L
    > añadir previsualizaciones 3d de un angulo con solo los colores relevantes (cruz y bloque)"
    - **Visualizador 3D del cubo:** arreglar (colores de pegatina al girar, piezas nuevas, rotación de la vista).
    - **Previews de PLL:** **flechas por encima** en lugar de círculos; se permiten capturas para revisarlas.
    - **OLL completo:** **solo recuadros amarillos y grises**, que son lo único que importa; ordenados y
      apropiados (ahora "son un desastre"); **sin puntos negros**.
    - **F2L:** añadir **previsualizaciones 3D** desde un ángulo, con **solo los colores relevantes**
      (cruz y bloque).
12. **(m02157)** `/impeccable typeset text, bubbles and buttons` → tipografía y estados de texto,
    burbujas/chips y botones.
13. **(m02179)** `/impeccable animate 3d preview momevent` → animar la previsualización 3D (movimiento del
    cubo en el momento del caso).
14. **(m02192)** Guardar estas instrucciones en `instructionsIRIS.md` y **desarrollarlas**.
15. **(m02202)** **"continua hasta que audites que está completamente terminado el proyecto"** →
    trabajar y terminar con una **auditoría final** (ver checklist de auditoría abajo).

## Requisitos funcionales (RF) consolidados

RF-1 cubo 3D sobre el algoritmo · RF-2 reproducir desde el estado del caso · RF-3 notación interactiva ·
RF-4 secciones Notación/Cross/F2L/OLL/PLL · RF-5 los 21 casos F2L · RF-6 OLL 57 + grupo 2-Look ·
RF-7 watchlist · RF-8 barra de progreso de 3 tramos (33/66/100) · RF-9 guía F2L intuitiva ·
RF-10 cronómetro por algoritmo · RF-11 ranking de mejores permutaciones · RF-12 publicar en GitHub Pages.

## Checklist de auditoría final (para cerrar m02202)

- [ ] `npm run typecheck` y `npm run build` en verde.
- [ ] `npm run verify`: 0 fallos duros; los avisos quedan listados y justificados.
- [ ] Lógica del cubo: secuencias reales verificadas (sexy×6, M2U2×4, F R U R' U' F'×4, T-perm×2,
      4-gimmick×3, scramble+inversa, `x`/`y`/`z` = resuelto), 0 pegatinas sin color.
- [ ] Visor 3D: se puede girar la vista; al girar una cara oculta las piezas salen con color;
      animación movimiento a movimiento; play/pausa/paso/velocidad/bucle/invertir/espejo.
- [ ] Previews OLL: solo recuadros amarillos/grises, ordenados, sin puntos negros.
- [ ] Previews PLL: flechas por encima de las celdas, coherentes con la permutación.
- [ ] Previews F2L: 3D en ángulo con solo cruz + bloque relevantes.
- [ ] Cronómetro, watchlist, niveles 33/66/100, ranking funcionando y persistido.
- [ ] Textos, chips y botones revisados (`/impeccable typeset`); animación del preview 3D
      (`/impeccable animate`) con camino `prefers-reduced-motion`.
- [ ] Capturas de todas las pantallas a 1280 px y 390 px revisadas.
- [ ] Cero gallego en el repo (búsqueda de marcadores).
- [ ] `README.md`, `PROJECT_STATE.md` y `project.md` actualizados; `PROJECT.md` intacto (RF-1..RF-12).
- [ ] Repo en rama `main`, commit final; `gh` disponible. **La creación del repo remoto y del
      despliegue en Pages se ejecutan con credenciales de la persona** (no se asumen permisos).

## Estado al registrar estas instrucciones

- Commits recientes: `914196c` (gallego→castellán), `172e0f3` (project.md en castellán).
- Pendiente al cierre del registro: lógica del cubo (m01739/m01978), previews (m02147),
  typeset (m02157), animate (m02179), auditoría final (m02202).
