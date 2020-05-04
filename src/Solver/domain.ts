import * as R from "ramda"
import { Constraints, SolverModels, Sudoku, SudokuModels, types, utils } from "../internal"
import * as AvailableNumbers from "./availableNumbers"
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
  outcome: SolverModels.Outcomes.unknown,
  solutions: 0,
})

const setOutcome = (solverState: SolverState) => (outcome: SolverModels.Outcomes) => ({
  ...solverState,
  outcome,
})

const incrementIterations = (solverState: SolverState) => ({
  ...solverState,
  iterations: solverState.iterations + 1,
})

const incrementSolutions = (solverState: SolverState) => ({
  ...solverState,
  solutions: solverState.solutions + 1,
})

const buildAvailableNumbersMap = (board: SudokuModels.Board, config: Config): AvailableNumbers.AvailableNumbersMap => {
  const nc = SudokuModels.numberCount(board)
  const allNumbersAvailable = utils.pow2(nc) - 1
  const availableNumbersMap = AvailableNumbers.createAvailableNumbersMap(board, allNumbersAvailable)

  return Sudoku.allCellsPos(board).reduce((acc, cellPos) => {
    const cell = Sudoku.cell(board)(cellPos)
    return cell === SudokuModels.emptyCell
      ? acc
      : AvailableNumbers.setUnavailable(acc)(cell, Constraints.build(config.constraints)(board)(cellPos))
  }, availableNumbersMap)
}

export const buildNumberListFromBitMask = (bitMask: number) => {
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

export const setUnavailable = (availableNumbersMap: AvailableNumbers.AvailableNumbersMap, config: Config) => (
  board: SudokuModels.Board,
  n: number,
  cellPos: SudokuModels.CellPos,
) => AvailableNumbers.setUnavailable(availableNumbersMap)(n, Constraints.build(config.constraints)(board)(cellPos))

const getEmptyCellPos = (solverState: SolverState, availableNumbersMap: AvailableNumbers.AvailableNumbersMap) => {
  const emptyCells = R.sort(
    (nl1, nl2) => nl1.availableNumbers.length - nl2.availableNumbers.length,
    Sudoku.allCellsPos(solverState.board)
      .filter(Sudoku.cellIsEmpty(solverState.board))
      .map(cell => ({ cell, availableNumbers: buildNumberListFromBitMask(availableNumbersMap[cell.row][cell.col]) })),
  )

  return emptyCells.length > 0 ? emptyCells[0].cell : undefined
}

export const addNode = (
  solverState: SolverState,
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap,
): SolverState => {
  // const emptyCellPos = Sudoku.getFirstEmptyCellPos(solverState.board)
  const emptyCellPos = getEmptyCellPos(solverState, availableNumbersMap)

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
    return incrementSolutions(setOutcome(solverState)(SolverModels.Outcomes.valid))
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

export const processLastNode = (solverState: SolverState): SolverState => {
  const lastNode = solverState.nodes[solverState.nodes.length - 1]
  const { availableNumbers, availableNumbersMap, availableNumbersPointer, cellPos } = lastNode

  if (availableNumbersPointer < availableNumbers.length) {
    const n = availableNumbers[availableNumbersPointer]
    return addNode(
      addNumberToBoard(incPointerOnLastNode(solverState))(n, cellPos),
      setUnavailable(availableNumbersMap, solverState.config)(solverState.board, n, cellPos),
    )
  } else {
    return removeNode(removeNumberFromBoard(solverState)(cellPos))
  }
}

export const nextStep = (solverState: SolverState): SolverState =>
  solverState.nodes.length === 0
    ? setOutcome(solverState)(SolverModels.Outcomes.impossible)
    : processLastNode(incrementIterations(solverState))

const decreasePointer = (solverState: SolverState): SolverState => {
  const lastNode = solverState.nodes[solverState.nodes.length - 1]
  const lastNodeDecreased = {
    ...lastNode,
    availableNumbersPointer: lastNode.availableNumbersPointer - 1,
  }
  return {
    ...solverState,
    nodes: [...solverState.nodes.slice(0, solverState.nodes.length - 1), lastNodeDecreased],
  }
}

export const undoStep = (solverState: SolverState): SolverState => {
  return solverState.nodes.length > 1
    ? decreasePointer(
        removeNode(removeNumberFromBoard(solverState)(solverState.nodes[solverState.nodes.length - 2].cellPos)),
      )
    : solverState
}

const fillboard = (solverState: SolverState): SolverState => {
  let s = solverState
  while (s.outcome === SolverModels.Outcomes.unknown) {
    s = nextStep(s)
  }

  return s
}

export const createBoard = (config: types.DeepPartial<CreateBoardConfig> = {}) => fillboard(startCreateBoard(config))

export const startCreateBoard = (config: types.DeepPartial<CreateBoardConfig> = {}) => {
  const c = { ...defaultCreateBoardConfig, ...config }
  const board = Sudoku.createBoard(c)
  const solverState = createSolverState(board, c)

  return addNode(solverState, buildAvailableNumbersMap(board, c))
}

export const solveBoard = (board: SudokuModels.Board, config: types.DeepPartial<SolverConfig> = {}) =>
  fillboard(startSolveBoard(board, config))

export const startSolveBoard = (board: SudokuModels.Board, config: types.DeepPartial<SolverConfig> = {}) => {
  const c = { ...defaultSolverConfig, ...board, ...config }
  const solverState = createSolverState(board, c)

  return addNode(solverState, buildAvailableNumbersMap(board, c))
}
