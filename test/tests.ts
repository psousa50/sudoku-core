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

export const solveInvalid = () => {
  const cells = [
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ]
  const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 }, helpers.buildBoardCells(cells))

  const result = SudokuSolver.solveBoard(board)

  console.log(helpers.boardToString(result.board))
  console.log(result.iterations)
  console.log(result.solutions)
  console.log(result.outcome)
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

export const generatePuzzle = () => {
  random.use(seedrandom("1"))
  const randomGenerator = () => random.float()

  const validBoard = SudokuSolver.createBoard({ boxWidth: 4, boxHeight: 4, randomGenerator })
  console.log(helpers.boardToString(validBoard.board))
  console.log("========================\n")

  const allCells = Sudoku.allCellsPos(validBoard.board)
  const cellsToRemove = utils.shuffle(allCells).slice(0, Math.max(1, allCells.length * 0.4))
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
  console.log(result.outcome)
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
  console.log("=====>", result.iterations)
}

export const medium4x4 = () => {
  const cells = [
    "4.G..9.7F.6..2.B",
    ".1.EC.A..5.49.7.",
    "C..5F..D2..18..3",
    ".36...B..9...45.",
    ".43...F..1...E8.",
    "D......2G......4",
    ".B.18......CD.F.",
    "5.F..6....B..3.A",
    "9.2..B....4..D.F",
    ".8.FG......EB.6.",
    "6......97......2",
    ".5D...7..B...CA.",
    ".CE...6..F...52.",
    "B..63..FE..8G..9",
    ".G.D7.8..4.5F.1.",
    "8.7..4.A3.C..B.E",
  ]

  const board = Sudoku.createBoard({ boxWidth: 4, boxHeight: 4 }, helpers.buildBoardCells(cells))
  const result = SudokuSolver.solveBoard(board)

  console.log(helpers.boardToString(result.board))
  console.log("iterations", result.iterations)
  console.log("solutions", result.solutions)
}

export const hard4x4 = () => {
  const cells = [
    ".7....3..C....A.",
    "G4....9..E....B6",
    "...3G.C..1.9F...",
    "..5..D.B3.7..4..",
    "..B..G.58.2..1..",
    "...91.F..6.A3...",
    "ACE..9....1..F74",
    "...76..AC..D5...",
    "...E9..G1..B4...",
    "D6A..C....3..B15",
    "...4F.7..5.G2...",
    "..3..E.6F.4..9..",
    "..2..A.F4.5..6..",
    "...GB.D..9.7A...",
    "4F....5..B....E2",
    ".9....8..3....5.",
  ]

  const board = Sudoku.createBoard({ boxWidth: 4, boxHeight: 4 }, helpers.buildBoardCells(cells))
  const result = SudokuSolver.solveBoard(board)

  console.log(helpers.boardToString(result.board))
  console.log("=====>", result.iterations)
}

generatePuzzle()
