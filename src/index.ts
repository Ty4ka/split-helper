import _ from 'lodash'

export function splitNormalize(text: string) {
  text = text || ''
  const fixEls = ['  ', '..', '. .', '. ...']

  while (fixEls.some((fe) => text.includes(fe))) {
    text = text
      .replaceAll('  ', ' ')
      .replaceAll('..', '.')
      .replaceAll('. ...', '. ')
      .replaceAll('. .', '. ')

      // additional
      .replaceAll(':.', ':')
      .replaceAll('!.', '!')
      .replaceAll('?.', '?')
      .replaceAll(';.', ';')
  }

  return pointSpaceNormalize(text)
}

export function pointSpaceNormalize(text: string) {
  let position = 0
  const point = '.'

  while (position > -1 && position < text.length) {
    const nextPosition = position + 1
    const nextChar = text[nextPosition]
    const isLetter = nextChar?.toUpperCase() !== nextChar?.toLowerCase()
    const isUpper = nextChar === nextChar?.toUpperCase()

    if (isLetter && isUpper) {
      text = text.substring(0, nextPosition) + ' ' + text.substring(nextPosition, text.length)
    }

    position = text.indexOf(point, nextPosition + 1)
  }

  return text
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

export function groupByLimit(splits: string[], limitLength: number, joiner = ' ') {
  const macroSplits: string[] = []
  let currentSplitIndex = 0

  while (currentSplitIndex < splits.length) {
    let nextSplitIndex = currentSplitIndex + 1

    while (
      splits.slice(currentSplitIndex, nextSplitIndex).join(joiner).length < limitLength &&
      nextSplitIndex < splits.length
    ) {
      nextSplitIndex++
    }

    const noLimit =
      splits.slice(currentSplitIndex, currentSplitIndex + nextSplitIndex).join(joiner).length < limitLength ||
      nextSplitIndex - currentSplitIndex <= 1

    if (!noLimit) {
      nextSplitIndex--
    }

    macroSplits.push(splits.slice(currentSplitIndex, nextSplitIndex).join(joiner))
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
