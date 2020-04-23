import { addNumber, createSolverInfo, fillBoard } from "../src/Solver"
import { buildBoard } from "./helpers"

const randomBuilder = (values: number[]) => {
  let p = 0

  return () => {
    const v = values[p]
    p = (p + 1) % values.length
    return v
  }
}

describe("Fills a board", () => {

  it("adds a number to a board", () => {
    const solverInfo = createSolverInfo({ boxWidth: 2, boxHeight: 2})

    const result = addNumber(solverInfo)(3, { row: 3, col: 2})

    const expectedBoard = [
      "....",
      "....",
      "....",
      "..3.",
    ]

    const expectedAvailableNumbersMap = [
      [15, 15, 11, 15],
      [15, 15, 11, 15],
      [15, 15, 11, 11],
      [11, 11, 11, 11],
    ]

    expect(result.board.cells).toEqual(buildBoard(expectedBoard))
    expect(result.availableNumbersMap).toEqual(expectedAvailableNumbersMap)
  })

  it.skip("2 x 2", () => {

    const result = fillBoard({ boxWidth: 2, boxHeight: 2, randomCellGenerator: randomBuilder([1, 2, 3, 4]) })

    const expected = [
      "1234",
      "3412",
      "4123",
      "2341",
    ]

    expect(result.cells).toEqual(buildBoard(expected))
  })
})
