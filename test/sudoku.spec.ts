import { fillBoard } from "../src/solver"
import { createBoard, emptyCell } from "../src/sudoku"

const toCell = (c: string) => (c === "." ? emptyCell : Number.parseInt(c))

const buildBoard = (rows: string[]) => rows.map((r) => r.split("").map(toCell))

const randomBuilder = (values: number[]) => {
  let p = 0

  return () => {
    const v = values[p]
    p = (p + 1) % values.length
    return v
  }
}

describe("Creates a new Board", () => {
  it("4x4", () => {
    const result = createBoard({ subGridWidth: 2, subGridHeight: 1 })

    const expected = [
      "..",
      "..",
    ]
    expect(result.cells).toEqual(buildBoard(expected))
  })
})

describe("Fills a board", () => {
  it("", () => {

    const result = fillBoard({ subGridWidth: 2, subGridHeight: 2, randomCellGenerator: randomBuilder([1, 2, 3, 4]) })

    const expected = [
      "1234",
      "3412",
      "4123",
      "2341",
    ]
    expect(result.cells).toEqual(buildBoard(expected))
  })
})
