import * as R from "ramda"

export type RandomGenerator = () => number

export const shuffleWith = (random: RandomGenerator) => <T>(values: T[]) => {
  const newValues = values.slice()
  for (let i = newValues.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = newValues[i]
    newValues[i] = newValues[j]
    newValues[j] = tmp
  }

  return newValues
}

export const shuffle = shuffleWith(Math.random)

const pow2Map = R.range(0, 32).map(n => Math.pow(2, n))

export const pow2 = (n: number) => (n <= 32 ? pow2Map[n] : Math.pow(2, n))

export const rnd0ToMaxExclusive = (max: number) => Math.floor(Math.random() * max)

export const set2dCell = <T>(array: T[][]) => (value: T, row: number, col: number) => {
  const newArray = R.clone(array)
  newArray[row][col] = value
  return newArray
}

export const update2dCell = <T>(array: T[][]) => (f: (value: T) => T, row: number, col: number) => {
  const newArray = R.clone(array)
  newArray[row][col] = f(array[row][col])
  return newArray
}

export const traverse2d = <T>(array: T[][]) => (f: (value: T, row: number, col: number) => void) => {
  for (let row = 0; row < array.length; row++) {
    for (let col = 0; col < array[0].length; col++) {
      f(array[row][col], row, col)
    }
  }
}

export const reduce2d = <A, T>(array: T[][]) => (f: (acc: A, value: T, row: number, col: number) => A, initial: A) => {
  let acc = initial
  for (let row = 0; row < array.length; row++) {
    for (let col = 0; col < array[0].length; col++) {
      acc = f(acc, array[row][col], row, col)
    }
  }
  return acc
}

export const lj = (m: string, d: any) => {
  console.log(m, ": ", JSON.stringify(d, null, 2))
  return d
}
