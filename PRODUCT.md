# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Persona que **ya conoce el método de capas y se atasca**: resuelve el 3x3 por capas, ha oído hablar de
CFOP, y necesita dar el salto aprendiendo los algoritmos **con sentido**, no copiando letras. Abre la
web para entender qué hace cada algoritmo antes de memorizarlo.

Audiencias secundarias confirmadas por el encargo: principiante que llega desde cero (la guía de
referencia es una guía de CFOP completa) y speedcuber que entrena y quiere automatizar. La prioridad de
decisiones de producto es quien se atasca al pasar a CFOP.

## Product Purpose

Enseñar el método **CFOP** (Cross → F2L → OLL → PLL) de forma intuitiva. La web existe porque la
notación sola (R U R' F') no comunica lo que ocurre en el cubo: aquí cada algoritmo se ve ejecutar
movimiento a movimiento sobre un cubo 3D que **empieza en el propio caso y termina resuelto**.

Éxito medido según el usuario: que la persona **complete el método entero, de Cross a PLL**, con
progreso visible caso a caso.

## Positioning

Mecanismo que un vecino no puede copiar literalmente: el algoritmo se muestra **desde su estado de
caso**, de modo que el último giro deja el cubo resuelto — el algoritmo se explica como una
transformación verificada, no como un glifo.

Apoyos que forman la posición:

- Práctica con el cubo manipulable: los giros salen del cubo (arrastrar una pegatina gira su capa),
  no de una tabla de botones.
- Progreso por algoritmo en tres niveles (33 % aprendido · 66 % automático · 100 % fingertricks) y
  watchlist de algoritmos en aprendizaje.
- Cronómetro por algoritmo con registro de tiempos y **mejores permutaciones** ordenadas de menor a
  mayor tiempo.
- Los datos se verifican contra el motor cúbico propio (`npm run verify`), no se publican sin comprobar.

## Operating Context

- Se usa con un cubo físico en la mano: la web es el puente entre la notación y el cubo real.
- Referencias de contenido que el usuario suministra: guía CFOP de Gancube y transcripciones de sus
  imágenes (tablas de casos F2L/OLL/PLL con fórmulas alternativas) en `docs/fuentes.md`.
- Desarrollo en local con `npm run dev` (Vite, http://localhost:5173); el progreso y los tiempos viven
  en `localStorage` del navegador de cada persona.
- Destino previsto: repositorio en GitHub con publicación estática en GitHub Pages, para compartir.

## Capabilities and Constraints

- Sin backend: todo el estado del usuario es local al navegador; no hay sincronización entre
  dispositivos ni cuentas.
- Stack ya decidido por el código existente: React + Vite + TypeScript, build estático.
- El idioma de la interfaz es **castellán**, con la **notación de cubo universal sin traducir**
  (R U R' F', M2, x, y).
- Los algoritmos deben llegar a dejar el cubo resuelto desde su caso: si la fórmula no cierra, el
  verificador la marca y ese caso no se publica como completo.
- Estado conocido y aceptado: Cross y F2L verifican casi enteros; **OLL y PLL todavía no cierran**
  (19 de 103 casos) porque las imágenes dan fórmulas alternativas sin fijar la configuración exacta de
  la cara U.
- El estilo oscuro minimalista con acentos morados oscuros es un compromiso del encargo, no una
  decisión de diseño abierta (ver Brand Commitments).

## Brand Commitments

- Nombre del producto, fijado por el usuario: **Selene knows CFOP** (usar tal cual, también como
  logotipo de texto en la cabecera).
- Compromiso visual vinculante del encargo: modo oscuro minimalista con acentos morados oscuros.
- Tono didáctico directo, en castellán, explicando el porqué del algoritmo.

## Evidence on Hand

- `docs/fuentes.md`: transcripciones en bruto de las imágenes del usuario (casos 01–21 con fórmulas
  alternativas, leyenda de dedos) y la guía de referencia.
- `src/data/` — 103 casos: 6 Cross, 21 F2L, 61 OLL (incluye 2-Look), 15 PLL.
- `src/cube/engine.ts` con 54 pruebas propias; `scripts/verify.mts` ejecuta cada algoritmo sobre su
  estado de caso. Resultado actual: 19 de 103 casos cierran (6 Cross, 12 F2L, 1 OLL, 0 PLL).
- `README.md` con el estado real del proyecto y el diagnóstico de lo que falta.
- **No hay** testimonios, casos de uso reales, benchmarks, precios ni audiencia externa documentada:
  no inventarlos.

## Product Principles

1. **El algoritmo se entiende viéndolo**: si un caso no se puede animar hasta quedar resuelto, el
   material no está listo para publicarse.
2. **Del cubo en pantalla al cubo en la mano**: la interacción sale del cubo (giro arrastrando una
   pegatina), la tabla es apoyo, no el protagonista.
3. **Progreso medido, no prometido**: niveles por algoritmo, watchlist y tiempos registrados; nada de
   badges inventados.
4. **Contenido escaso y comprobado antes que contenido ancho y dudoso**: el subconjunto verificado
   (2-Look, F2L, Cross) manda; los 57 OLL y 21 PLL completos se publican cuando cierren.
5. **La interfaz se aparta**: modo oscuro minimalista, la jerarquía es el cubo y el algoritmo.
