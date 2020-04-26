import random from "random"
import seedrandom from "seedrandom"
import * as Constraints from "../src/Constraints"
import * as SudokuSolver from "../src/Solver"
import * as Sudoku from "../src/Sudoku"
import { shuffleWith } from "../src/utils"
import { boardToString, buildBoardCells } from "./helpers"

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
  const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 }, buildBoardCells(cells))

  const result = SudokuSolver.solveBoard(board)

  const t1 = Date.now()
  console.log(boardToString(result.board))
  const t2 = Date.now()
  console.log("=====>\n", t2 - t1)
}

export const test2 = () => {
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
  const result = SudokuSolver.solveBoard(board)
  const t2 = Date.now()

  console.log(JSON.stringify(result, null, 2))

  console.log(boardToString(result.board))
  console.log(t2 - t1)
}

export const test3 = () => {
  random.use(seedrandom("1"))
  const randomGenerator = () => random.float()

  const validBoard = SudokuSolver.createBoard({ boxWidth: 3, boxHeight: 3, randomGenerator })
  console.log(boardToString(validBoard))
  console.log("========================\n")

  const cellsToRemove = shuffleWith(randomGenerator)(Sudoku.allCellsPos(validBoard)).slice(1)
  const puzzle = cellsToRemove.reduce((acc, cell) => Sudoku.clearCell(acc)(cell), validBoard)
  console.log(boardToString(puzzle))
  console.log("========================\n")

  const result = SudokuSolver.solveBoard(puzzle)
  console.log(boardToString(result.board))
  console.log("========================\n")
}

export const test4 = () => {
  const cells = [
    ".........",
    ".........",
    ".........",
    "384......",
    ".........",
    ".........",
    ".........",
    ".........",
    "........2",
  ]

  const constraints = [
    ...Constraints.classicalConstraints,
    Constraints.diagonalConstraint,
    Constraints.knightMoveConstraint,
  ]
  const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3, constraints }, buildBoardCells(cells))

  const result = SudokuSolver.solveBoard(board)

  console.log(boardToString(result.board))
}

export const test5 = () => {
  const constraints = [
    ...Constraints.classicalConstraints,
    // Constraints.diagonalConstraint,
    // Constraints.knightMoveConstraint,
  ]
  const result = SudokuSolver.createBoardFull({ boxWidth: 4, boxHeight: 4, constraints })

  console.log(boardToString(result.board))

  console.log()

  console.log("filledCount", result.filledCount)
  console.log("iterations", result.iterations)
  console.log("solutions", result.solutions)

}

test5()
