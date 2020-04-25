import * as Sudoku from "./Sudoku2"

export type Constraint = (cellPos: Sudoku.CellPos) => Sudoku.CellPos[]
export type Constraints = Constraint[]
