import _ from 'lodash'

export function splitNormalize(text: string) {
  text = text || ''
  const fixEls = ['  ', '..', '. .', '. ...']

  while (fixEls.some((fe) => text.includes(fe))) {
    text = text.replaceAll('  ', ' ').replaceAll('..', '.').replaceAll('. ...', '. ').replaceAll('. .', '. ')
  }

  return text.replaceAll(':.', ':').replaceAll('!.', '!').replaceAll('?.', '?').replaceAll(';.', ';')
}

export function getMicroSplits(text: string, limitLength: number, separator: string | null) {
  if (!separator) {
    return [text]
  }

  const res: string[] = _.flatten(
    text.split(separator).map((t: string) => {
      if (t.length >= limitLength) {
        return getMicroSplits(t, limitLength, getNextSeparator(separator))
      }

      return t + separator
    })
  ).map((x) => splitNormalize(x))

  // TODO: if startsWith lowercase - union with previos item

  return res
}

export function getSplittedTexts(text: string, limitLength: number): string[] {
  const microSplits = getMicroSplits(text, limitLength, '. ')
  return groupByLimit(microSplits, limitLength)
}

export function groupByLimit(splits: string[], limitLength: number) {
  const macroSplits: string[] = []

  let currentSplitIndex = 0

  while (currentSplitIndex < splits.length) {
    let nextSplitIndex = currentSplitIndex + 1

    while (
      splits.slice(currentSplitIndex, nextSplitIndex).join(' ').length < limitLength &&
      nextSplitIndex < splits.length
    ) {
      nextSplitIndex++
    }

    const noLimit =
      splits.slice(currentSplitIndex, currentSplitIndex + nextSplitIndex).join(' ').length < limitLength ||
      nextSplitIndex - currentSplitIndex <= 1

    if (!noLimit) {
      nextSplitIndex--
    }

    macroSplits.push(splits.slice(currentSplitIndex, nextSplitIndex).join(''))
    currentSplitIndex = nextSplitIndex
  }

  return macroSplits
}

export function getNextSeparator(separator: string) {
  switch (separator) {
    case '.':
    case '. ':
      return '!'

    case '!':
      return '?'

    case '?':
      return ';'

    case ';':
      return '˿'
  }

  return null
}
