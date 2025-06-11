export function tryParseNumber(value?: string | null): number | null {
  if (!value) {
    return null
  }

  const parseValue = Number(value)

  if (isNaN(parseValue)) {
    return null
  }

  return parseValue
}

export function tryParseInt(value?: string | null): number | null {
  if (!value) {
    return null
  }

  const parseValue = parseInt(value, 10)

  if (isNaN(parseValue)) {
    return null
  }

  return parseValue
}

export function tryParseEnvironment(
  value?: string | null,
): 'development' | 'production' {
  if (value === 'production') {
    return 'production'
  }

  return 'development'
}

export function tryParseBoolean(value?: string | null): boolean {
  if (!value) {
    return false
  }

  if (/^true$/i.test(value)) {
    return true
  }

  return false
}
