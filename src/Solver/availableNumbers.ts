import * as R from "ramda"
import { SudokuModels, utils } from "../internal"

type AvailableNumbersMask = number
export type AvailableNumbersMap = AvailableNumbersMask[][]

export const createAvailableNumbersMap = (config: SudokuModels.BoardConfig, initialValue = 0): AvailableNumbersMap => {
  const nc = SudokuModels.numberCount(config)
  return new Array(nc).fill(undefined).map(() => new Array(nc).fill(initialValue))
}

const setUnavailableMutate = (availableNumbersMap: AvailableNumbersMap) => (
  n: number,
  cellPos: SudokuModels.CellPos,
) => {
  // tslint:disable: no-bitwise
  const nc = availableNumbersMap.length
  const actual = availableNumbersMap[cellPos.row][cellPos.col]
  const newValue = (utils.pow2(nc) - 1) ^ utils.pow2(n - 1)
  availableNumbersMap[cellPos.row][cellPos.col] = actual & newValue
  return availableNumbersMap
}

export const setUnavailable = (availableNumbersMap: AvailableNumbersMap) => (
  n: number,
  cellsPos: SudokuModels.CellPos[],
) => {
  const newMap = R.clone(availableNumbersMap)
  return cellsPos.reduce((acc, cell) => setUnavailableMutate(acc)(n, cell), newMap)
}
