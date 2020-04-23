import * as Sudoku from "./Sudoku"

export type AvailableNumbersMap = number[][]

export const createAvailableNumbersMap = (config: Sudoku.BoardConfig, initialValue = 0): AvailableNumbersMap => {
  const nc = Sudoku.numberCount(config)
  return new Array(nc).fill(undefined).map(() => new Array(nc).fill(initialValue))
}

const setUnavailableMutate = (availableNumbersMap: AvailableNumbersMap) => (n: number, cellPos: Sudoku.CellPos) => {
  // tslint:disable: no-bitwise
  const nc = availableNumbersMap.length
  const actual = availableNumbersMap[cellPos.row][cellPos.col]
  const newValue = (Math.pow(2, nc) - 1) ^ Math.pow(2, n - 1)
  availableNumbersMap[cellPos.row][cellPos.col] = actual & newValue
  return availableNumbersMap
}

export const setUnavailable = (availableNumbersMap: AvailableNumbersMap) => (n: number, cellsPos: Sudoku.CellPos[]) => {
  const newMap = availableNumbersMap.slice()
  return cellsPos.reduce((acc, cell) => setUnavailableMutate(acc)(n, cell), newMap)
}
