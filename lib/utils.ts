import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (str: string, limit: number = 2) => {
  if (!str) return ''

  return str.split(/\s/).reduce((response, word, index) => {
    if (index < limit) response += word.slice(0, 1)
    return response
  }, '')
}

export function titleCase(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}
