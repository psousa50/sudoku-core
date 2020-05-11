import { helpers, Solver, SolverModels, Sudoku } from "../../src/internal"

describe("Creates a board", () => {
  it("2 x 2", () => {
    const result = Solver.createBoard({ boxWidth: 2, boxHeight: 2, randomGenerator: () => 0.9 })

    // prettier-ignore
    const expected = [
      "1234",
      "3412",
      "2143",
      "4321"]

    expect(result.board.cells).toEqual(helpers.buildBoardCells(expected))
  })
})

describe("Solves a board", () => {
  it("of 3 x 2", () => {
    // prettier-ignore
    const cells = [
      "4....1",
      "..23..",
      ".5..3.",
      ".6..4.",
      "..54..",
      "1....5",
    ]
    const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 2 }, helpers.buildBoardCells(cells))

    const result = Solver.solveBoard(board)

    const expectedCells = [
    // prettier-ignore
    "436251",
      "512364",
      "254136",
      "361542",
      "625413",
      "143625",
    ]

    expect(result.board.cells).toEqual(helpers.buildBoardCells(expectedCells))
  })

  it("that's already done", () => {
    const board = Solver.createBoard({ boxWidth: 2, boxHeight: 2 }).board

    const result = Solver.solveBoard(board)

    expect(result.nodes.length).toBe(0)
  })

  it("starting by the cell with less available numbers ", () => {
    // prettier-ignore
    const cells = [
      ".8..47...",
      "36.......",
      "..7615..2",
      "7.1......",
      ".3.......",
      "24.......",
      ".........",
      ".........",
      ".........",
  ]

    const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 }, helpers.buildBoardCells(cells))

    const r1 = Solver.startSolveBoard(board)
    const result = Solver.nextStep(r1)

    expect(Sudoku.cell(result.board)({ row: 2, col: 1 })).toBe(9)
  })

  it("of 3 x 3 in less then 300ms", () => {
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
    ]
    const board = Sudoku.createBoard({ boxWidth: 3, boxHeight: 3 }, helpers.buildBoardCells(cells))

    const t1 = Date.now()
    const result = Solver.solveBoard(board)
    const t2 = Date.now()

    // prettier-ignore
    const expectedCells = [
      "678315924",
      "534829716",
      "291647538",
      "986153472",
      "145762389",
      "327498651",
      "462531897",
      "859274163",
      "713986245",
    ]

    expect(result.board.cells).toEqual(helpers.buildBoardCells(expectedCells))
    expect(t2 - t1).toBeLessThan(300)
  })
})

// describe("findMinimalSolution", () => {
//   it("finds a valid Sudoku puzzle", () => {

//     const board = Sudoku.createBoard({ boxWidth: 2, boxHeight: 2 })

//     const result = Solver.createPuzzle(board)

//     expect(result.solutions).toEqual(2)
//     expect(result.outcome).toEqual(SolverModels.Outcomes.invalid)
//   })
// })
