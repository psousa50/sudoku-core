import { flatten } from "ramda"

export type EmptyCell = undefined
export type FilledCell = number
export type Cell = FilledCell | EmptyCell
export type Rows = Cell[]

export interface CellPos {
  row: number
  col: number
}

export const emptyCell: EmptyCell = undefined

export interface BoardConfig {
  boxWidth: number
  boxHeight: number
}

export interface Board extends BoardConfig {
  cells: Rows[]
}

export const numberCount = (config: BoardConfig) => config.boxWidth * config.boxHeight

export const createBoard = (config: BoardConfig): Board => {
  const nc = numberCount(config)

  return {
    boxHeight: config.boxHeight,
    boxWidth: config.boxWidth,
    cells: new Array(nc).fill(undefined).map(() => new Array(nc)),
  }
}

export const addNumber = (board: Board) => (n: number, cellPos: CellPos) => {
  const newCells = board.cells.slice()
  newCells[cellPos.row][cellPos.col] = n
  return {
    ...board,
    cells: newCells,
  }
}

export const cellGroup = (board: Board) => (cellPos: CellPos) => {
  const nc = numberCount(board)
  const boxRow = Math.floor(cellPos.row / board.boxHeight) * board.boxHeight
  const boxCol = Math.floor(cellPos.col / board.boxWidth) * board.boxWidth

  const box = flatten(
    new Array(board.boxHeight)
      .fill(undefined)
      .map((_, r) =>
        new Array(board.boxWidth).fill(undefined).map((__, c) => ({ row: boxRow + r, col: boxCol + c })),
      ),
  )

  const cells = [
    ...new Array(nc).fill(undefined).map((_, i) => ({row: cellPos.row, col: i})),
    ...new Array(nc).fill(undefined).map((_, i) => ({row: i, col: cellPos.col})),
    ...box,
  ]

  return cells.filter((c, i) => cells.findIndex(c1 => c1.row === c.row && c1.col === c.col) === i)

}
