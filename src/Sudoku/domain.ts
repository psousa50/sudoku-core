import * as R from "ramda"
import { types, utils } from "../internal"
import * as Constraints from "./constraints"
import { Board, BoardConfig, Cell, CellPos, emptyCell, numberCount, Rows } from "./models"

export const defaultBoardConfig = {
  boxHeight: 3,
  boxWidth: 3,
  constraints: Constraints.classicalConstraints,
}

export const createBoard = (config: types.DeepPartial<BoardConfig>, cells?: Rows[]): Board => {
  const c = { ...defaultBoardConfig, ...config }
  const nc = numberCount(c)

  return {
    boxHeight: c.boxHeight,
    boxWidth: c.boxWidth,
    cells: cells || new Array(nc).fill(undefined).map(() => new Array(nc).fill(emptyCell)),
    constraints: c.constraints || Constraints.classicalConstraints,
  }
}

export const cell = (board: Board) => (cellPos: CellPos): Cell => board.cells[cellPos.row][cellPos.col]

export const cellIsEmpty = (board: Board) => (cellPos: CellPos) => cell(board)(cellPos) === emptyCell

export const setCell = (board: Board) => (n: number, cellPos: CellPos) => ({
  ...board,
  cells: utils.set2dCell(board.cells)(n, cellPos.row, cellPos.col),
})

export const clearCell = (board: Board) => (cellPos: CellPos) => {
  const newCells = R.clone(board.cells)
  newCells[cellPos.row][cellPos.col] = emptyCell
  return {
    ...board,
    cells: newCells,
  }
}

export const constrainedCells = (board: Board) => (cellPos: CellPos) => {
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

  return cells.filter((c, i) => cells.findIndex(c1 => c1.row === c.row && c1.col === c.col) === i)
}

export const allCellsPos = (board: Board) => {
  const nc = numberCount(board)
  let cellsPos = [] as CellPos[]
  for (let row = 0; row < nc; row++) {
    for (let col = 0; col < nc; col++) {
      cellsPos = [...cellsPos, { row, col }]
    }
  }

  return cellsPos
}

export const getFirstEmptyCellPos = (board: Board): CellPos | undefined => allCellsPos(board).find(cellIsEmpty(board))
