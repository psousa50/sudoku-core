import * as SudokuSolver from "../src/Solver"
import * as Sudoku from "../src/Sudoku"
import { boardToString, buildBoardCells } from "./helpers"

const test1 = () => {
  const cells = [
    ".......2.",
    ".3...9..6",
    "..1.47...",
    "...1..47.",
    "..5...3..",
    ".27..8...",
    "...53.8..",
    "8..2...6.",
    ".1.......",
  ]
  const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 }, buildBoardCells(cells))

  const result = SudokuSolver.solveBoard(board)

  const t1 = Date.now()
  console.log(boardToString(result.board))
  const t2 = Date.now()
  console.log("=====>\n", t2 - t1)
}

const test2 = () => {
  const cells = [
    ".4...6.3.",
    "7...4...1",
    "...8..9..",
    "..1.....8",
    ".2..3..6.",
    "3.....1..",
    "..7..4...",
    "1...8...7",
    ".6.3...2.",
  ]
  const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 }, buildBoardCells(cells))

  const t1 = Date.now()
  SudokuSolver.solveBoard(board)
  SudokuSolver.solveBoard(board)
  SudokuSolver.solveBoard(board)
  SudokuSolver.solveBoard(board)
  SudokuSolver.solveBoard(board)
  SudokuSolver.solveBoard(board)
  const result = SudokuSolver.solveBoard(board)
  const t2 = Date.now()

  console.log(boardToString(result.board))
  console.log(t2 - t1)
}

test2()
