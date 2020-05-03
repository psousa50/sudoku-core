import { SudokuModels } from "./internal"

const toCell = (c: string) =>
  c === "."
    ? SudokuModels.emptyCell
    : "ABCDEFG".indexOf(c) >= 0
    ? 10 + c.charCodeAt(0) - "A".charCodeAt(0)
    : Number.parseInt(c, 10)

export const buildBoardCells = (rows: string[]) => rows.map(r => r.split("").map(toCell))

const toString = (c: SudokuModels.Cell) => (c === SudokuModels.emptyCell ? "." : c.toString())

export const cellsToString = (rows: SudokuModels.Rows[]) => rows.map(r => r.map(toString).join(""))

export const boardToString = (board: SudokuModels.Board) => cellsToString(board.cells).join("\n")
