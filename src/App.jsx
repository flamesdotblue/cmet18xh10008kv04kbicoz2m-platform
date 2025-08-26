import { useState, useMemo, useEffect } from 'react'

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] }
    }
  }
  return { player: null, line: [] }
}

export default function App() {
  const empty = Array(9).fill(null)
  const [board, setBoard] = useState(empty)
  const [xIsNext, setXIsNext] = useState(true)
  const [history, setHistory] = useState([]) // each item: { board, xIsNext }
  const [scores, setScores] = useState(() => ({ X: 0, O: 0, draws: 0 }))

  const { player: winner, line: winLine } = useMemo(() => calculateWinner(board), [board])
  const movesPlayed = useMemo(() => board.filter(Boolean).length, [board])
  const isDraw = !winner && movesPlayed === 9

  useEffect(() => {
    if (winner) {
      setScores((s) => ({ ...s, [winner]: s[winner] + 1 }))
    } else if (isDraw) {
      setScores((s) => ({ ...s, draws: s.draws + 1 }))
    }
    // We only want to update scores when a terminal state is first reached; rely on board changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, isDraw])

  function handleClick(i) {
    if (board[i] || winner) return
    const nextBoard = board.slice()
    nextBoard[i] = xIsNext ? 'X' : 'O'
    setHistory((h) => [...h, { board, xIsNext }])
    setBoard(nextBoard)
    setXIsNext(!xIsNext)
  }

  function undo() {
    if (history.length === 0 || winner || isDraw) return
    const prev = history[history.length - 1]
    setHistory(history.slice(0, -1))
    setBoard(prev.board)
    setXIsNext(prev.xIsNext)
  }

  function newGame() {
    setBoard(empty)
    setXIsNext(true)
    setHistory([])
  }

  function resetScores() {
    setScores({ X: 0, O: 0, draws: 0 })
    newGame()
  }

  const status = winner
    ? `Winner: ${winner}`
    : isDraw
    ? 'Draw'
    : `Next: ${xIsNext ? 'X' : 'O'}`

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Tic-Tac-Toe</h1>
          <p className="mt-1 text-slate-600">First to get three in a row wins.</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge color="indigo">X: {scores.X}</Badge>
            <Badge color="rose">O: {scores.O}</Badge>
            <Badge color="slate">Draws: {scores.draws}</Badge>
          </div>
          <div className="text-sm font-medium" aria-live="polite">{status}</div>
        </div>

        <Board
          board={board}
          winLine={winLine}
          onClick={handleClick}
          disabled={Boolean(winner) || isDraw}
        />

        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            onClick={undo}
            disabled={history.length === 0 || winner || isDraw}
            className={cx(
              'px-3 py-2 rounded-md text-sm font-medium border transition',
              history.length === 0 || winner || isDraw
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            )}
          >
            Undo
          </button>
          <button
            onClick={newGame}
            className="px-3 py-2 rounded-md text-sm font-medium border bg-white hover:bg-slate-50 border-slate-200 text-slate-700 transition"
          >
            New Game
          </button>
          <button
            onClick={resetScores}
            className="px-3 py-2 rounded-md text-sm font-medium border bg-white hover:bg-slate-50 border-slate-200 text-slate-700 transition"
          >
            Reset Scores
          </button>
        </div>

        <footer className="mt-6 text-center text-xs text-slate-500">
          Tip: Click a square to place your mark. Undo works only before a game ends.
        </footer>
      </div>
    </div>
  )
}

function Board({ board, winLine, onClick, disabled }) {
  return (
    <div
      className="grid grid-cols-3 gap-2 select-none"
      role="grid"
      aria-label="Tic tac toe board"
    >
      {board.map((value, i) => {
        const isWin = winLine.includes(i)
        return (
          <Square
            key={i}
            value={value}
            onClick={() => onClick(i)}
            isWinning={isWin}
            disabled={disabled || Boolean(value)}
            index={i}
          />
        )
      })}
    </div>
  )
}

function Square({ value, onClick, isWinning, disabled, index }) {
  const base = 'aspect-square w-full rounded-xl border text-4xl font-bold flex items-center justify-center transition'
  const enabled = 'bg-white hover:bg-slate-50 active:scale-[0.99] border-slate-200 text-slate-800'
  const disabledCls = 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
  const win = 'bg-emerald-100 border-emerald-300 text-emerald-700'

  const label = value
    ? `Cell ${index + 1}, ${value}`
    : `Cell ${index + 1}, empty`

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cx(base, disabled ? disabledCls : enabled, isWinning && win)}
    >
      <span className={cx(value === 'X' ? 'text-indigo-600' : 'text-rose-600')}>{value}</span>
    </button>
  )
}

function Badge({ children, color = 'slate' }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    indigo: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
    rose: 'bg-rose-100 text-rose-700 ring-rose-200',
  }
  return (
    <span className={cx('inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset', colors[color] || colors.slate)}>
      {children}
    </span>
  )
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}
