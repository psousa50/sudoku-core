import { Sudoku, SudokuModels, types, utils } from "../internal"
import * as AvailableNumbers from "./availableNumbers"
import * as Constraints from "./constraints"
import { Config, CreateBoardConfig, SolverConfig, SolverNode, SolverState } from "./models"

const defaultConfig: Config = {
  constraints: Constraints.classicalConstraints,
  notifications: () => undefined,
  randomGenerator: Math.random,
  useRandomCells: true,
}

const defaultCreateBoardConfig: CreateBoardConfig = {
  ...defaultConfig,
  boxHeight: 3,
  boxWidth: 3,
}

const defaultSolverConfig: SolverConfig = {
  ...defaultConfig,
  useRandomCells: false,
}

const createSolverNode = (
  cellPos: SudokuModels.CellPos,
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap,
  availableNumbers: number[],
): SolverNode => ({
  availableNumbers,
  availableNumbersMap,
  availableNumbersPointer: 0,
  cellPos,
})

export const createSolverState = (board: SudokuModels.Board, config: SolverConfig): SolverState => ({
  board,
  config,
  filledCount: 0,
  iterations: 0,
  nodes: [],
  result: "unknown",
  solutions: 0,
})

const buildAvailableNumbersMap = (board: SudokuModels.Board): AvailableNumbers.AvailableNumbersMap => {
  const nc = SudokuModels.numberCount(board)
  const allNumbersAvailable = utils.pow2(nc) - 1
  const availableNumbersMap = AvailableNumbers.createAvailableNumbersMap(board, allNumbersAvailable)

  return Sudoku.allCellsPos(board).reduce((acc, cellPos) => {
    const cell = Sudoku.cell(board)(cellPos)
    return cell === SudokuModels.emptyCell
      ? acc
      : AvailableNumbers.setUnavailable(acc)(cell, Constraints.build(board.constraints)(board)(cellPos))
  }, availableNumbersMap)
}

const buildNumberListFromBitMask = (bitMask: number) => {
  const buildList = (b: number, n: number, list: number[]): number[] =>
    b === 0 ? list : buildList(Math.floor(b / 2), n + 1, b % 2 === 0 ? list : [...list, n])

  return buildList(bitMask, 1, [])
}

export const addNumberToBoard = (solverState: SolverState) => (n: number, cellPos: SudokuModels.CellPos) => ({
  ...solverState,
  board: Sudoku.addNumber(solverState.board)(n, cellPos),
  filledCount: solverState.filledCount + 1,
})

export const removeNumberFromBoard = (solverState: SolverState) => (cellPos: SudokuModels.CellPos) => ({
  ...solverState,
  board: Sudoku.clearCell(solverState.board)(cellPos),
  filledCount: solverState.filledCount - 1,
})

export const setUnavailable = (availableNumbersMap: AvailableNumbers.AvailableNumbersMap) => (
  board: SudokuModels.Board,
  n: number,
  cellPos: SudokuModels.CellPos,
) => AvailableNumbers.setUnavailable(availableNumbersMap)(n, Constraints.build(board.constraints)(board)(cellPos))

export const addNode = (
  solverState: SolverState,
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap,
): SolverState => {
  const emptyCellPos = Sudoku.getFirstEmptyCellPos(solverState.board)

  if (emptyCellPos) {
    const availableNumbersMask = availableNumbersMap[emptyCellPos.row][emptyCellPos.col]
    const numbersList = buildNumberListFromBitMask(availableNumbersMask)
    const availableNumbers = solverState.config.useRandomCells
      ? utils.shuffleWith(solverState.config.randomGenerator)(numbersList)
      : numbersList
    return {
      ...solverState,
      nodes: [...solverState.nodes, createSolverNode(emptyCellPos, availableNumbersMap, availableNumbers)],
    }
  } else {
    return {
      ...solverState,
      result: "valid",
      solutions: solverState.solutions + 1,
    }
  }
}

const removeNode = (solverState: SolverState) => ({
  ...solverState,
  nodes: solverState.nodes.slice(0, solverState.nodes.length - 1),
})

const incAvailablleNumbersPointer = (node: SolverNode) => ({
  ...node,
  availableNumbersPointer: node.availableNumbersPointer + 1,
})

const incPointerOnLastNode = (solverState: SolverState) => ({
  ...solverState,
  nodes: [
    ...solverState.nodes.slice(0, solverState.nodes.length - 1),
    incAvailablleNumbersPointer(solverState.nodes[solverState.nodes.length - 1]),
  ],
})

export const nextStep = (solverState: SolverState): SolverState => {
  const nextSolverState = {
    ...solverState,
    iterations: solverState.iterations + 1,
  }

  if (nextSolverState.nodes.length === 0) {
    return {
      ...solverState,
      result: "impossible",
    }
  }

  const lastNode = nextSolverState.nodes[nextSolverState.nodes.length - 1]
  const { availableNumbers, availableNumbersMap, availableNumbersPointer, cellPos } = lastNode

  if (availableNumbersPointer < availableNumbers.length) {
    const n = availableNumbers[availableNumbersPointer]
    return addNode(
      addNumberToBoard(incPointerOnLastNode(nextSolverState))(n, cellPos),
      setUnavailable(availableNumbersMap)(nextSolverState.board, n, cellPos),
    )
  } else {
    return removeNode(removeNumberFromBoard(nextSolverState)(cellPos))
  }
}

const fillboard = (solverState: SolverState): SolverState => {
  let s = solverState
  while (s.result === "unknown") {
    s = nextStep(s)
  }

  return s
}

export const createBoard = (config: types.DeepPartial<CreateBoardConfig> = {}) => fillboard(startCreateBoard(config))

export const startCreateBoard = (config: types.DeepPartial<CreateBoardConfig> = {}) => {
  const c = { ...defaultCreateBoardConfig, ...config }
  const board = Sudoku.createBoard(c)
  const solverState = createSolverState(board, c)

  return addNode(solverState, buildAvailableNumbersMap(board))
}

export const solveBoard = (board: SudokuModels.Board, config: types.DeepPartial<SolverConfig> = {}) =>
  fillboard(startSolveBoard(board, config))

export const startSolveBoard = (board: SudokuModels.Board, config: types.DeepPartial<SolverConfig> = {}) => {
  const c = { ...defaultSolverConfig, ...config }
  const solverState = createSolverState(board, c)

  return addNode(solverState, buildAvailableNumbersMap(board))
}
