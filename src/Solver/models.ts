import { AvailableNumbers, ConstraintsModels, SudokuModels, utils } from "../internal"
export type SolverNotifications = (solverState: SolverState) => void
export interface Config {
  constraints: ConstraintsModels.Constraints
  notifications: SolverNotifications
  randomGenerator: utils.RandomGenerator
  useRandomCells: boolean
}
export interface CreateBoardConfig extends SudokuModels.BoardConfig, Config {
}
export type SolverConfig = Config
export interface SolverNode {
  availableNumbers: number[]
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap
  availableNumbersPointer: number
  cellPos: SudokuModels.CellPos
}
export interface SolverState {
  board: SudokuModels.Board
  config: SolverConfig
  filledCount: number
  iterations: number
  nodes: SolverNode[]
  solutions: number
  result: "valid" | "invalid" | "impossible" | "unknown"
}
