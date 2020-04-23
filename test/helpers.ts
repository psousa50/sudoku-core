import { emptyCell } from "../src/Sudoku"

const toCell = (c: string) => (c === "." ? emptyCell : Number.parseInt(c, 10))

export const buildBoard = (rows: string[]) => rows.map((r) => r.split("").map(toCell))
