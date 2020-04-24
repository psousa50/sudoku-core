import * as R from "ramda"
import * as AvailableNumbers from "./AvailableNumbers"
import * as Sudoku from "./Sudoku"
import { pow2, RandomGenerator, shuffleWith } from "./utils"

// tslint:disable-next-line: no-empty-interface
export interface FillBoardConfig extends Sudoku.BoardConfig {
}

export interface FillPrivateBoardConfig extends Sudoku.BoardConfig {
  randomGenerator: RandomGenerator
}

export interface SolveBoardPrivateConfig  {
  randomGenerator?: RandomGenerator
}

interface SolverInfo {
  board: Sudoku.Board
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap
  filledCount: number
  result: "valid" | "invalid" | "impossible" | "unknown"
}

export const createSolverInfo = (board: Sudoku.Board): SolverInfo => {
  const nc = Sudoku.numberCount(board)
  const allNumbersAvailable = pow2(nc) - 1
  const availableNumbersMap = AvailableNumbers.createAvailableNumbersMap(board, allNumbersAvailable)
  const solverInfo: SolverInfo = {
    availableNumbersMap,
    board: Sudoku.createBoard(board),
    filledCount: 0,
    result: "unknown",
  }

  return Sudoku.boardCellsPos(board).reduce((acc, cellPos) => {
    const cell = Sudoku.cell(board)(cellPos)
    return cell === Sudoku.emptyCell ? acc : addNumber(acc)(cell, cellPos)
  }, solverInfo)
}

export const addNumber = (solverInfo: SolverInfo) => (n: number, cellPos: Sudoku.CellPos) => ({
  ...solverInfo,
  availableNumbersMap: AvailableNumbers.setUnavailable(solverInfo.availableNumbersMap)(
    n,
    Sudoku.cellGroup(solverInfo.board)(cellPos),
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
  solverInfo: SolverInfo,
  config: SolveBoardPrivateConfig,
  availableNumbers: number[],
  emptyCellPos: Sudoku.CellPos,
): SolverInfo => {

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

const fillEmptyCell = (solverInfo: SolverInfo, config: SolveBoardPrivateConfig, emptyCellPos: Sudoku.CellPos) => {
  const availableNumbersMask = solverInfo.availableNumbersMap[emptyCellPos.row][emptyCellPos.col]
  const list = buildNumberListFromBitMask(availableNumbersMask)
  const availableNumbers = config.randomGenerator ? shuffleWith(config.randomGenerator)(list) : list

  return tryNextAvailableNumber(solverInfo, config, availableNumbers, emptyCellPos)
}

const fillNextEmptyCell = (solverInfo: SolverInfo, config: SolveBoardPrivateConfig): SolverInfo => {
  const emptyCellPos = Sudoku.getEmptyCellPos(solverInfo.board)

  return emptyCellPos === undefined
    ? {
        ...solverInfo,
        result: "valid",
      }
    : fillEmptyCell(solverInfo, config, emptyCellPos)
}

export const fillBoard = (config: FillBoardConfig) => fillBoardPrivate({ ...config, randomGenerator: Math.random })

export const fillBoardPrivate = (config: FillPrivateBoardConfig) => {
  const privateConfig = { randomGenerator: Math.random, ...config }
  const board = Sudoku.createBoard(privateConfig)
  const solverInfo = createSolverInfo(board)

  const result = fillNextEmptyCell(solverInfo, privateConfig)

  return result.board
}

export const solveBoard = (board: Sudoku.Board) => {
  const solverInfo = createSolverInfo(board)

  return fillNextEmptyCell(solverInfo, {})
}
