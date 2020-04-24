import * as R from "ramda"

export type EmptyCell = "."
export type FilledCell = number
export type Cell = FilledCell | EmptyCell
export type Rows = Cell[]

export interface CellPos {
  row: number
  col: number
}

export const emptyCell: EmptyCell = "."

export interface BoardConfig {
  boxWidth: number
  boxHeight: number
}

export interface Board extends BoardConfig {
  cells: Rows[]
}

export const numberCount = (config: BoardConfig) => config.boxWidth * config.boxHeight

export const createBoard = (config: BoardConfig, cells?: Rows[]): Board => {
  const nc = numberCount(config)

  return {
    boxHeight: config.boxHeight,
    boxWidth: config.boxWidth,
    cells: cells || new Array(nc).fill(undefined).map(() => new Array(nc).fill(emptyCell)),
  }
}

export const cell = (board: Board) => (cellPos: CellPos): Cell => board.cells[cellPos.row][cellPos.col]

export const cellIsEmpty = (board: Board) => (cellPos: CellPos) => cell(board)(cellPos) === emptyCell

export const addNumber = (board: Board) => (n: number, cellPos: CellPos) => {
  const newCells = R.clone(board.cells)
  newCells[cellPos.row][cellPos.col] = n
  return {
    ...board,
    cells: newCells,
  }
}

export const clearCell = (board: Board) => (cellPos: CellPos) => {
  const newCells = R.clone(board.cells)
  newCells[cellPos.row][cellPos.col] = emptyCell
  return {
    ...board,
    cells: newCells,
  }
}

export const cellGroup = (board: Board) => (cellPos: CellPos) => {
  const nc = numberCount(board)
  const boxRow = Math.floor(cellPos.row / board.boxHeight) * board.boxHeight
  const boxCol = Math.floor(cellPos.col / board.boxWidth) * board.boxWidth

  const box = R.flatten(
    new Array(board.boxHeight)
      .fill(undefined)
      .map((_, r) => new Array(board.boxWidth).fill(undefined).map((__, c) => ({ row: boxRow + r, col: boxCol + c }))),
  )

  const cells = [
    ...new Array(nc).fill(undefined).map((_, i) => ({ row: cellPos.row, col: i })),
    ...new Array(nc).fill(undefined).map((_, i) => ({ row: i, col: cellPos.col })),
    ...box,
  ]

  return cells.filter((c, i) => cells.findIndex((c1) => c1.row === c.row && c1.col === c.col) === i)
}

export function* boardIterator(board: Board) {
  const nc = numberCount(board)
  for (let row = 0; row < nc; row++) {
    for (let col = 0; col < nc; col++) {
      yield { row, col }
    }
  }
}

export function boardCellsPos(board: Board) {
  const nc = numberCount(board)
  let cellsPos = [] as CellPos[]
  for (let row = 0; row < nc; row++) {
    for (let col = 0; col < nc; col++) {
      cellsPos = [...cellsPos, { row, col }]
    }
  }

  return cellsPos
}

export const getEmptyCellPos = (board: Board): CellPos | undefined => {
  const iter = boardIterator(board)
  let result: CellPos | "not-found" | undefined
  do {
    const p = iter.next()
    result = p.done ? "not-found" : cellIsEmpty(board)(p.value) ? p.value : undefined
  } while (result === undefined)

  return result === "not-found" ? undefined : result
}
