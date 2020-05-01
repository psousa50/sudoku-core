import { helpers, Sudoku } from "../../src/internal"

it("Creates a new Board", () => {
  const result = Sudoku.createBoard({ boxWidth: 2, boxHeight: 1 })

  // prettier-ignore
  const expected = [
      "..",
      "..",
  ]

  expect(result.cells).toEqual(helpers.buildBoardCells(expected))
})

describe("addNumber", () => {
  it("adds a number to a board", () => {
    const board = Sudoku.createBoard({ boxWidth: 2, boxHeight: 2 })

    const result = Sudoku.addNumber(board)(5, { row: 1, col: 3 })

    // prettier-ignore
    const expectedBoard = [
      "....",
      "...5",
      "....",
      "....",
    ]

    expect(result.cells).toEqual(helpers.buildBoardCells(expectedBoard))
  })

  it("is immutable", () => {
    const board = Sudoku.createBoard({ boxWidth: 2, boxHeight: 2 })

    Sudoku.addNumber(board)(5, { row: 1, col: 3 })

    // prettier-ignore
    const expectedBoard = [
    "....",
    "....",
    "....",
    "....",
  ]

    expect(board.cells).toEqual(helpers.buildBoardCells(expectedBoard))
  })
})

it("getEmptyCellPos", () => {
  const initialBoard = Sudoku.createBoard({ boxWidth: 2, boxHeight: 2 })
  const cells = [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 0],
    [1, 1],
  ].map((c) => ({ row: c[0], col: c[1] }))

  const board = cells.reduce((b, cell, i) => Sudoku.addNumber(b)(i, cell), initialBoard)

  expect(Sudoku.getFirstEmptyCellPos(board)).toEqual({ row: 1, col: 2 })
})

it("returns cell Sudoku groups", () => {
  const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 })
  const result = Sudoku.constrainedCells(board)({ row: 1, col: 3 })

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
