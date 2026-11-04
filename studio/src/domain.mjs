/** Count words with apostrophes and hyphens as part of a word. */
export function countWords(text) {
  return (text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || []).length
}

export function checkWriting(text, mode, targets = []) {
  const patterns = [
    {
      regex: /\bshould\s+to\s+/gi,
      replacement: 'should ',
      title: '情态动词后用动词原形',
      explanation: 'should 后直接接动词原形，不需要 to。',
    },
    {
      regex: /\bcan\s+brings\b/gi,
      replacement: 'can bring',
      title: 'can 后的动词形式',
      explanation: 'can 后使用 bring，不加第三人称单数词尾。',
    },
    {
      regex: /\bcan\s+improves\b/gi,
      replacement: 'can improve',
      title: 'can 后的动词形式',
      explanation: '情态动词 can 后使用动词原形 improve。',
    },
    {
      regex: /\bcan\s+reduces\b/gi,
      replacement: 'can reduce',
      title: 'can 后的动词形式',
      explanation: '情态动词 can 后使用动词原形 reduce。',
    },
    {
      regex: /\bfor\s+alleviate\b/gi,
      replacement: 'to alleviate',
      title: '用不定式表达目的',
      explanation: '这里表示“为了缓解”，使用 to alleviate；for 后不能直接接动词原形。',
    },
    {
      regex: /\bmany\s+benefit\b/gi,
      replacement: 'many benefits',
      title: 'many 后使用复数名词',
      explanation: 'benefit 在这里是可数名词，应使用复数 benefits。',
    },
    {
      regex: /\binformations\b/gi,
      replacement: 'information',
      title: 'information 是不可数名词',
      explanation: '表达信息时通常使用 information，不加 s。',
    },
    {
      regex: /\bpeople\s+is\b/gi,
      replacement: 'people are',
      title: 'people 通常搭配复数谓语',
      explanation: 'people 表示“人们”时使用 are。',
    },
  ]
  let corrected = text
  const issues = []
  for (const rule of patterns) {
    const matches = [...corrected.matchAll(rule.regex)]
    if (matches.length) {
      issues.push({
        title: rule.title,
        explanation: rule.explanation,
        before: matches[0][0].trim(),
        after: rule.replacement.trim(),
      })
      corrected = corrected.replace(rule.regex, rule.replacement)
    }
  }
  const wordCount = countWords(text)
  const lower = text.toLowerCase()
  const used = targets.filter((word) =>
    new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:s|es)?\\b', 'i').test(lower),
  )
  return {
    wordCount,
    minimum: mode === 'task1' ? 150 : mode === 'task2' ? 250 : 0,
    issues,
    corrected,
    original: text,
    used,
    targets,
  }
}

export function validateBackup(input, knownIds) {
  if (!input || typeof input !== 'object' || input.version !== 1)
    throw new Error('不支持的数据格式，请选择 Wordloom 导出的 JSON 文件。')
  if (!input.seen || typeof input.seen !== 'object' || Array.isArray(input.seen))
    throw new Error('学习记录格式不完整。')
  for (const [id, value] of Object.entries(input.seen)) {
    if (
      !knownIds.includes(id) ||
      !value ||
      typeof value !== 'object' ||
      !Number.isFinite(value.firstSeen) ||
      !Number.isFinite(value.lastSeen) ||
      !Number.isFinite(value.count) ||
      value.count < 1
    )
      throw new Error('文件包含无效的单词学习记录。')
  }
  if (!Array.isArray(input.saved) || !input.saved.every((id) => knownIds.includes(id)))
    throw new Error('收藏记录格式不正确。')
  if (
    !Array.isArray(input.sessions) ||
    !input.sessions.every(
      (x) =>
        x &&
        typeof x.id === 'string' &&
        ['typing', 'review', 'writing'].includes(x.type) &&
        Number.isFinite(x.at) &&
        Number.isFinite(x.count),
    )
  )
    throw new Error('练习记录格式不正确。')
  if (
    !input.reviewed ||
    typeof input.reviewed !== 'object' ||
    Array.isArray(input.reviewed) ||
    !Object.entries(input.reviewed).every(
      ([id, value]) =>
        knownIds.includes(id) && value && Number.isFinite(value.at) && typeof value.correct === 'boolean',
    )
  )
    throw new Error('复习记录格式不正确。')
  if (
    !input.drafts ||
    typeof input.drafts !== 'object' ||
    Array.isArray(input.drafts) ||
    !Object.values(input.drafts).every(
      (value) => value && typeof value.text === 'string' && value.text.length <= 40000 && Number.isFinite(value.at),
    )
  )
    throw new Error('草稿记录格式不正确。')
  if (
    !Array.isArray(input.writingHistory) ||
    !input.writingHistory.every(
      (x) =>
        x &&
        typeof x.id === 'string' &&
        typeof x.promptId === 'string' &&
        typeof x.text === 'string' &&
        x.text.length <= 40000 &&
        typeof x.original === 'string' &&
        Number.isFinite(x.at),
    )
  )
    throw new Error('写作记录格式不正确。')
  if (
    !input.settings ||
    ![10, 20, 30, 50].includes(input.settings.goal) ||
    !['6.0', '6.5', '7.0', '7.5', '8.0'].includes(input.settings.target) ||
    !['light', 'dark', 'system'].includes(input.settings.theme) ||
    !['en-GB', 'en-US'].includes(input.settings.accent) ||
    typeof input.settings.autoAudio !== 'boolean'
  )
    throw new Error('偏好设置格式不正确。')
  return input
}

export function sameDay(timestamp, reference = Date.now()) {
  return new Date(timestamp).toDateString() === new Date(reference).toDateString()
}
