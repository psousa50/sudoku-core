import { AvailableNumbers, Constraints, SudokuModels, utils } from "../internal"

export type SolverNotifications = (solverState: SolverState) => void

export interface Config {
  constraints: Constraints.Constraints
  notifications: SolverNotifications
  randomGenerator: utils.RandomGenerator
  useRandomCells: boolean
}
export interface CreateBoardConfig extends SudokuModels.BoardConfig, Config {}
export type SolverConfig = Config
export interface SolverNode {
  availableNumbers: number[]
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap
  availableNumbersPointer: number
  cellPos: SudokuModels.CellPos
}

export enum Outcomes {
  valid = "valid",
  invalid = "invalid",
  impossible = "impossible",
  unknown = "unknown",
}

export interface SolverState {
  board: SudokuModels.Board
  config: SolverConfig
  filledCount: number
  iterations: number
  nodes: SolverNode[]
  solutions: number
  outcome: Outcomes.impossible | Outcomes.invalid | Outcomes.unknown | Outcomes.valid
}
