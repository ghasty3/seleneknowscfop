/**
 * Iconos dibujados: una sola familia, 16 px, currentColor, trazo 1.5.
 * Sustituyen a los iconos de texto (estrellas y flechas de carácter).
 */

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg {...base}>
      {dir === 'left' ? <path d="M10 3 5 8l5 5" /> : <path d="M6 3l5 5-5 5" />}
    </svg>
  )
}

export function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg {...base} fill={filled ? 'currentColor' : 'none'}>
      <path d="M8 1.9l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.7 4.2 13.7l.7-4.3-3.1-3 4.3-.6z" />
    </svg>
  )
}

export function PlayIcon() {
  return (
    <svg {...base} fill="currentColor" stroke="none">
      <path d="M4.5 3.2 12.8 8l-8.3 4.8z" />
    </svg>
  )
}

export function PauseIcon() {
  return (
    <svg {...base} fill="currentColor" stroke="none">
      <path d="M4.2 3.2h2.6v9.6H4.2zM9.2 3.2h2.6v9.6H9.2z" />
    </svg>
  )
}

export function RewindIcon() {
  return (
    <svg {...base}>
      <path d="M13 4.5v7L8.5 8zM7.5 4.5v7L3 8z" />
    </svg>
  )
}

export function ResetIcon() {
  return (
    <svg {...base}>
      <path d="M13 8a5 5 0 1 1-1.6-3.7" />
      <path d="M13.4 2.2v2.9h-2.9" />
    </svg>
  )
}

/** Marca del producto: cubo isométrico, para el arrancador. */
export function CubeMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" aria-hidden>
      <path d="M12 2.6l8 4.4v9.4l-8 4.4-8-4.4V7z" />
      <path d="M4 7l8 4.4 8-4.4M12 11.4V20.8" />
    </svg>
  )
}
