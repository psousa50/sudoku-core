import * as R from "ramda"
import { Constraints, SolverModels, Sudoku, SudokuModels, types, utils } from "../internal"
import { CellPos } from "../Sudoku/models"
import * as AvailableNumbers from "./availableNumbers"
import { Config, CreateBoardConfig, SolverConfig, SolverNode, SolverState } from "./models"

type SolverAction = (solverState: SolverState) => SolverState

export const act = (...actions: SolverAction[]): SolverAction => solverState =>
  actions.reduce((acc, action) => action(acc), solverState)

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

const setOutcome = (outcome: SolverModels.Outcomes): SolverAction => solverState => ({
  ...solverState,
  outcome,
})

const incrementIterations: SolverAction = solverState => ({
  ...solverState,
  iterations: solverState.iterations + 1,
})

const incrementSolutions: SolverAction = solverState => ({
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

export const addNumberToBoard = (n: number, cellPos: SudokuModels.CellPos): SolverAction => solverState => ({
  ...solverState,
  board: Sudoku.addNumber(solverState.board)(n, cellPos),
  filledCount: solverState.filledCount + 1,
})

export const addNodeToState = (node: SolverModels.SolverNode): SolverAction => solverState => ({
  ...solverState,
  nodes: [...solverState.nodes, node],
})

export const removeNumberFromBoard = (cellPos: SudokuModels.CellPos): SolverAction => solverState => ({
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

const byChanges = (cellsPos: CellPos[], availableNumbersMap: AvailableNumbers.AvailableNumbersMap) => (
  n1: number,
  n2: number,
) => {
  const countAvailableNumbersChanges = (n: number) => {
    const np2 = utils.pow2(n)
    // tslint:disable-next-line: no-bitwise
    return cellsPos.map(c => availableNumbersMap[c.row][c.col]).filter(a => (a & np2) === np2).length
  }

  return countAvailableNumbersChanges(n2) - countAvailableNumbersChanges(n1)
}

const getCellAvailableNumbers = (
  cellPos: CellPos,
  availableNumbersMap: AvailableNumbers.AvailableNumbersMap,
  solverState: SolverState,
) => {
  const availableNumbersMask = availableNumbersMap[cellPos.row][cellPos.col]
  const numbersList = R.sort(
    byChanges(Constraints.build(solverState.config.constraints)(solverState.board)(cellPos), availableNumbersMap),
    buildNumberListFromBitMask(availableNumbersMask),
  )
  const availableNumbers = solverState.config.useRandomCells
    ? utils.shuffleWith(solverState.config.randomGenerator)(numbersList)
    : numbersList

  return availableNumbers
}

export const addNode = (availableNumbersMap: AvailableNumbers.AvailableNumbersMap): SolverAction => solverState => {
  const emptyCellPos = getEmptyCellPos(solverState, availableNumbersMap)

  return emptyCellPos
    ? addNodeToState(
        createSolverNode(
          emptyCellPos,
          availableNumbersMap,
          getCellAvailableNumbers(emptyCellPos, availableNumbersMap, solverState),
        ),
      )(solverState)
    : act(setOutcome(SolverModels.Outcomes.valid), incrementSolutions)(solverState)
}

const removeNode: SolverAction = solverState => ({
  ...solverState,
  nodes: solverState.nodes.slice(0, solverState.nodes.length - 1),
})

const incAvailableNumbersPointer = (node: SolverNode) => ({
  ...node,
  availableNumbersPointer: node.availableNumbersPointer + 1,
})

const incPointerOnLastNode: SolverAction = solverState => ({
  ...solverState,
  nodes: [
    ...solverState.nodes.slice(0, solverState.nodes.length - 1),
    incAvailableNumbersPointer(solverState.nodes[solverState.nodes.length - 1]),
  ],
})

export const processLastNode: SolverAction = solverState => {
  const lastNode = solverState.nodes[solverState.nodes.length - 1]
  const { availableNumbers, availableNumbersMap, availableNumbersPointer, cellPos } = lastNode

  if (availableNumbersPointer < availableNumbers.length) {
    const n = availableNumbers[availableNumbersPointer]

    return act(
      addNumberToBoard(n, cellPos),
      incPointerOnLastNode,
      addNode(setUnavailable(availableNumbersMap, solverState.config)(solverState.board, n, cellPos)),
    )(solverState)
  } else {
    return act(removeNumberFromBoard(cellPos), removeNode)(solverState)
  }
}

export const nextStep: SolverAction = solverState =>
  solverState.nodes.length === 0
    ? setOutcome(SolverModels.Outcomes.impossible)(solverState)
    : processLastNode(incrementIterations(solverState))

const decreasePointer: SolverAction = solverState => {
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

export const undoStep: SolverAction = solverState => {
  return solverState.nodes.length > 1
    ? act(
        decreasePointer,
        removeNode,
        removeNumberFromBoard(solverState.nodes[solverState.nodes.length - 2].cellPos),
      )(solverState)
    : solverState
}

const fillboard: SolverAction = solverState => {
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

  return addNode(buildAvailableNumbersMap(board, c))(solverState)
}

export const solveBoard = (board: SudokuModels.Board, config: types.DeepPartial<SolverConfig> = {}) =>
  fillboard(startSolveBoard(board, config))

export const startSolveBoard = (board: SudokuModels.Board, config: types.DeepPartial<SolverConfig> = {}) => {
  const c = { ...defaultSolverConfig, ...board, ...config }
  const solverState = createSolverState(board, c)

  return addNode(buildAvailableNumbersMap(board, c))(solverState)
}
