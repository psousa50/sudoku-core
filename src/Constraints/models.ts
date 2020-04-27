import { SudokuModels } from "../internal"

export type Constraint = (board: SudokuModels.Board) => (cellPos: SudokuModels.CellPos) => SudokuModels.CellPos[]
export type Constraints = Constraint[]
