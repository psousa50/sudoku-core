import * as AvailableNumbers from "./AvailableNumbers"
import { Constraints } from "./Constraints"
import * as Sudoku from "./Sudoku2"
import { DeepPartial } from "./types"
import { pow2, RandomGenerator, shuffleWith } from "./utils"

// tslint:disable-next-line: no-empty-interface
export interface CreateBoardConfig extends Sudoku.BoardConfig {
  randomGenerator: RandomGenerator
  constraints: Constraints
}

export interface SolverConfig {
  randomGenerator?: RandomGenerator
  constraints: Constraints
}

interface SolverState {
  board: Sudoku.Board
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap
  filledCount: number
  result: "valid" | "invalid" | "impossible" | "unknown"
}

const defaultCreateBoardConfig: CreateBoardConfig = {
  boxHeight: 3,
  boxWidth: 3,
  constraints: [],
  randomGenerator: Math.random,
}

const defaultSolverConfig: SolverConfig = {
  constraints: [],
}

export const createSolverState = (board: Sudoku.Board): SolverState => {
  const nc = Sudoku.numberCount(board)
  const allNumbersAvailable = pow2(nc) - 1
  const availableNumbersMap = AvailableNumbers.createAvailableNumbersMap(board, allNumbersAvailable)
  const solverInfo: SolverState = {
    availableNumbersMap,
    board: Sudoku.createBoard(board),
    filledCount: 0,
    result: "unknown",
  }

  return Sudoku.allCellsPos(board).reduce((acc, cellPos) => {
    const cell = Sudoku.cell(board)(cellPos)
    return cell === Sudoku.emptyCell ? acc : addNumber(acc)(cell, cellPos)
  }, solverInfo)
}

export const addNumber = (solverInfo: SolverState) => (n: number, cellPos: Sudoku.CellPos) => ({
  ...solverInfo,
  availableNumbersMap: AvailableNumbers.setUnavailable(solverInfo.availableNumbersMap)(
    n,
    Sudoku.constrainedCells(solverInfo.board)(cellPos),
  ),
  board: Sudoku.addNumber(solverInfo.board)(n, cellPos),
  filledCount: solverInfo.filledCount + 1,
})

const buildNumberListFromBitMask = (bitMask: number) => {
  const buildList = (b: number, n: number, list: number[]): number[] =>
    b === 0 ? list : buildList(Math.floor(b / 2), n + 1, b % 2 === 0 ? list : [...list, n])

  return buildList(bitMask, 1, [])
}

const tryNextAvailableNumber = (
  solverInfo: SolverState,
  config: SolverConfig,
  availableNumbers: number[],
  emptyCellPos: Sudoku.CellPos,
): SolverState => {

  if (availableNumbers.length === 0) {
    return {
      ...solverInfo,
      result: "invalid",
    }
  }

  const newSolverInfo = fillNextEmptyCell(addNumber(solverInfo)(availableNumbers[0], emptyCellPos), config)

  return newSolverInfo.result === "valid"
    ? newSolverInfo
    : tryNextAvailableNumber(solverInfo, config, availableNumbers.slice(1), emptyCellPos)
}

const fillEmptyCell = (solverInfo: SolverState, config: SolverConfig, emptyCellPos: Sudoku.CellPos) => {
  const availableNumbersMask = solverInfo.availableNumbersMap[emptyCellPos.row][emptyCellPos.col]
  const list = buildNumberListFromBitMask(availableNumbersMask)
  const availableNumbers = config.randomGenerator ? shuffleWith(config.randomGenerator)(list) : list

  return tryNextAvailableNumber(solverInfo, config, availableNumbers, emptyCellPos)
}

const fillNextEmptyCell = (solverInfo: SolverState, config: SolverConfig): SolverState => {
  const emptyCellPos = Sudoku.getFirstEmptyCellPos(solverInfo.board)

  return emptyCellPos === undefined
    ? {
        ...solverInfo,
        result: "valid",
      }
    : fillEmptyCell(solverInfo, config, emptyCellPos)
}

export const createBoard = (config: DeepPartial<CreateBoardConfig> = {}) => {
  const c = { ...defaultCreateBoardConfig, ...config }
  const board = Sudoku.createBoard(c)
  const solverInfo = createSolverState(board)

  const result = fillNextEmptyCell(solverInfo, c)

  return result.board
}

export const solveBoard = (board: Sudoku.Board, config: DeepPartial<SolverConfig> = {}) => {
  const c = { ...defaultSolverConfig, ...config }
  const solverInfo = createSolverState(board)

  return fillNextEmptyCell(solverInfo, c)
}
