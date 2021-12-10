import _ from 'lodash'

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
  ).map((x) =>
    x.replaceAll('..', '.').replaceAll(':.', ':').replaceAll('!.', '!').replaceAll('?.', '?').replaceAll(';.', ';')
  )

  // TODO: if startsWith lowercase - union with previos item

  return res
}

export function getSplittedTexts(text: string, limitLength: number): string[] {
  const microSplits = getMicroSplits(text, limitLength, '. ')
  const macroSplits: string[] = []

  let currentSplitIndex = 0

  while (currentSplitIndex < microSplits.length) {
    let nextSplitIndex = currentSplitIndex + 1

    while (
      microSplits.slice(currentSplitIndex, nextSplitIndex).join(' ').length < limitLength &&
      nextSplitIndex < microSplits.length
    ) {
      nextSplitIndex++
    }

    const noLimit =
      microSplits.slice(currentSplitIndex, currentSplitIndex + nextSplitIndex).join(' ').length < limitLength ||
      nextSplitIndex - currentSplitIndex <= 1

    if (!noLimit) {
      nextSplitIndex--
    }

    macroSplits.push(microSplits.slice(currentSplitIndex, nextSplitIndex).join(''))
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
