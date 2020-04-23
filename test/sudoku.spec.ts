import { addNumber, cellGroup, createBoard } from "../src/Sudoku"
import { buildBoard } from "./helpers"

it("Creates a new Board", () => {
  const result = createBoard({ boxWidth: 2, boxHeight: 1 })

  const expected = ["..", ".."]
  expect(result.cells).toEqual(buildBoard(expected))
})

it("adds a number to a board", () => {
  const board = createBoard({ boxWidth: 2, boxHeight: 2 })

  const result = addNumber(board)(5, { row: 1, col: 3 })

  // prettier-ignore
  const expectedBoard = [
    "....",
    "...5",
    "....",
    "....",
  ]

  expect(result.cells).toEqual(buildBoard(expectedBoard))
})

it("returns cell Sudoku groups", () => {
  const board = createBoard({ boxWidth: 3, boxHeight: 3 })
  const result = cellGroup(board)({ row: 1, col: 3 })

  const expectedCells = [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [1, 6],
    [1, 7],
    [1, 8],

    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 3],
    [6, 3],
    [7, 3],
    [8, 3],

    [0, 4],
    [0, 5],

    [2, 4],
    [2, 5],
  ]

  expect(result).toEqual(expect.arrayContaining(expectedCells.map((c) => ({ row: c[0], col: c[1] }))))
})
