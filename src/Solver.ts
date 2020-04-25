import * as AvailableNumbers from "./AvailableNumbers"
import * as Constraints from "./Constraints"
import * as Sudoku from "./Sudoku"
import { DeepPartial } from "./types"
import { pow2, RandomGenerator, shuffleWith } from "./utils"

// tslint:disable-next-line: no-empty-interface
export interface CreateBoardConfig extends Sudoku.BoardConfig {
  randomGenerator: RandomGenerator
  constraints: Constraints.Constraints
}

export interface SolverConfig {
  randomGenerator?: RandomGenerator
}

interface SolverState {
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap
  board: Sudoku.Board
  filledCount: number
  result: "valid" | "invalid" | "impossible" | "unknown"
}

const defaultCreateBoardConfig: CreateBoardConfig = {
  boxHeight: 3,
  boxWidth: 3,
  constraints: Constraints.classicalConstraints,
  randomGenerator: Math.random,
}

const defaultSolverConfig: SolverConfig = {}

export const createSolverState = (board: Sudoku.Board): SolverState => {
  const nc = Sudoku.numberCount(board)
  const allNumbersAvailable = pow2(nc) - 1
  const availableNumbersMap = AvailableNumbers.createAvailableNumbersMap(board, allNumbersAvailable)
  const solverState: SolverState = {
    availableNumbersMap,
    board: Sudoku.createBoard(board),
    filledCount: 0,
    result: "unknown",
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

  const newSolverState = fillNextEmptyCell(addNumber(solverState)(availableNumbers[0], emptyCellPos), config)

  return newSolverState.result === "valid"
    ? newSolverState
    : tryNextAvailableNumber(solverState, config, availableNumbers.slice(1), emptyCellPos)
}

const fillEmptyCell = (solverState: SolverState, config: SolverConfig, emptyCellPos: Sudoku.CellPos) => {
  const availableNumbersMask = solverState.availableNumbersMap[emptyCellPos.row][emptyCellPos.col]
  const list = buildNumberListFromBitMask(availableNumbersMask)
  const availableNumbers = config.randomGenerator ? shuffleWith(config.randomGenerator)(list) : list

  return tryNextAvailableNumber(solverState, config, availableNumbers, emptyCellPos)
}

const fillNextEmptyCell = (solverState: SolverState, config: SolverConfig): SolverState => {
  const emptyCellPos = Sudoku.getFirstEmptyCellPos(solverState.board)

  return emptyCellPos === undefined
    ? {
        ...solverState,
        result: "valid",
      }
    : fillEmptyCell(solverState, config, emptyCellPos)
}

export const createBoard = (config: DeepPartial<CreateBoardConfig> = {}) => {
  const c = { ...defaultCreateBoardConfig, ...config }
  const board = Sudoku.createBoard(c)
  const solverState = createSolverState(board)

  const result = fillNextEmptyCell(solverState, c)

  return result.board
}

export const solveBoard = (board: Sudoku.Board, config: DeepPartial<SolverConfig> = {}) => {
  const c = { ...defaultSolverConfig, ...config }
  const solverState = createSolverState(board)

  return fillNextEmptyCell(solverState, c)
}
