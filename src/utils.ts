import * as R from "ramda"

export type RandomGenerator = () => number

export const shuffle = (random: RandomGenerator) => <T>(values: T[]) => {
  const newValues = values.slice()
  for (let i = newValues.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = newValues[i]
    newValues[i] = newValues[j]
    newValues[j] = tmp
  }

  return newValues
}

const pow2Map = R.range(0, 32).map(n => Math.pow(2, n))

export const pow2 = (n: number) => n <= 32 ? pow2Map[n] : Math.pow(2, n)
