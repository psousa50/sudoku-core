
export type EmptyCell = undefined
export type FilledCell = number
export type Cell = FilledCell | EmptyCell
export type Rows = Cell[]

export const emptyCell: EmptyCell = undefined

export interface Board {
  cells: Rows[]
  subGridWidth: number
  subGridHeight: number
}

export interface BoardConfig {
  subGridWidth: number
  subGridHeight: number
}

export const createBoard = (config: BoardConfig) => {
  const numbersCount = config.subGridWidth * config.subGridHeight

  return {
    cells: new Array(numbersCount).fill(new Array(numbersCount)),
    ...config,
  }
}


