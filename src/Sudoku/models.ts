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

export const cellPosIsEqual = (cellPos1: CellPos) =>  (cellPos2: CellPos) =>
  cellPos1.row === cellPos2.row && cellPos1.col === cellPos2.col
