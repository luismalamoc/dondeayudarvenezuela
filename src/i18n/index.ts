import type { Lang } from '../types'
import type { Dictionary } from './types'
import { en } from './en'
import { es } from './es'

export const dictionaries: Record<Lang, Dictionary> = { es, en }

export type { Dictionary }
