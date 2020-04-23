import * as AvailableNumbers from "./AvailableNumbers"
import * as Sudoku from "./Sudoku"
import { Cell } from "./Sudoku"

export type RandomCellGenerator = (max: number) => Cell
export const defaultRandomCell: RandomCellGenerator = (max) => Math.floor(Math.random() * max) + 1

export interface FillBoardConfig extends Sudoku.BoardConfig {
  randomCellGenerator: RandomCellGenerator
}

interface SolverInfo {
  board: Sudoku.Board
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap
  filledCount: number
}

export const createSolverInfo = (config: Sudoku.BoardConfig): SolverInfo => {
  const nc = Sudoku.numberCount(config)
  const allNumbersAvailable = Math.pow(2, nc) - 1
  return {
    availableNumbersMap: AvailableNumbers.createAvailableNumbersMap(config, allNumbersAvailable),
    board: Sudoku.createBoard(config),
    filledCount: 0,
  }
}

export const addNumber = (solverInfo: SolverInfo) => (n: number, cellPos: Sudoku.CellPos) => ({
  ...solverInfo,
  availableNumbersMap: AvailableNumbers.setUnavailable(solverInfo.availableNumbersMap)(
    n,
    Sudoku.cellGroup(solverInfo.board)(cellPos),
  ),
  board: Sudoku.addNumber(solverInfo.board)(n, cellPos),
})

export const fillBoard = (config: FillBoardConfig) => {
  const board = Sudoku.createBoard(config)
  const nc = Sudoku.numberCount(config)
  for (let row = 0; row < nc; row++) {
    for (let col = 0; col < nc; col++) {
      board.cells[row][col] = config.randomCellGenerator(nc)
    }
  }
  return board
}
