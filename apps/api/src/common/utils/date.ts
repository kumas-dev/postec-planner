import { DateTime } from 'luxon'

export function localToUTC(date: Date) {
  return DateTime.fromJSDate(date).minus({ hours: 9 }).toJSDate()
}

export function utcToLocal(date: Date) {
  return DateTime.fromJSDate(date).plus({ hours: 9 }).toJSDate()
}
