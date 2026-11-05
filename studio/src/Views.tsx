import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CloudOff,
  Download,
  Eye,
  EyeOff,
  Headphones,
  Keyboard,
  Leaf,
  Monitor,
  Moon,
  PenTool,
  Play,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Upload,
  Volume2,
  X,
} from 'lucide-react'
import type { ViewProps } from './App'
import { topics, words, wordById, Word, Topic, prompts } from './data'
import { initialState, navigate, shortDate, timeAgo } from './model'
import { sameDay, validateBackup } from './domain.mjs'
import {
  Button,
  Empty,
  IconButton,
  Modal,
  PageHead,
  Progress,
  SectionHead,
  speak,
  SuccessMark,
  Tag,
  TextLink,
} from './ui'

export function Today({
  store,
  mobile,
  date,
  onWelcome,
  openWord,
  startWriting,
}: ViewProps & { date: string; onWelcome: () => void }) {
  const seen = Object.keys(store.state.seen).length
  const reviewed = Object.keys(store.state.reviewed).length
  const todayWords = Object.values(store.state.seen).filter((x) => sameDay(x.lastSeen)).length
  const recent = words
    .filter((w) => store.state.seen[w.id])
    .sort((a, b) => store.state.seen[b.id].lastSeen - store.state.seen[a.id].lastSeen)
    .slice(0, 4)
  const next = words.filter((w) => !store.state.seen[w.id]).slice(0, 4)
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const count =
      Object.values(store.state.seen).filter((s) => sameDay(s.lastSeen, d.getTime())).length +
      store.state.sessions.filter((s) => sameDay(s.at, d.getTime()) && s.type !== 'typing').length
    return { label: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()], count, today: i === 6 }
  })
  const lastDraft = Object.entries(store.state.drafts)
    .filter(([, d]) => d.text.trim())
    .sort((a, b) => b[1].at - a[1].at)[0]
  return (
    <div className="page today-page">
      <div className="today-intro">
        <div>
          <span className="eyebrow">{date}</span>
          <h1>今日</h1>
          <p>继续学习，或者回顾已经见过的词。</p>
        </div>
        <button className="goal-pill" onClick={onWelcome}>
          <Target size={15} />
          IELTS {store.state.settings.target}
          <ChevronRight size={14} />
        </button>
      </div>
      <section className="study-start">
        <div className="study-start-copy">
          <span className="study-symbol">{mobile ? <BookOpen size={26} /> : <Keyboard size={26} />}</span>
          <div>
            <h2>{mobile ? '继续复习' : '开始今天的练习'}</h2>
            <p>{mobile ? `${seen} 个见过的词，可以继续回顾。` : '听发音、记拼写，把新词留在学习记录里。'}</p>
          </div>
        </div>
        <div className="study-start-actions">
          <Button
            onClick={() => (mobile ? navigate('review') : store.state.onboarded ? navigate('practice') : onWelcome())}
          >
            {mobile ? '开始复习' : '开始练词'}
            <ArrowRight size={16} />
          </Button>
          <button className="quiet-button" onClick={() => startWriting()}>
            写作练习
            <ChevronRight size={14} />
          </button>
        </div>
      </section>
      <div className="today-grid">
        <section className="journey-panel">
          <SectionHead label="YOUR LEARNING LOOP" title="学习记录">
            <span className="quiet-label">随时继续</span>
          </SectionHead>
          <div className="journey-steps">
            <button onClick={() => navigate('practice')}>
              <span className="step-number">01</span>
              <span className="step-icon">
                <Keyboard size={21} />
              </span>
              <h3>练词</h3>
              <p>听发音，敲下拼写</p>
              <div className="step-stat">
                <strong>{seen}</strong>
                <span>个词已见过</span>
                <ArrowUpRight size={16} />
              </div>
            </button>
            <button onClick={() => navigate('review')}>
              <span className="step-number">02</span>
              <span className="step-icon peach">
                <BookOpen size={21} />
              </span>
              <h3>复习</h3>
              <p>释义选择与听音辨词</p>
              <div className="step-stat">
                <strong>{reviewed}</strong>
                <span>个词已复习</span>
                <ArrowUpRight size={16} />
              </div>
            </button>
            <button onClick={() => startWriting()}>
              <span className="step-number">03</span>
              <span className="step-icon sage">
                <PenTool size={21} />
              </span>
              <h3>写作</h3>
              <p>句子、Task 1 与 Task 2</p>
              <div className="step-stat">
                <strong>{store.state.writingHistory.length}</strong>
                <span>次表达已留下</span>
                <ArrowUpRight size={16} />
              </div>
            </button>
          </div>
        </section>
        <section className="daily-panel">
          <div className="daily-head">
            <h3>今日目标</h3>
            <button aria-label="调整每日目标" onClick={onWelcome}>
              <SlidersHorizontal size={16} />
            </button>
          </div>
          <div className="daily-progress">
            <div className="progress-ring">
              <svg viewBox="0 0 100 100">
                <circle className="ring-background" cx="50" cy="50" r="42" />
                <circle
                  className="ring-value"
                  cx="50"
                  cy="50"
                  r="42"
                  style={{ strokeDasharray: `${Math.min(todayWords / store.state.settings.goal, 1) * 264} 264` }}
                />
              </svg>
              <span>
                <strong>{todayWords}</strong>
                <small>/ {store.state.settings.goal} 词</small>
              </span>
            </div>
            <div>
              <strong>{todayWords ? '继续保持' : '还未开始'}</strong>
              <p>{todayWords ? `今天已经遇见 ${todayWords} 个词` : '今天的积累，从这里出发'}</p>
            </div>
          </div>
          <div className="week-strip" aria-label="近七天的学习活动">
            {week.map((d, i) => (
              <div key={i} className={d.today ? 'current' : ''} title={`${d.count} 项活动`}>
                <span className="week-bar">
                  <i style={{ height: `${Math.min(26, 4 + d.count * 3)}px`, opacity: d.count ? 1 : 0.16 }} />
                </span>
                <small>{d.label}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="today-lower">
        <section className="recent-panel">
          <SectionHead
            label={recent.length ? 'WORDS YOU HAVE MET' : 'YOUR NEXT WORDS'}
            title={recent.length ? '最近的词' : '接下来学习'}
          >
            <TextLink onClick={() => navigate('library')}>打开词库</TextLink>
          </SectionHead>
          <div className="word-rows">
            {(recent.length ? recent : next).map((w) => (
              <button key={w.id} className="word-row" onClick={() => openWord(w)}>
                <span className="word-row-en serif">{w.word}</span>
                <span className="word-row-meaning">
                  <small>{w.pos}</small>
                  {w.meaning}
                </span>
                <span className="word-row-topic">{w.topic}</span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </section>
        <section className="writing-invite">
          <div className="writing-invite-icon">
            <PenTool size={22} strokeWidth={1.5} />
          </div>
          <span className="eyebrow">A WORD OF YOUR OWN</span>
          <h3>{lastDraft ? '继续上次写作' : '句子练习'}</h3>
          <p>
            {lastDraft
              ? `${prompts.find((p) => p.id === lastDraft[0])?.title || '写作练习'} · 草稿已保留`
              : '使用学过的词，练习表达一个完整的想法。'}
          </p>
          <TextLink onClick={() => startWriting(lastDraft?.[0])}>
            {lastDraft ? '继续上次写作' : '开始句子练习'}
          </TextLink>
        </section>
      </div>
      <div className="page-footnote">
        <span className="tiny-dot" />
        学习记录自动保存在此设备。
      </div>
    </div>
  )
}

export function Practice({ store, mobile, toast, openWord, startWriting }: ViewProps) {
  const [topic, setTopic] = useState<Topic>('城市生活')
  const list = words.filter((w) => w.topic === topic)
  const [index, setIndex] = useState(0),
    [typed, setTyped] = useState(''),
    [hidden, setHidden] = useState(false),
    [finished, setFinished] = useState(false)
  const input = useRef<HTMLInputElement>(null),
    previous = useRef('')
  const current = list[index]
  const complete = typed.toLowerCase() === current.word.toLowerCase()
  useEffect(() => {
    if (finished) return
    const token = `${topic}-${index}`
    if (previous.current !== token) {
      store.markSeen(current.id)
      previous.current = token
      if (store.state.settings.autoAudio) speak(current, store.state.settings, toast)
    }
    if (!mobile) input.current?.focus()
  }, [topic, index, finished, mobile])
  useEffect(() => {
    document.getElementById('main-content')?.scrollTo({ top: 0 })
  }, [topic, index, finished])
  const next = () => {
    if (index === list.length - 1) {
      setFinished(true)
      store.addSession('typing', list.length)
    } else {
      setIndex((i) => i + 1)
      setTyped('')
      input.current?.focus()
    }
  }
  const switchTopic = (value: Topic) => {
    setTopic(value)
    setIndex(0)
    setTyped('')
    setFinished(false)
    previous.current = ''
  }
  if (finished)
    return (
      <div className="page focus-page">
        <div className="completion">
          <SuccessMark />
          <span className="eyebrow">A LITTLE MORE, EVERY DAY</span>
          <h1>本组 {list.length} 个词已完成。</h1>
          <p>
            它们已经进入你的复习列表。
            <br />
            现在可以复习，或挑一个写进句子。
          </p>
          <div className="completion-word-cloud">
            {list.map((w) => (
              <button key={w.id} onClick={() => openWord(w)}>
                {w.word}
              </button>
            ))}
          </div>
          <div className="completion-actions">
            <Button onClick={() => navigate('review')}>
              去复习
              <ArrowRight size={17} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => startWriting(prompts.find((p) => p.topic === topic && p.mode === 'sentence')?.id)}
            >
              用它们写一句
            </Button>
          </div>
          <TextLink
            onClick={() => {
              setIndex(0)
              setTyped('')
              setFinished(false)
              previous.current = ''
            }}
          >
            再练一组
          </TextLink>
        </div>
      </div>
    )
  return (
    <div className="page practice-page">
      <PageHead
        eyebrow="MEET A WORD"
        title={mobile ? '浏览单词' : '练词'}
        subtitle={mobile ? '回顾见过的词。' : '听发音，练习拼写。'}
      >
        <button className="quiet-button" onClick={() => navigate('library')}>
          <BookOpen size={16} />
          选择词集
        </button>
      </PageHead>
      <div className="topic-tabs" role="tablist" aria-label="练词主题">
        {topics.map((t) => (
          <button role="tab" aria-selected={topic === t} key={t} onClick={() => switchTopic(t)}>
            {t}
          </button>
        ))}
      </div>
      <section className="practice-card">
        <div className="practice-card-top">
          <span>
            <span className="status-dot" />
            {topic}
            <span className="practice-separator">/</span>体验词集
          </span>
          <span className="monospace">
            {String(index + 1).padStart(2, '0')} <span>/ {String(list.length).padStart(2, '0')}</span>
          </span>
        </div>
        <Progress value={(index / list.length) * 100} label="本组练词进度" />
        <div className="practice-word-area">
          <div className="word-controls">
            <IconButton label={hidden ? '显示英文' : '隐藏英文'} onClick={() => setHidden(!hidden)}>
              {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
            </IconButton>
            <IconButton
              label={store.state.saved.includes(current.id) ? '取消收藏' : '收藏单词'}
              onClick={() => store.toggleSaved(current.id)}
            >
              <Bookmark size={18} fill={store.state.saved.includes(current.id) ? 'currentColor' : 'none'} />
            </IconButton>
          </div>
          <span className="eyebrow">
            {mobile ? 'TAKE A CLOSER LOOK' : hidden ? 'RECALL THE WORD' : 'ONE WORD AT A TIME'}
          </span>
          <div className={`typing-word serif ${complete ? 'completed' : ''}`} aria-live="polite">
            {hidden && !complete ? (
              <span>{typed || '· · · · · ·'}</span>
            ) : (
              Array.from(current.word).map((letter, i) => (
                <span
                  key={i}
                  className={
                    mobile
                      ? ''
                      : i < typed.length
                      ? typed[i]?.toLowerCase() === letter.toLowerCase()
                        ? 'typed-correct'
                        : 'typed-wrong'
                      : ''
                  }
                >
                  {letter}
                </span>
              ))
            )}
          </div>
          <div className="pronunciation">
            <span>{current.phonetic}</span>
            <button aria-label="朗读当前单词" onClick={() => speak(current, store.state.settings, toast)}>
              <Volume2 size={20} />
            </button>
          </div>
          <p className="practice-meaning">
            <span>{current.pos}</span>
            {current.meaning}
          </p>
          {!mobile && (
            <div
              className={`typing-input-wrap ${
                typed && !current.word.startsWith(typed.toLowerCase()) ? 'has-error' : ''
              } ${complete ? 'is-complete' : ''}`}
            >
              <Keyboard size={19} />
              <input
                ref={input}
                aria-label="输入英文单词"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={typed}
                placeholder="在这里敲下这个词…"
                onChange={(e) => setTyped(e.target.value.slice(0, 60))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && complete) next()
                }}
              />
              {complete ? <Check size={19} /> : <kbd>↵</kbd>}
            </div>
          )}
          <p className="typing-hint">
            {complete
              ? '写对了。按 Enter 或点击继续。'
              : mobile
              ? '单词已经加入见过的词，可以稍后复习。'
              : typed && !current.word.startsWith(typed.toLowerCase())
              ? '慢一点，看看有没有敲错的字母。'
              : '显示过的词会自动进入复习列表。'}
          </p>
        </div>
        <div className="practice-phrase">
          <span className="eyebrow">常用搭配</span>
          <button onClick={() => speak(current.phrase, store.state.settings, toast)}>
            <span className="serif">{current.phrase}</span>
            <Volume2 size={15} />
          </button>
          <p>{current.phraseMeaning}</p>
        </div>
        <div className="practice-bottom">
          <button className="quiet-button" onClick={next}>
            {mobile ? '下一个词' : '跳过这个词'}
          </button>
          <Button onClick={next} disabled={!mobile && !complete}>
            {index === list.length - 1 ? '完成这一组' : '继续'}
            <ArrowRight size={17} />
          </Button>
        </div>
      </section>
      <div className="practice-footer">
        <span>
          <Headphones size={15} />
          {store.state.settings.accent === 'en-GB' ? '英式' : '美式'} · 设备朗读
        </span>
        <span>不赶进度，把每个词看清楚。</span>
      </div>
    </div>
  )
}

export function Review({ store, mobile, toast, openWord, startWriting }: ViewProps) {
  const [mode, setMode] = useState<'meaning' | 'listening'>('meaning'),
    [queue, setQueue] = useState<string[]>([]),
    [index, setIndex] = useState(0),
    [answer, setAnswer] = useState<string | null>(null),
    [finished, setFinished] = useState(false),
    [right, setRight] = useState(0)
  const ids = Object.keys(store.state.seen).filter((id) => wordById[id])
  const current = wordById[queue[index]]
  const correct = answer === current?.id
  const similar =
    [
      ['alleviate', 'mitigate'],
      ['conserve', 'preserve'],
    ].find((group) => group.includes(current?.id)) || []
  const distractors = current
    ? words.filter((w) => w.id !== current.id && w.meaning !== current.meaning && !similar.includes(w.id))
    : []
  const offset = distractors.length ? (index * 3) % distractors.length : 0
  const choices = current
    ? [current, ...[...distractors.slice(offset), ...distractors.slice(0, offset)].slice(0, 3)].sort(
        (a, b) => ((a.word.length + index) % 7) - ((b.word.length + index) % 7),
      )
    : []
  const start = () => {
    setQueue(
      [...ids].sort((a, b) => (store.state.reviewed[a]?.at || 0) - (store.state.reviewed[b]?.at || 0)).slice(0, 10),
    )
    setIndex(0)
    setAnswer(null)
    setFinished(false)
    setRight(0)
  }
  const choose = (id: string) => {
    if (answer || !current) return
    setAnswer(id)
    if (id === current.id) setRight((r) => r + 1)
    store.setState((p) => ({
      ...p,
      reviewed: { ...p.reviewed, [current.id]: { at: Date.now(), correct: id === current.id } },
    }))
  }
  const next = () => {
    if (index === queue.length - 1) {
      setFinished(true)
      store.addSession('review', queue.length)
    } else {
      setIndex((i) => i + 1)
      setAnswer(null)
    }
  }
  useEffect(() => {
    if (current && mode === 'listening' && !finished) speak(current, store.state.settings, toast)
  }, [index, queue, mode, finished])
  useEffect(() => {
    document.getElementById('main-content')?.scrollTo({ top: 0 })
  }, [queue.length, index, finished])
  useEffect(() => {
    if (answer) document.querySelector('.review-answer-note')?.scrollIntoView({ block: 'nearest' })
  }, [answer])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        document.querySelector('[role="dialog"]') ||
        !current ||
        finished ||
        (e.target as HTMLElement).matches('input,textarea')
      )
        return
      if (/^[1-4]$/.test(e.key) && !answer) choose(choices[Number(e.key) - 1]?.id || 'unknown')
      else if (e.key === 'Enter' && answer) next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [current, answer, index, choices, finished])
  if (finished)
    return (
      <div className="page focus-page">
        <div className="completion">
          <SuccessMark />
          <span className="eyebrow">NICE TO MEET THEM AGAIN</span>
          <h1>本组复习完成</h1>
          <p>
            完成 {queue.length} 张词卡，其中 {right} 张回答正确。
            <br />
            容易混淆的词，下次再一起看看。
          </p>
          <div className="review-summary">
            <div>
              <strong>{queue.length}</strong>
              <span>本次复习</span>
            </div>
            <div>
              <strong>{right}</strong>
              <span>回答正确</span>
            </div>
            <div>
              <strong>{queue.length - right}</strong>
              <span>值得再看</span>
            </div>
          </div>
          <div className="completion-actions">
            <Button onClick={start}>
              再复习一组
              <RotateCcw size={16} />
            </Button>
            <Button variant="secondary" onClick={() => startWriting()}>
              看看写作表达
            </Button>
          </div>
          <TextLink onClick={() => navigate('today')}>回到今日</TextLink>
        </div>
      </div>
    )
  if (!queue.length)
    return (
      <div className="page review-lobby">
        <PageHead eyebrow="NICE TO MEET YOU AGAIN" title="复习" subtitle="回顾电脑上见过的词。" />
        <div className="review-lobby-grid">
          <section className="review-start-panel">
            <div className="review-card-art">
              <span className="art-card card-three" />
              <span className="art-card card-two" />
              <span className="art-card card-one">
                <BookOpen size={33} strokeWidth={1.3} />
                <span className="serif">
                  Again, and
                  <br />
                  <em>a little closer.</em>
                </span>
              </span>
            </div>
            <h2>{ids.length ? `${ids.length} 个见过的词` : '还没有见过的词'}</h2>
            <p>{ids.length ? '从最近没复习过的词开始，每组最多 10 张。' : '电脑练词时见过的单词，会自动进入这里。'}</p>
            <div className="review-mode-picker">
              <button className={mode === 'meaning' ? 'active' : ''} onClick={() => setMode('meaning')}>
                <BookOpen size={18} />
                <span>看释义，选单词</span>
                <Check size={15} />
              </button>
              <button className={mode === 'listening' ? 'active' : ''} onClick={() => setMode('listening')}>
                <Headphones size={18} />
                <span>听发音，选含义</span>
                <Check size={15} />
              </button>
            </div>
            <Button className="full-width" onClick={() => (ids.length ? start() : navigate('practice'))}>
              {ids.length ? '开始这组复习' : mobile ? '先浏览一组词' : '先认识一组词'}
              <ArrowRight size={17} />
            </Button>
          </section>
          <section className="review-aside">
            <span className="eyebrow">KEEP IT LIGHT</span>
            <h3>
              回顾释义、
              <br />
              发音与例句。
            </h3>
            <p>选择答案后，可以看到每个选项的释义和当前单词的常用搭配。</p>
            <div className="mini-review-stats">
              <div>
                <span>见过的词</span>
                <strong>{ids.length}</strong>
              </div>
              <div>
                <span>已复习的词</span>
                <strong>{Object.keys(store.state.reviewed).length}</strong>
              </div>
              <div>
                <span>收藏的词</span>
                <strong>{store.state.saved.length}</strong>
              </div>
            </div>
            <button className="expression-link" onClick={() => startWriting()}>
              <PenTool size={20} />
              <span>
                还有你写过的表达<small>去写作里，再看一遍修改</small>
              </span>
              <ArrowRight size={16} />
            </button>
          </section>
        </div>
      </div>
    )
  return (
    <div className="page review-session">
      <div className="session-heading">
        <button className="quiet-button" onClick={() => setQueue([])}>
          <ArrowLeft size={17} />
          结束复习
        </button>
        <span>{mode === 'meaning' ? '看释义，选单词' : '听发音，选含义'}</span>
        <span className="monospace">
          {String(index + 1).padStart(2, '0')} / {String(queue.length).padStart(2, '0')}
        </span>
      </div>
      <Progress value={(index / queue.length) * 100} label="本组复习进度" />
      <section className="review-question">
        <div className="review-question-meta">
          <Tag>{current.topic}</Tag>
          <span>{timeAgo(store.state.seen[current.id].lastSeen)}</span>
          <IconButton
            label={store.state.saved.includes(current.id) ? '取消收藏' : '收藏当前词'}
            onClick={() => store.toggleSaved(current.id)}
          >
            <Bookmark size={17} fill={store.state.saved.includes(current.id) ? 'currentColor' : 'none'} />
          </IconButton>
        </div>
        <div className="review-prompt">
          <span className="eyebrow">{mode === 'meaning' ? 'WHICH WORD COMES TO MIND?' : 'LISTEN, THEN CHOOSE'}</span>
          {mode === 'meaning' ? (
            <h1>
              <small>{current.pos}</small>
              {current.meaning}
            </h1>
          ) : (
            <h1 className="listening-title">听一听，这是哪个意思？</h1>
          )}
          <button
            className={`audio-circle ${mode === 'listening' ? 'audio-circle-large' : ''}`}
            aria-label="播放题目发音"
            onClick={() => speak(current, store.state.settings, toast)}
          >
            <Volume2 size={mode === 'listening' ? 32 : 23} strokeWidth={1.6} />
          </button>
          {answer && (
            <span className="answer-phonetic">
              {current.word} {current.phonetic}
            </span>
          )}
        </div>
        <div className="review-choices">
          {choices.map((w, i) => (
            <button
              type="button"
              disabled={!!answer}
              key={w.id}
              className={`review-choice ${
                answer
                  ? w.id === current.id
                    ? 'choice-correct'
                    : w.id === answer
                    ? 'choice-wrong'
                    : 'choice-muted'
                  : ''
              }`}
              onClick={() => choose(w.id)}
            >
              <span className="choice-index">
                {answer && w.id === current.id ? (
                  <Check size={17} />
                ) : answer && w.id === answer ? (
                  <X size={17} />
                ) : (
                  i + 1
                )}
              </span>
              <span>
                <strong className={mode === 'meaning' ? 'serif' : ''}>{mode === 'meaning' ? w.word : w.meaning}</strong>
                {answer && <small>{mode === 'meaning' ? w.meaning : w.word}</small>}
              </span>
            </button>
          ))}
        </div>
        {answer ? (
          <div className={`review-answer-note ${correct ? '' : 'needs-another-look'}`}>
            <span>{correct ? '是的，就是这个词。' : '没关系，现在再认识它一次。'}</span>
            <p>
              <strong>{current.phrase}</strong> · {current.phraseMeaning}
            </p>
          </div>
        ) : (
          <button className="unknown-button" onClick={() => choose('unknown')}>
            暂时想不起来
            <ArrowRight size={16} />
          </button>
        )}
        <div className="review-next">
          {answer && (
            <Button className="full-width" onClick={next}>
              {index === queue.length - 1 ? '完成这组复习' : '下一个词'}
              <ArrowRight size={17} />
            </Button>
          )}
        </div>
      </section>
      <p className="session-footnote">{mobile ? '轻轻点选，让记忆回来一点。' : '按 1—4 选择答案，按 Enter 继续。'}</p>
    </div>
  )
}

export function Library({ store, openWord, toast }: ViewProps) {
  const [search, setSearch] = useState(''),
    [topic, setTopic] = useState('全部主题'),
    [filter, setFilter] = useState('全部单词')
  const filtered = words.filter(
    (w) =>
      (topic === '全部主题' || w.topic === topic) &&
      (filter === '全部单词' ||
        (filter === '已见过' && store.state.seen[w.id]) ||
        (filter === '已收藏' && store.state.saved.includes(w.id))) &&
      `${w.word} ${w.meaning} ${w.phrase}`.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <div className="page library-page">
      <PageHead eyebrow="YOUR GROWING VOCABULARY" title="词库" subtitle="浏览主题词集、释义与例句。">
        <Tag>{words.length} 个体验词条</Tag>
      </PageHead>
      <div className="library-banner">
        <span className="library-banner-icon">
          <BookOpen size={26} strokeWidth={1.4} />
        </span>
        <div>
          <strong>雅思词集</strong>
          <p>四个常用话题，连接听读与写作表达。</p>
        </div>
        <span className="library-banner-meta">
          {Object.keys(store.state.seen).length} / {words.length}
          <small>已见过</small>
        </span>
      </div>
      <div className="library-tools">
        <div className="filter-tabs" role="tablist" aria-label="单词状态">
          {['全部单词', '已见过', '已收藏'].map((f) => (
            <button
              role="tab"
              aria-selected={filter === f}
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f}
              <span>
                {f === '全部单词'
                  ? words.length
                  : f === '已见过'
                  ? Object.keys(store.state.seen).length
                  : store.state.saved.length}
              </span>
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="搜索词库"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索单词或中文含义"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="清除搜索">
              <X size={15} />
            </button>
          )}
        </label>
      </div>
      <div className="topic-filters">
        {['全部主题', ...topics].map((t) => (
          <button key={t} className={topic === t ? 'active' : ''} onClick={() => setTopic(t)}>
            {t === '环境与资源' && <Leaf size={13} />}
            {t === '城市生活' && <Building2 size={13} />}
            {t}
          </button>
        ))}
        <span>{filtered.length} 个词</span>
      </div>
      <div className="vocabulary-table">
        <div className="vocabulary-table-head">
          <span>单词 / WORD</span>
          <span>释义与搭配</span>
          <span>主题</span>
          <span>状态</span>
          <span />
        </div>
        {filtered.map((w) => (
          <div key={w.id} className="vocabulary-row">
            <button className="vocabulary-word" onClick={() => openWord(w)}>
              <strong className="serif">{w.word}</strong>
              <small>{w.phonetic}</small>
            </button>
            <button className="vocabulary-definition" onClick={() => openWord(w)}>
              <span>
                <small>{w.pos}</small>
                {w.meaning}
              </span>
              <small>{w.phrase}</small>
            </button>
            <span className="vocabulary-topic">
              <Tag>{w.topic}</Tag>
            </span>
            <span className={`vocabulary-state ${store.state.seen[w.id] ? 'seen' : ''}`}>
              {store.state.seen[w.id] ? (
                <>
                  <span className="status-dot" />
                  已见过
                </>
              ) : (
                '待遇见'
              )}
            </span>
            <div className="vocabulary-actions">
              <IconButton label={`朗读 ${w.word}`} onClick={() => speak(w, store.state.settings, toast)}>
                <Volume2 size={16} />
              </IconButton>
              <IconButton
                label={`${store.state.saved.includes(w.id) ? '取消收藏' : '收藏'} ${w.word}`}
                onClick={() => store.toggleSaved(w.id)}
              >
                <Bookmark size={16} fill={store.state.saved.includes(w.id) ? 'currentColor' : 'none'} />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
      {!filtered.length && (
        <Empty
          icon={<Search size={30} />}
          title={filter === '已收藏' && !search ? '暂无收藏' : '没有找到相关单词'}
          text={
            filter === '已见过'
              ? '去练词或打开词条加入复习，记录就会出现在这里。'
              : '可以换一个主题，或者试试其他关键词。'
          }
        >
          <Button
            variant="secondary"
            onClick={() => {
              setFilter('全部单词')
              setTopic('全部主题')
              setSearch('')
            }}
          >
            查看全部单词
          </Button>
        </Empty>
      )}
      <p className="caption library-caption">体验词集包含独立编写的中文释义与原创例句，完整词库将在内容审校后扩充。</p>
    </div>
  )
}

export function Preferences({ store, toast, openSync }: ViewProps & { openSync: () => void }) {
  const [confirm, setConfirm] = useState(false),
    file = useRef<HTMLInputElement>(null)
  const settings = store.state.settings
  const update = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) =>
    store.setState((p) => ({ ...p, settings: { ...p.settings, [key]: value } }))
  const exportData = () => {
    const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a')
    a.href = url
    a.download = `wordloom-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast('学习记录已导出。')
  }
  const importData = async (f?: File) => {
    if (!f) return
    try {
      if (f.size > 5_000_000) throw new Error('文件过大，请选择 Wordloom 导出的记录。')
      const data = validateBackup(
        JSON.parse(await f.text()),
        words.map((w) => w.id),
      )
      store.setState({ ...initialState(), ...data })
      toast('学习记录已导入。')
    } catch (e) {
      toast(e instanceof Error ? e.message : '无法读取这个文件。')
    } finally {
      if (file.current) file.current.value = ''
    }
  }
  return (
    <div className="page settings-page">
      <PageHead eyebrow="YOUR SPACE, YOUR PACE" title="设置" subtitle="管理学习偏好与记录。" />
      <div className="settings-layout">
        <section className="settings-profile">
          <span className="avatar avatar-large">W</span>
          <h2>我的 Wordloom</h2>
          <p>本地学习空间</p>
          <button className="profile-cloud" onClick={openSync}>
            <CloudOff size={16} />
            当前记录仅存于此设备
            <ChevronRight size={15} />
          </button>
          <div className="profile-stats">
            <span>
              <strong>{Object.keys(store.state.seen).length}</strong>个词已见过
            </span>
            <span>
              <strong>{store.state.writingHistory.length}</strong>次写作练习
            </span>
          </div>
        </section>
        <div className="settings-sections">
          <section className="settings-section">
            <h2>
              <Target size={18} />
              学习偏好
            </h2>
            <label className="setting-row">
              <span>
                <strong>目标写作分数</strong>
                <small>作为学习方向，练习不会预测考试成绩</small>
              </span>
              <select value={settings.target} onChange={(e) => update('target', e.target.value)}>
                {['6.0', '6.5', '7.0', '7.5', '8.0'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="setting-row">
              <span>
                <strong>每日见词目标</strong>
                <small>调整一个适合自己节奏的小目标</small>
              </span>
              <select value={settings.goal} onChange={(e) => update('goal', Number(e.target.value))}>
                {[10, 20, 30, 50].map((x) => (
                  <option key={x} value={x}>
                    {x} 个词
                  </option>
                ))}
              </select>
            </label>
          </section>
          <section className="settings-section">
            <h2>
              <Volume2 size={18} />
              声音与外观
            </h2>
            <div className="setting-row">
              <span>
                <strong>发音偏好</strong>
                <small>当前使用设备朗读，正式音频将预先生成</small>
              </span>
              <div className="segmented">
                <button
                  className={settings.accent === 'en-GB' ? 'active' : ''}
                  onClick={() => update('accent', 'en-GB')}
                >
                  英式
                </button>
                <button
                  className={settings.accent === 'en-US' ? 'active' : ''}
                  onClick={() => update('accent', 'en-US')}
                >
                  美式
                </button>
              </div>
            </div>
            <div className="setting-row">
              <span>
                <strong>练词时自动播放发音</strong>
                <small>浏览器可能要求先手动播放一次</small>
              </span>
              <button
                role="switch"
                aria-label="练词时自动播放发音"
                aria-checked={settings.autoAudio}
                className={`switch ${settings.autoAudio ? 'on' : ''}`}
                onClick={() => update('autoAudio', !settings.autoAudio)}
              >
                <span />
              </button>
            </div>
            <div className="setting-row">
              <span>
                <strong>外观</strong>
                <small>选一个舒服的阅读环境</small>
              </span>
              <div className="segmented appearance-picker">
                {(
                  [
                    { id: 'light', name: '浅色', icon: Sun },
                    { id: 'dark', name: '深色', icon: Moon },
                    { id: 'system', name: '系统', icon: Monitor },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    className={settings.theme === t.id ? 'active' : ''}
                    onClick={() => update('theme', t.id)}
                  >
                    <t.icon size={15} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section className="settings-section">
            <h2>
              <CloudOff size={18} />
              学习记录
            </h2>
            <div className="setting-row">
              <span>
                <strong>iCloud 同步</strong>
                <small>尚未连接，当前使用本地保存</small>
              </span>
              <Button variant="secondary" onClick={openSync}>
                查看连接
              </Button>
            </div>
            <div className="setting-row">
              <span>
                <strong>导出与导入</strong>
                <small>导入会替换此设备记录，请先导出备份</small>
              </span>
              <div className="data-actions">
                <IconButton label="导出学习记录" onClick={exportData}>
                  <Download size={18} />
                </IconButton>
                <IconButton label="导入学习记录" onClick={() => file.current?.click()}>
                  <Upload size={18} />
                </IconButton>
                <input
                  ref={file}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={(e) => importData(e.target.files?.[0])}
                />
              </div>
            </div>
            <div className="setting-row">
              <span>
                <strong>清空此设备记录</strong>
                <small>移除学习进度、草稿、收藏与偏好</small>
              </span>
              <button className="danger-text" onClick={() => setConfirm(true)}>
                <Trash2 size={16} />
                清空
              </button>
            </div>
          </section>
          <section className="settings-section about-section">
            <h2>关于 Wordloom</h2>
            <p>
              把电脑上的认真学习，延续到手机上的轻松复习。
              <br />
              让单词、搭配和你自己的表达，在同一个地方生长。
            </p>
            <div>
              <span>交互设计版 · 0.2</span>
              <button onClick={() => navigate('design')}>色彩画板</button>
              <button onClick={() => navigate('app')}>原生 App 原型</button>
              <a href="https://github.com/childrentime/qwerty-ielts" target="_blank" rel="noreferrer">
                网页源码与 GPL-3.0 许可
                <ArrowUpRight size={13} />
              </a>
            </div>
          </section>
        </div>
      </div>
      {confirm && (
        <Modal title="清空这个学习空间？" onClose={() => setConfirm(false)}>
          <p className="modal-description">这会删除此设备上的所有学习记录、写作草稿和收藏。建议先导出一份备份。</p>
          <div className="modal-footer">
            <Button
              variant="secondary"
              onClick={() => {
                exportData()
                setConfirm(false)
              }}
            >
              先导出备份
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                store.setState(initialState())
                setConfirm(false)
                toast('此设备的学习记录已清空。')
              }}
            >
              确认清空
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
