import * as Sudoku from "../src/Sudoku2"

const toCell = (c: string) => (c === "." ? Sudoku.emptyCell : Number.parseInt(c, 10))

export const buildBoardCells = (rows: string[]) => rows.map((r) => r.split("").map(toCell))

const toString = (c: Sudoku.Cell) => (c ? c.toString() : ".")

export const cellsToString = (rows: Sudoku.Rows[]) => rows.map((r) => r.map(toString).join(""))

export const boardToString = (board: Sudoku.Board) => cellsToString(board.cells).join("\n")
