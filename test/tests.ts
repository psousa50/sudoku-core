import random from "random"
import seedrandom from "seedrandom"
import { Constraints, helpers, Solver as SudokuSolver, Sudoku, utils } from "../src/internal"

export const test1 = () => {
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
  const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 }, helpers.buildBoardCells(cells))

  const result = SudokuSolver.solveBoard(board)

  const t1 = Date.now()
  console.log(helpers.boardToString(result.board))
  const t2 = Date.now()
  console.log(t2 - t1)
}

export const performance = () => {
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
  const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 }, helpers.buildBoardCells(cells))

  const t1 = Date.now()
  const result = SudokuSolver.solveBoard(board)
  const t2 = Date.now()

  console.log(helpers.boardToString(result.board))
  console.log(result.iterations)
  console.log(t2 - t1)
}

export const test3 = () => {
  random.use(seedrandom("1"))
  const randomGenerator = () => random.float()

  const validBoard = SudokuSolver.createBoard({ boxWidth: 3, boxHeight: 3, randomGenerator })
  console.log(helpers.boardToString(validBoard.board))
  console.log("========================\n")

  const cellsToRemove = utils.shuffleWith(randomGenerator)(Sudoku.allCellsPos(validBoard.board)).slice(1)
  const puzzle = cellsToRemove.reduce((acc, cell) => Sudoku.clearCell(acc)(cell), validBoard.board)
  console.log(helpers.boardToString(puzzle))
  console.log("========================\n")

  const result = SudokuSolver.solveBoard(puzzle)
  console.log(helpers.boardToString(result.board))
  console.log("========================\n")
}

export const test4 = () => {
  const cells = [
    ".........",
    ".........",
    ".........",
    "384672...",
    "...159...",
    "...834...",
    ".........",
    ".........",
    "........2",
  ]

  const constraints = [
    ...Constraints.classicalConstraints,
    Constraints.diagonalConstraint,
    Constraints.knightMoveConstraint,
  ]
  const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3, constraints }, helpers.buildBoardCells(cells))

  const result = SudokuSolver.solveBoard(board)

  console.log(helpers.boardToString(result.board))
  console.log(result.iterations)
  console.log(result.solutions)
  console.log(result.result)
}

export const test5 = () => {
  const constraints = [
    ...Constraints.classicalConstraints,
    // Constraints.diagonalConstraint,
    // Constraints.knightMoveConstraint,
  ]
  const result = SudokuSolver.createBoard({ boxWidth: 3, boxHeight: 3, constraints })

  console.log(helpers.boardToString(result.board))

  console.log()

  console.log("filledCount", result.filledCount)
  console.log("iterations", result.iterations)
  console.log("solutions", result.solutions)
}

export const test6 = () => {
  const cells = [
    ".8..47...",
    "36.......",
    "..7615..2",
    "7.1......",
    ".3.......",
    "24.......",
    ".........",
    ".........",
    ".........",
  ]

  const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 }, helpers.buildBoardCells(cells))
  // const r1 = SudokuSolver.startSolveBoard(board)
  const result = SudokuSolver.solveBoard(board)

  console.log(helpers.boardToString(result.board))
  console.log("=====>\n", result.iterations)
}

test4()
