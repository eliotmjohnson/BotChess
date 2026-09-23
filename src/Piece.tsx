import type { ReactNode } from 'react'

type PieceProps = {
  color: 'w' | 'b'
  type: string
}

/** Clean geometric pieces — high contrast at phone sizes */
export function Piece({ color, type }: PieceProps) {
  const isWhite = color === 'w'
  const fill = isWhite ? '#f5f7fb' : '#1c2430'
  const stroke = isWhite ? '#2a3344' : '#e8eef7'
  const detail = isWhite ? '#8b9bb4' : '#9aa8bc'

  const common = {
    fill,
    stroke,
    strokeWidth: 1.5,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  }

  let body: ReactNode = null
  switch (type) {
    case 'k':
      body = (
        <>
          <path
            {...common}
            d="M22.5 11.5v4M20 13.5h5M22.5 18c3.2 0 6.5 1.2 7.8 4.2 1 2.2.2 4.8-1.6 6.2H16.3c-1.8-1.4-2.6-4-1.6-6.2 1.3-3 4.6-4.2 7.8-4.2z"
          />
          <path {...common} d="M14 29.5h17l-1.2 4.5H15.2z" />
          <path {...common} d="M13 34h18v2.5c0 1.2-1 2.2-2.2 2.2H15.2c-1.2 0-2.2-1-2.2-2.2z" />
          <circle cx="22.5" cy="21.5" r="1.4" fill={detail} stroke="none" />
        </>
      )
      break
    case 'q':
      body = (
        <>
          <circle cx="12" cy="14" r="2.2" {...common} />
          <circle cx="22.5" cy="11.5" r="2.4" {...common} />
          <circle cx="33" cy="14" r="2.2" {...common} />
          <path
            {...common}
            d="M12 15.5 15.5 28h14L33 15.5l-5.5 6.5-5-8.5-5 8.5z"
          />
          <path {...common} d="M15 28.5h15l-1 4H16z" />
          <path {...common} d="M14 32.5h17v2.8c0 1.1-.9 2-2 2H16c-1.1 0-2-.9-2-2z" />
        </>
      )
      break
    case 'r':
      body = (
        <>
          <path
            {...common}
            d="M14 14h4v4h3v-4h3v4h3v-4h4v7.5H14z"
          />
          <path {...common} d="M15.5 21.5h14v9.5h-14z" />
          <path {...common} d="M13.5 31h18v3.5c0 1-.8 1.8-1.8 1.8H15.3c-1 0-1.8-.8-1.8-1.8z" />
        </>
      )
      break
    case 'b':
      body = (
        <>
          <path
            {...common}
            d="M22.5 11c3.5 0 7 3.2 7 7.2 0 5.5-4.2 9.3-7 12.8-2.8-3.5-7-7.3-7-12.8 0-4 3.5-7.2 7-7.2z"
          />
          <path d="M22.5 16.5v8M19.5 20.5h6" stroke={detail} strokeWidth="1.6" fill="none" />
          <path {...common} d="M16 31.5h13l-1.2 3.2H17.2z" />
          <path {...common} d="M14.5 34.5h16v2c0 1-.8 1.8-1.8 1.8H16.3c-1 0-1.8-.8-1.8-1.8z" />
          <circle cx="22.5" cy="13.2" r="1.6" {...common} />
        </>
      )
      break
    case 'n':
      body = (
        <>
          <path
            {...common}
            d="M12.5 32.5h20v2.8c0 1-.8 1.8-1.8 1.8H14.3c-1 0-1.8-.8-1.8-1.8z"
          />
          <path
            {...common}
            d="M30 32.5c0-6.5-2.2-10.5-5.5-13.5 2.8-1.2 5.2-3.5 6.2-6.8.4-1.2-.4-2.2-1.5-2.2-2.2 0-4.2 1.2-5.5 2.2-.3-2.8-2-5.5-5.2-6.8-1.2-.5-2.3.4-2.1 1.6.4 2.2-.2 4-1.5 5.5C12.5 14.5 10 18 10 23.5c0 4.2 2.2 7.2 5 9z"
          />
          <circle cx="18.2" cy="18.2" r="1.35" fill={detail} stroke="none" />
        </>
      )
      break
    case 'p':
    default:
      body = (
        <>
          <circle cx="22.5" cy="16" r="5.2" {...common} />
          <path {...common} d="M16.5 22.5c2.2 2.2 4.2 3.5 6 3.5s3.8-1.3 6-3.5c1.8 2.5 3.5 6.5 3.5 9.5H13c0-3 1.7-7 3.5-9.5z" />
          <path {...common} d="M13 32.5h19v2.8c0 1-.8 1.8-1.8 1.8H14.8c-1 0-1.8-.8-1.8-1.8z" />
        </>
      )
  }

  return (
    <svg
      className={`piece-svg ${isWhite ? 'pw' : 'pb'}`}
      viewBox="0 0 45 45"
      aria-hidden
    >
      {body}
    </svg>
  )
}
