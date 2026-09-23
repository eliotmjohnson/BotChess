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

/** chess.js board()[0] is rank 8; [7] is rank 1 */
function sqAt(file: number, rankIndex: number): Square {
  return `${FILES[file]}${8 - rankIndex}` as Square
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
  // White at bottom: rank 8 (index 0) at top. Black at bottom: flip.
  const ranks =
    orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]
  const files =
    orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]

  return (
    <div className="board" role="grid" aria-label="Chess board">
      {ranks.map((r) =>
        files.map((f) => {
          const square = sqAt(f, r)
          const piece = board[r]![f]
          const algRank = 8 - r
          const isLight = (f + algRank) % 2 === 0
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
                <span className="coord rank">{algRank}</span>
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
