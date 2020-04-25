import * as Sudoku from "./Sudoku"

export type Constraint = (cellPos: Sudoku.CellPos) => Sudoku.CellPos[]
export type Constraints = Constraint[]
