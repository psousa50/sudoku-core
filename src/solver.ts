import { BoardConfig, createBoard } from "./sudoku"
import { Cell } from "./sudoku"

export type RandomCellGenerator = (max: number) => Cell
export const defaultRandomCell: RandomCellGenerator = max => Math.floor(Math.random() * max) + 1

export interface FillBoardConfig extends BoardConfig {
  randomCellGenerator: RandomCellGenerator
}

export const fillBoard = (config: FillBoardConfig) => {
  const board = createBoard(config)
  const numbersCount = config.subGridWidth * config.subGridHeight
  for (let row = 0; row < numbersCount; row++) {
    for (let col = 0; col < numbersCount; col++) {
      board.cells[row][col] = config.randomCellGenerator(numbersCount)
    }
  }
  return board
}
