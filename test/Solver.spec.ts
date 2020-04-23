import { addNumber, createSolverInfo, fillBoard, solveBoard } from "../src/Solver"
import * as Sudoku from "../src/Sudoku"
import { boardToString, buildBoardCells, cellsToString } from "./helpers"

// const randomBuilder = (values: number[]) => {
//   let p = 0

//   return () => {
//     const v = values[p]
//     p = (p + 1) % values.length
//     return v
//   }
// }

describe("Fills a board", () => {
  it("adds a number to a board", () => {
    const solverInfo = createSolverInfo(Sudoku.createBoard({ boxWidth: 2, boxHeight: 2 }))

    const result = addNumber(solverInfo)(3, { row: 3, col: 2 })

    // prettier-ignore
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

    // expect(result.board.cells).toEqual(buildBoardCells(expectedBoard))
    expect(result.filledCount).toEqual(1)
    expect(result.availableNumbersMap).toEqual(expectedAvailableNumbersMap)
  })

  it("2 x 2", () => {
    const result = fillBoard({ boxWidth: 2, boxHeight: 2, randomGenerator: () => 0.9 })

    // prettier-ignore
    const expected = [
      "1234",
      "3412",
      "2143",
      "4321"]

    expect(result.cells).toEqual(buildBoardCells(expected))
  })
})

describe("Solves a board", () => {
  it("3 x 2", () => {
    // prettier-ignore
    const cells = [
      "4....1",
      "..23..",
      ".5..3.",
      ".6..4.",
      "..54..",
      "1....5",
    ]
    const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 2 }, buildBoardCells(cells))

    const result = solveBoard(board)

    const expectedCells = ["436251", "512364", "254136", "361542", "625413", "143625"]

    expect(result.cells).toEqual(buildBoardCells(expectedCells))
  })

  it("3 x 3", () => {
    // prettier-ignore
    const cells = [
      ".......2.",
      ".3...9..6",
      "..1.47...",
      "...1..47.",
      "..5...3..",
      ".27..8...",
      "...53.8..",
      "8..2...6.",
      ".1.......",
      "",
    ]
    const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 }, buildBoardCells(cells))

    const result = solveBoard(board)

    console.log(boardToString(result))
    // expect(result.cells).toEqual(buildBoardCells(expectedCells))
  })
})
