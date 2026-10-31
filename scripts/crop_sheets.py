#!/usr/bin/env python3
"""Recorta las planchas de la guía GAN en una imagen por caso.

Detección de rejilla por líneas claras (borde + separadores), recorte de cada
celda y guardado en public/ref/<stage>/<code>.png con el código de la celda.
"""
import json
import sys
from PIL import Image, ImageChops

SHEETS = "scripts/sheets.json"


def detect_grid(im):
    """Devuelve (cols, rows) de la rejilla de celdas según líneas claras."""
    g = im.convert('L')
    w, h = g.size
    px = g.load()

    def is_line(v):
        return v > 190  # borde y separadores son azul muy claro sobre blanco

    rows, cols = [], []
    # filas
    run_start = None
    for y in range(h):
        dark = sum(1 for x in range(0, w, 4) if not is_line(px[x, y]))
        full = dark < (w // 4) * 0.12  # casi toda la fila es clara -> separador
        if full and run_start is None:
            run_start = y
        if not full and run_start is not None:
            rows.append((run_start, y))
            run_start = None
    if run_start is not None:
        rows.append((run_start, h))
    # columnas
    run_start = None
    for x in range(w):
        dark = sum(1 for y in range(0, h, 4) if not is_line(px[x, y]))
        full = dark < (h // 4) * 0.12
        if full and run_start is None:
            run_start = x
        if not full and run_start is not None:
            cols.append((run_start, x))
            run_start = None
    if run_start is not None:
        cols.append((run_start, w))
    return cols, rows


def main():
    for sheet in json.load(open(SHEETS)):
        im = Image.open(sheet['src']).convert('RGB')
        cols, rows = detect_grid(im)
        out = []
        for (x0, x1) in cols:
            for (y0, y1) in rows:
                cell = im.crop((x0, y0, x1, y1))
                code = sheet['matrix'].get(f"{cols.index((x0, x1))},{rows.index((y0, y1))}")
                if not code:
                    continue
                cell.thumbnail((240, 400))
                p = f"public/ref/{sheet['stage']}/{code}.png"
                cell.save(p)
                out.append(p)
        print(sheet['stage'], 'celdas:', len(cols), 'x', len(rows), 'guardadas:', len(out))


if __name__ == '__main__':
    main()
