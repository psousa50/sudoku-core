import * as R from "ramda"
import * as Sudoku from "./Sudoku"

export type Constraint = (board: Sudoku.Board) => (cellPos: Sudoku.CellPos) => Sudoku.CellPos[]
export type Constraints = Constraint[]

export const rowConstraint: Constraint = (board) => (cellPos) => {
  const nc = Sudoku.numberCount(board)
  return new Array(nc).fill(undefined).map((_, i) => ({ row: cellPos.row, col: i }))
}

export const colConstraint: Constraint = (board) => (cellPos) => {
  const nc = Sudoku.numberCount(board)
  return new Array(nc).fill(undefined).map((_, i) => ({ row: i, col: cellPos.col }))
}

export const boxConstraint: Constraint = (board) => (cellPos) => {
  const boxRow = Math.floor(cellPos.row / board.boxHeight) * board.boxHeight
  const boxCol = Math.floor(cellPos.col / board.boxWidth) * board.boxWidth

  return R.flatten(
    new Array(board.boxHeight)
      .fill(undefined)
      .map((_, r) => new Array(board.boxWidth).fill(undefined).map((__, c) => ({ row: boxRow + r, col: boxCol + c }))),
  )
}

export const classicalConstraints: Constraints = [rowConstraint, colConstraint, boxConstraint]

export const build = (constraints: Constraints) => (board: Sudoku.Board) => (cellPos: Sudoku.CellPos) =>
  constraints.reduce((acc, constraint) => [...acc, ...constraint(board)(cellPos)], [] as Sudoku.CellPos[])
  .filter((c, i, cells) => cells.findIndex(Sudoku.cellPosIsEqual(c)) === i)
