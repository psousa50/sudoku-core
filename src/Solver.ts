import * as AvailableNumbers from "./AvailableNumbers"
import * as Constraints from "./Constraints"
import * as Sudoku from "./Sudoku"
import { DeepPartial } from "./types"
import { pow2, RandomGenerator, shuffleWith } from "./utils"

export type SolverNotifications = (solverState: SolverState) => void

export interface Config {
  constraints: Constraints.Constraints
  notifications: SolverNotifications
  randomGenerator: RandomGenerator
  useRandomCells: boolean
}

export interface CreateBoardConfig extends Sudoku.BoardConfig, Config {}

export type SolverConfig = Config

export interface SolverNode {
  availableNumbers: number[]
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap
  availableNumbersPointer: number
  cellPos: Sudoku.CellPos
}

export interface SolverState {
  board: Sudoku.Board
  config: SolverConfig
  filledCount: number
  iterations: number
  nodes: SolverNode[]
  solutions: number
  result: "valid" | "invalid" | "impossible" | "unknown"
}

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
  cellPos: Sudoku.CellPos,
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap,
  availableNumbers: number[],
): SolverNode => ({
  availableNumbers,
  availableNumbersMap,
  availableNumbersPointer: 0,
  cellPos,
})

export const createSolverState = (board: Sudoku.Board, config: SolverConfig): SolverState => ({
  board,
  config,
  filledCount: 0,
  iterations: 0,
  nodes: [],
  result: "unknown",
  solutions: 0,
})

const buildAvailableNumbersMap = (board: Sudoku.Board): AvailableNumbers.AvailableNumbersMap => {
  const nc = Sudoku.numberCount(board)
  const allNumbersAvailable = pow2(nc) - 1
  const availableNumbersMap = AvailableNumbers.createAvailableNumbersMap(board, allNumbersAvailable)

  return Sudoku.allCellsPos(board).reduce((acc, cellPos) => {
    const cell = Sudoku.cell(board)(cellPos)
    return cell === Sudoku.emptyCell
      ? acc
      : AvailableNumbers.setUnavailable(acc)(cell, Constraints.build(board.constraints)(board)(cellPos))
  }, availableNumbersMap)
}

const buildNumberListFromBitMask = (bitMask: number) => {
  const buildList = (b: number, n: number, list: number[]): number[] =>
    b === 0 ? list : buildList(Math.floor(b / 2), n + 1, b % 2 === 0 ? list : [...list, n])

  return buildList(bitMask, 1, [])
}

export const addNumberToBoard = (solverState: SolverState) => (n: number, cellPos: Sudoku.CellPos) => ({
  ...solverState,
  board: Sudoku.addNumber(solverState.board)(n, cellPos),
  filledCount: solverState.filledCount + 1,
})

export const removeNumberFromBoard = (solverState: SolverState) => (cellPos: Sudoku.CellPos) => ({
  ...solverState,
  board: Sudoku.clearCell(solverState.board)(cellPos),
  filledCount: solverState.filledCount - 1,
})

export const setUnavailable = (availableNumbersMap: AvailableNumbers.AvailableNumbersMap) => (
  board: Sudoku.Board,
  n: number,
  cellPos: Sudoku.CellPos,
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
      ? shuffleWith(solverState.config.randomGenerator)(numbersList)
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

export const createBoard = (config: DeepPartial<CreateBoardConfig> = {}) => fillboard(startCreateBoard(config))

export const startCreateBoard = (config: DeepPartial<CreateBoardConfig> = {}) => {
  const c = { ...defaultCreateBoardConfig, ...config }
  const board = Sudoku.createBoard(c)
  const solverState = createSolverState(board, c)

  return addNode(solverState, buildAvailableNumbersMap(board))
}

export const solveBoard = (board: Sudoku.Board, config: DeepPartial<SolverConfig> = {}) =>
  fillboard(startSolveBoard(board, config))

export const startSolveBoard = (board: Sudoku.Board, config: DeepPartial<SolverConfig> = {}) => {
  const c = { ...defaultSolverConfig, ...config }
  const solverState = createSolverState(board, c)

  return addNode(solverState, buildAvailableNumbersMap(board))
}
