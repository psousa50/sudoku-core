import * as AvailableNumbers from "./AvailableNumbers"
import * as Constraints from "./Constraints"
import * as Sudoku from "./Sudoku"
import { DeepPartial } from "./types"
import { pow2, RandomGenerator, shuffleWith } from "./utils"

export type SolverNotifications = (solverState: SolverState) => void

export interface Config {
  constraints: Constraints.Constraints
  notifications: SolverNotifications
  randomGenerator: RandomGenerator
  useRandomCells: boolean
}

export interface CreateBoardConfig extends Sudoku.BoardConfig, Config {}

export type SolverConfig = Config

export interface SolverState {
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap
  board: Sudoku.Board
  filledCount: number
  iterations: number
  solutions: number
  result: "valid" | "invalid" | "impossible" | "unknown"
}

const defaultConfig: Config = {
  constraints: Constraints.classicalConstraints,
  notifications: () => undefined,
  randomGenerator: Math.random,
  useRandomCells: true,
}

const defaultCreateBoardConfig: CreateBoardConfig = {
  ...defaultConfig,
  boxHeight: 3,
  boxWidth: 3,
}

const defaultSolverConfig: SolverConfig = {
  ...defaultConfig,
  useRandomCells: false,
}

export const createSolverState = (board: Sudoku.Board): SolverState => {
  const nc = Sudoku.numberCount(board)
  const allNumbersAvailable = pow2(nc) - 1
  const availableNumbersMap = AvailableNumbers.createAvailableNumbersMap(board, allNumbersAvailable)
  const solverState: SolverState = {
    availableNumbersMap,
    board: Sudoku.createBoard(board),
    filledCount: 0,
    iterations: 0,
    result: "unknown",
    solutions: 0,
  }

  return Sudoku.allCellsPos(board).reduce((acc, cellPos) => {
    const cell = Sudoku.cell(board)(cellPos)
    return cell === Sudoku.emptyCell ? acc : addNumber(acc)(cell, cellPos)
  }, solverState)
}

export const addNumber = (solverState: SolverState) => (n: number, cellPos: Sudoku.CellPos) => ({
  ...solverState,
  availableNumbersMap: AvailableNumbers.setUnavailable(solverState.availableNumbersMap)(
    n,
    Constraints.build(solverState.board.constraints)(solverState.board)(cellPos),
  ),
  board: Sudoku.addNumber(solverState.board)(n, cellPos),
  filledCount: solverState.filledCount + 1,
})

const buildNumberListFromBitMask = (bitMask: number) => {
  const buildList = (b: number, n: number, list: number[]): number[] =>
    b === 0 ? list : buildList(Math.floor(b / 2), n + 1, b % 2 === 0 ? list : [...list, n])

  return buildList(bitMask, 1, [])
}

const tryNextAvailableNumber = (
  solverState: SolverState,
  config: SolverConfig,
  availableNumbers: number[],
  emptyCellPos: Sudoku.CellPos,
): SolverState => {
  if (availableNumbers.length === 0) {
    return {
      ...solverState,
      result: "invalid",
    }
  }

  const newSolverState = fillboard(addNumber(solverState)(availableNumbers[0], emptyCellPos), config)

  return newSolverState.result === "valid"
    ? newSolverState
    : tryNextAvailableNumber(solverState, config, availableNumbers.slice(1), emptyCellPos)
}

const fillEmptyCell = (solverState: SolverState, config: SolverConfig, emptyCellPos: Sudoku.CellPos) => {
  const availableNumbersMask = solverState.availableNumbersMap[emptyCellPos.row][emptyCellPos.col]
  const numbersList = buildNumberListFromBitMask(availableNumbersMask)
  const availableNumbers = config.useRandomCells ? shuffleWith(config.randomGenerator)(numbersList) : numbersList

  return tryNextAvailableNumber(solverState, config, availableNumbers, emptyCellPos)
}

const fillboard = (solverState: SolverState, config: SolverConfig): SolverState => {
  const newSolverState = {
    ...solverState,
    iterations: solverState.iterations + 1,
  }

  const emptyCellPos = Sudoku.getFirstEmptyCellPos(newSolverState.board)

  config.notifications(newSolverState)

  return emptyCellPos === undefined
    ? {
        ...newSolverState,
        result: "valid",
        solutions: newSolverState.solutions + 1,
      }
    : fillEmptyCell(newSolverState, config, emptyCellPos)
}

export const createBoardFull = (config: DeepPartial<CreateBoardConfig> = {}) => {
  const c = { ...defaultCreateBoardConfig, ...config }
  const board = Sudoku.createBoard(c)
  const solverState = createSolverState(board)

  const result = fillboard(solverState, c)

  return result
}

export const createBoard = (config: DeepPartial<CreateBoardConfig> = {}) => createBoardFull(config).board

export const solveBoard = (board: Sudoku.Board, config: DeepPartial<SolverConfig> = {}) => {
  const c = { ...defaultSolverConfig, ...config }
  const solverState = createSolverState(board)

  return fillboard(solverState, c)
}
