import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Square } from 'chess.js'
import { Board, type BoardSquare } from './Board'
import { pickBotMove, type Difficulty } from './bot'
import './App.css'

type Side = 'w' | 'b'

function statusText(chess: Chess, playerSide: Side, thinking: boolean): string {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'Black' : 'White'
    return `Checkmate — ${winner} wins`
  }
  if (chess.isStalemate()) return 'Stalemate — draw'
  if (chess.isDraw()) return 'Draw'
  if (thinking || chess.turn() !== playerSide) {
    return chess.isCheck() ? 'Check — bot thinking…' : 'Bot thinking…'
  }
  return chess.isCheck() ? 'Check — your move' : 'Your move'
}

export default function App() {
  const [fen, setFen] = useState(() => new Chess().fen())
  const [history, setHistory] = useState<string[]>([])
  const [playerSide, setPlayerSide] = useState<Side>('w')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [selected, setSelected] = useState<Square | null>(null)
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(
    null,
  )
  const [thinking, setThinking] = useState(false)
  const [menuOpen, setMenuOpen] = useState(true)
  const botGen = useRef(0)

  const chess = useMemo(() => new Chess(fen), [fen])
  const board = chess.board() as BoardSquare[][]
  const gameOver = chess.isGameOver()
  const isPlayerTurn = !gameOver && chess.turn() === playerSide && !thinking

  const legalTargets = useMemo(() => {
    const set = new Set<string>()
    if (!selected || !isPlayerTurn) return set
    for (const m of chess.moves({ square: selected, verbose: true })) {
      set.add(m.to)
    }
    return set
  }, [chess, selected, isPlayerTurn])

  const checkSquare = useMemo(() => {
    if (!chess.isCheck()) return null
    const board = chess.board()
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r]![f]
        if (p?.type === 'k' && p.color === chess.turn()) {
          return `${'abcdefgh'[f]}${8 - r}` as Square
        }
      }
    }
    return null
  }, [chess])

  const applyPlayerMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      const next = new Chess(fen)
      const moved = next.move({
        from,
        to,
        promotion: (promotion as 'q' | 'r' | 'b' | 'n') ?? 'q',
      })
      if (!moved) return false
      setHistory((h) => [...h, fen])
      setFen(next.fen())
      setLastMove({ from: moved.from, to: moved.to })
      setSelected(null)
      return true
    },
    [fen],
  )

  useEffect(() => {
    if (gameOver) return
    if (chess.turn() === playerSide) return

    const gen = ++botGen.current
    let cancelled = false
    setThinking(true)
    const t = window.setTimeout(() => {
      if (cancelled || gen !== botGen.current) return
      try {
        const move = pickBotMove(fen, difficulty)
        if (move && !cancelled && gen === botGen.current) {
          const next = new Chess(fen)
          next.move(move)
          setHistory((h) => [...h, fen])
          setFen(next.fen())
          setLastMove({ from: move.from, to: move.to })
        }
      } finally {
        if (!cancelled && gen === botGen.current) setThinking(false)
      }
    }, 50)

    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [fen, playerSide, difficulty, gameOver, chess])

  function onSquareClick(sq: Square) {
    if (!isPlayerTurn) return
    const piece = chess.get(sq)

    if (selected) {
      if (selected === sq) {
        setSelected(null)
        return
      }
      if (legalTargets.has(sq)) {
        const needsPromo =
          chess.get(selected)?.type === 'p' &&
          ((chess.turn() === 'w' && sq[1] === '8') ||
            (chess.turn() === 'b' && sq[1] === '1'))
        applyPlayerMove(selected, sq, needsPromo ? 'q' : undefined)
        return
      }
      if (piece && piece.color === playerSide) {
        setSelected(sq)
        return
      }
      setSelected(null)
      return
    }

    if (piece && piece.color === playerSide) {
      setSelected(sq)
    }
  }

  function newGame(side: Side = playerSide, diff: Difficulty = difficulty) {
    botGen.current += 1
    setThinking(false)
    setFen(new Chess().fen())
    setHistory([])
    setSelected(null)
    setLastMove(null)
    setPlayerSide(side)
    setDifficulty(diff)
    setMenuOpen(false)
  }

  function undo() {
    if (thinking || history.length === 0) return
    botGen.current += 1
    setThinking(false)
    setSelected(null)
    setLastMove(null)

    // Prefer undoing a full player+bot exchange so it's your turn again
    let h = [...history]
    let nextFen = h.pop()!
    const afterUndo = new Chess(nextFen)
    if (afterUndo.turn() !== playerSide && h.length > 0) {
      nextFen = h.pop()!
    }
    setHistory(h)
    setFen(nextFen)
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="logo" aria-hidden>
            ♞
          </span>
          <div>
            <h1>Bot Chess</h1>
            <p className="status">{statusText(chess, playerSide, thinking)}</p>
          </div>
        </div>
        <button
          type="button"
          className="btn ghost"
          onClick={() => setMenuOpen(true)}
        >
          New
        </button>
      </header>

      <main className="stage">
        <Board
          board={board}
          orientation={playerSide}
          selected={selected}
          legalTargets={legalTargets}
          lastMove={lastMove}
          checkSquare={checkSquare}
          disabled={!isPlayerTurn}
          onSquareClick={onSquareClick}
        />
      </main>

      <footer className="bar">
        <button
          type="button"
          className="btn"
          onClick={undo}
          disabled={thinking || history.length === 0}
        >
          Undo
        </button>
        <div className="meta">
          <span>{playerSide === 'w' ? 'You · White' : 'You · Black'}</span>
          <span className="sep">·</span>
          <span className="cap">{difficulty}</span>
        </div>
        <button type="button" className="btn primary" onClick={() => newGame()}>
          New game
        </button>
      </footer>

      {menuOpen ? (
        <div className="overlay" role="dialog" aria-label="New game">
          <div className="sheet">
            <h2>New game</h2>
            <label className="field">
              <span>Play as</span>
              <div className="seg">
                <button
                  type="button"
                  className={playerSide === 'w' ? 'on' : ''}
                  onClick={() => setPlayerSide('w')}
                >
                  White
                </button>
                <button
                  type="button"
                  className={playerSide === 'b' ? 'on' : ''}
                  onClick={() => setPlayerSide('b')}
                >
                  Black
                </button>
              </div>
            </label>
            <label className="field">
              <span>Difficulty</span>
              <div className="seg">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={difficulty === d ? 'on' : ''}
                    onClick={() => setDifficulty(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </label>
            <button
              type="button"
              className="btn primary wide"
              onClick={() => newGame(playerSide, difficulty)}
            >
              Start
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
