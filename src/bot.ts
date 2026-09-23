import { Chess, type Move, type Square } from 'chess.js'

const PIECE_VALUE: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
}

// Simplified piece-square tables (white perspective; flip for black)
const PST: Record<string, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
  ],
}

function index(file: number, rank: number, color: 'w' | 'b'): number {
  return color === 'w' ? rank * 8 + file : (7 - rank) * 8 + file
}

function evaluate(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -100000 : 100000
  }
  if (chess.isDraw() || chess.isStalemate()) return 0

  let score = 0
  const board = chess.board()
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r]![f]
      if (!sq) continue
      const type = sq.type
      const val = PIECE_VALUE[type]!
      const pst = PST[type]?.[index(f, r, sq.color)] ?? 0
      const s = val + pst
      score += sq.color === 'w' ? s : -s
    }
  }
  return score
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const capA = a.captured ? PIECE_VALUE[a.captured]! : 0
    const capB = b.captured ? PIECE_VALUE[b.captured]! : 0
    return capB - capA
  })
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluate(chess)
  }

  const moves = orderMoves(chess.moves({ verbose: true }))
  if (maximizing) {
    let best = -Infinity
    for (const m of moves) {
      chess.move(m)
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false))
      chess.undo()
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  }

  let best = Infinity
  for (const m of moves) {
    chess.move(m)
    best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true))
    chess.undo()
    beta = Math.min(beta, best)
    if (beta <= alpha) break
  }
  return best
}

export type Difficulty = 'easy' | 'medium' | 'hard'

const DEPTH: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
}

export function pickBotMove(fen: string, difficulty: Difficulty): Move | null {
  const chess = new Chess(fen)
  const moves = orderMoves(chess.moves({ verbose: true }))
  if (moves.length === 0) return null

  // Easy: sometimes pick a random legal move
  if (difficulty === 'easy' && Math.random() < 0.35) {
    return moves[Math.floor(Math.random() * moves.length)]!
  }

  const depth = DEPTH[difficulty]
  const maximizing = chess.turn() === 'w'
  let bestMove = moves[0]!
  let bestScore = maximizing ? -Infinity : Infinity

  for (const m of moves) {
    chess.move(m)
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !maximizing)
    chess.undo()
    if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score
      bestMove = m
    }
  }

  // Tiny jitter on medium so games aren't identical
  if (difficulty === 'medium' && moves.length > 1 && Math.random() < 0.15) {
    return moves[Math.floor(Math.random() * Math.min(3, moves.length))]!
  }

  return bestMove
}

export type { Square }
