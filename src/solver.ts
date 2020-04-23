import * as AvailableNumbers from "./AvailableNumbers"
import * as Sudoku from "./Sudoku"
import { RandomGenerator, shuffle } from "./utils"

export interface FillBoardConfig extends Sudoku.BoardConfig {
  randomGenerator: RandomGenerator
}

export interface SolveBoardConfig {
  randomGenerator: RandomGenerator
}

interface SolverInfo {
  board: Sudoku.Board
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap
  filledCount: number
  result: "valid" | "invalid" | "impossible" | "unknown"
}

export const createSolverInfo = (board: Sudoku.Board): SolverInfo => {
  const nc = Sudoku.numberCount(board)
  const allNumbersAvailable = Math.pow(2, nc) - 1
  const availableNumbersMap = AvailableNumbers.createAvailableNumbersMap(board, allNumbersAvailable)
  let solverInfo: SolverInfo = {
    availableNumbersMap,
    board: Sudoku.createBoard(board),
    filledCount: 0,
    result: "unknown",
  }

  const iter = Sudoku.boardIterator(board)
  let done: boolean | undefined = false
  while (!done) {
    const p = iter.next()
    if (!p.done) {
      const cellPos = p.value
      const cell = Sudoku.cell(board)(cellPos)
      if (cell !== Sudoku.emptyCell) {
        solverInfo = addNumber(solverInfo)(cell, cellPos)
       }
    }
    done = p.done
  }

  return solverInfo

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
  let b = bitMask
  let list = [] as number[]
  let n = 1
  while (b > 0) {
    const b1 = Math.floor(b / 2)
    if (b1 !== b / 2) {
      list = [...list, n]
    }
    n = n + 1
    b = b1
  }

  return list
}

const fillBoardRec = (solverInfo: SolverInfo, config: SolveBoardConfig): SolverInfo => {
  const emptyCell = Sudoku.getEmptyCellPos(solverInfo.board)

  if (emptyCell === undefined) {
    return {
      ...solverInfo,
      result: "valid",
    }
  }

  const availableNumbersMask = solverInfo.availableNumbersMap[emptyCell.row][emptyCell.col]
  let availableNumbers = shuffle(config.randomGenerator)(buildNumberListFromBitMask(availableNumbersMask))
  let done = availableNumbers.length === 0
  let solverInfoResult: SolverInfo = {
    ...solverInfo,
    result: "invalid",
  }

  while (!done) {
    const n = availableNumbers[0]
    availableNumbers = availableNumbers.slice(1)
    solverInfoResult = fillBoardRec(addNumber(solverInfo)(n, emptyCell), config)
    done = solverInfoResult.result === "valid" || availableNumbers.length === 0
  }

  return solverInfoResult
}

export const fillBoard = (config: FillBoardConfig) => {
  const board = Sudoku.createBoard(config)
  const solverInfo = createSolverInfo(board)
  const result = fillBoardRec(solverInfo, config)

  return result.board
}

export const solveBoard = (board: Sudoku.Board) => {
  const solverInfo = createSolverInfo(board)

  const result = fillBoardRec(solverInfo, { randomGenerator: () => 0.9 })

  return result.board
}
