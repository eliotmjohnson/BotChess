import type { Square } from 'chess.js'
import { PIECE_GLYPH } from './pieces'

export type BoardSquare = {
  square: Square
  type: string
  color: 'w' | 'b'
} | null

type BoardProps = {
  board: BoardSquare[][]
  orientation: 'w' | 'b'
  selected: Square | null
  legalTargets: Set<string>
  lastMove: { from: Square; to: Square } | null
  checkSquare: Square | null
  disabled: boolean
  onSquareClick: (sq: Square) => void
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

function sqAt(file: number, rank: number): Square {
  return `${FILES[file]}${rank + 1}` as Square
}

export function Board({
  board,
  orientation,
  selected,
  legalTargets,
  lastMove,
  checkSquare,
  disabled,
  onSquareClick,
}: BoardProps) {
  const ranks = orientation === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]
  const files = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]

  return (
    <div className="board" role="grid" aria-label="Chess board">
      {ranks.map((r) =>
        files.map((f) => {
          const square = sqAt(f, r)
          const piece = board[r]![f]
          const isLight = (f + r) % 2 === 1
          const isSelected = selected === square
          const isLast =
            lastMove && (lastMove.from === square || lastMove.to === square)
          const isLegal = legalTargets.has(square)
          const isCheck = checkSquare === square
          const classes = [
            'sq',
            isLight ? 'light' : 'dark',
            isSelected ? 'selected' : '',
            isLast ? 'last' : '',
            isCheck ? 'check' : '',
            isLegal ? 'legal' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={square}
              type="button"
              className={classes}
              disabled={disabled}
              aria-label={
                piece
                  ? `${piece.color === 'w' ? 'White' : 'Black'} ${piece.type} on ${square}`
                  : square
              }
              onClick={() => onSquareClick(square)}
            >
              {isLegal && !piece ? <span className="dot" /> : null}
              {isLegal && piece ? <span className="ring" /> : null}
              {piece ? (
                <span
                  className={`piece ${piece.color === 'w' ? 'pw' : 'pb'}`}
                  aria-hidden
                >
                  {PIECE_GLYPH[`${piece.color}${piece.type.toUpperCase()}`]}
                </span>
              ) : null}
              {f === files[0] ? (
                <span className="coord rank">{r + 1}</span>
              ) : null}
              {r === ranks[ranks.length - 1] ? (
                <span className="coord file">{FILES[f]}</span>
              ) : null}
            </button>
          )
        }),
      )}
    </div>
  )
}
