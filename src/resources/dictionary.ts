import ieltsResources from './ielts.json'
import type { Dictionary, DictionaryResource } from '@/typings/index'
import { calcChapterCount } from '@/utils'

// The same allowlist also controls which dictionaries are included in the deployment.
export const dictionaryResources = ieltsResources as DictionaryResource[]

export const dictionaries: Dictionary[] = dictionaryResources.map((resource) => ({
  ...resource,
  chapterCount: calcChapterCount(resource.length),
}))

export const idDictionaryMap: Record<string, Dictionary> = Object.fromEntries(dictionaries.map((dict) => [dict.id, dict]))
