import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Lightbulb,
  Maximize2,
  Minimize2,
  Pause,
  PenTool,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react'
import type { ViewProps } from './App'
import { modeLabels, Prompt, prompts, Word, wordById, words, WritingMode } from './data'
import { History, shortDate } from './model'
import { checkWriting, countWords } from './domain.mjs'
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

function TransportChart() {
  return (
    <div className="chart-card">
      <div className="chart-head">
        <strong>How people commute</strong>
        <span>Share of commuters (%)</span>
      </div>
      <svg
        viewBox="0 0 520 210"
        role="img"
        aria-label="练习图表：2000、2010、2020年，汽车占比分别50%、42%、30%，公共交通35%、45%、58%，自行车15%、13%、12%。"
      >
        <title>Commuting patterns, 2000–2020 · original practice chart</title>
        {[0, 20, 40, 60].map((v) => (
          <g key={v}>
            <line x1="45" x2="485" y1={175 - v * 2.4} y2={175 - v * 2.4} stroke="currentColor" opacity=".1" />
            <text x="23" y={179 - v * 2.4} fill="currentColor" opacity=".6" fontSize="11">
              {v}
            </text>
          </g>
        ))}
        {['2000', '2010', '2020'].map((y, i) => (
          <text key={y} x={65 + i * 200} y="199" textAnchor="middle" fontSize="11" fill="currentColor">
            {y}
          </text>
        ))}
        <polyline points="65,55 265,74 465,103" fill="none" stroke="var(--chart-car)" strokeWidth="3" />
        <polyline points="65,91 265,67 465,36" fill="none" stroke="var(--chart-bus)" strokeWidth="3" />
        <polyline points="65,139 265,144 465,146" fill="none" stroke="var(--chart-bike)" strokeWidth="3" />
        {[
          [65, 55],
          [265, 74],
          [465, 103],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="var(--chart-car)" />
        ))}
        {[
          [65, 91],
          [265, 67],
          [465, 36],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="var(--chart-bus)" />
        ))}
        {[
          [65, 139],
          [265, 144],
          [465, 146],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="var(--chart-bike)" />
        ))}
      </svg>
      <div className="chart-legend">
        <span>
          <i style={{ background: 'var(--chart-car)' }} />
          Car
        </span>
        <span>
          <i style={{ background: 'var(--chart-bus)' }} />
          Public transport
        </span>
        <span>
          <i style={{ background: 'var(--chart-bike)' }} />
          Bicycle
        </span>
        <small>原创练习题</small>
      </div>
    </div>
  )
}

export function Writing(props: ViewProps & { initialPrompt: string }) {
  const { store, mobile, toast, openWord, initialPrompt } = props
  const [selected, setSelected] = useState(initialPrompt),
    [historyView, setHistoryView] = useState(false)
  const prompt = prompts.find((p) => p.id === selected) || prompts[0]
  const text = store.state.drafts[prompt.id]?.text || ''
  const [report, setReport] = useState<ReturnType<typeof checkWriting> | null>(null)
  const [sideTab, setSideTab] = useState<'words' | 'reference' | 'feedback'>('words')
  const [focused, setFocused] = useState(false),
    [running, setRunning] = useState(false),
    [elapsed, setElapsed] = useState(0)
  const [openedHistory, setOpenedHistory] = useState<History | null>(null)
  const editor = useRef<HTMLTextAreaElement>(null)
  const wordCount = countWords(text),
    minimum = prompt.mode === 'task1' ? 150 : prompt.mode === 'task2' ? 250 : 0
  useEffect(() => {
    setSelected(initialPrompt)
    setHistoryView(false)
  }, [initialPrompt])
  useEffect(() => {
    setReport(null)
    setSideTab('words')
    setRunning(false)
    setElapsed(0)
  }, [selected])
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setElapsed((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [running])
  if (mobile) return <MobileWriting {...props} />
  const selectMode = (mode: WritingMode) => {
    setHistoryView(false)
    setSelected(
      prompts.find((p) => p.mode === mode && p.topic === prompt.topic)?.id || prompts.find((p) => p.mode === mode)!.id,
    )
  }
  const inspect = (value = text) => {
    if (countWords(value) < 3) {
      toast('先写下一点想法，再检查表达。')
      editor.current?.focus()
      return
    }
    setReport(checkWriting(value, prompt.mode, prompt.targets))
    setSideTab('feedback')
  }
  const loadExample = () => {
    store.saveDraft(prompt.id, prompt.starter)
    setReport(null)
    setSideTab('words')
    editor.current?.focus()
    toast('已载入示例，可以尝试检查与修改。')
  }
  const save = () => {
    if (wordCount < 3) {
      toast('先写下一点想法，再保存这次练习。')
      return
    }
    if (store.state.writingHistory.some((h) => h.promptId === prompt.id && h.text === text)) {
      toast('这份表达已经保存过了。')
      return
    }
    const record: History = {
      id: crypto.randomUUID(),
      promptId: prompt.id,
      text,
      original: report?.original || text,
      at: Date.now(),
    }
    store.setState((p) => ({ ...p, writingHistory: [record, ...p.writingHistory].slice(0, 500) }))
    store.addSession('writing', wordCount)
    toast('已保存到“我的表达”，手机视图也可以回顾。')
  }
  const insertWord = (word: Word) => {
    const input = editor.current,
      start = input?.selectionStart ?? text.length,
      end = input?.selectionEnd ?? text.length
    const before = text.slice(0, start),
      after = text.slice(end),
      insertion = (before && !/\s$/.test(before) ? ' ' : '') + word.word + (after && !/^\s/.test(after) ? ' ' : '')
    store.saveDraft(prompt.id, before + insertion + after)
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(start + insertion.length, start + insertion.length)
    })
  }
  const targetWords = prompt.targets.map((id) => wordById[id]).filter(Boolean)
  const seenForTopic = words
    .filter((w) => store.state.seen[w.id] && w.topic === prompt.topic && !prompt.targets.includes(w.id))
    .slice(0, 3)
  return (
    <div className={`page writing-page ${focused ? 'focus-mode' : ''}`}>
      <PageHead
        eyebrow="YOUR WORDS, YOUR VOICE"
        title="让想法，有自己的英文。"
        subtitle="从一个句子开始，把学过的词真正用起来。"
      >
        <span className="writing-goal">
          <TargetIcon />
          IELTS {store.state.settings.target} · 我的方向
        </span>
      </PageHead>
      <div className="writing-nav" role="tablist" aria-label="写作类型">
        {(['sentence', 'task1', 'task2'] as const).map((mode) => (
          <button
            role="tab"
            aria-selected={!historyView && prompt.mode === mode}
            className={!historyView && prompt.mode === mode ? 'active' : ''}
            key={mode}
            onClick={() => selectMode(mode)}
          >
            {modeLabels[mode]}
            {mode === 'sentence' && <span>从一句开始</span>}
          </button>
        ))}
        <button
          role="tab"
          aria-selected={historyView}
          className={historyView ? 'active' : ''}
          onClick={() => setHistoryView(true)}
        >
          <Bookmark size={15} />
          我的表达<span>{store.state.writingHistory.length}</span>
        </button>
      </div>
      {historyView ? (
        <div className="writing-history">
          <SectionHead title="写下过的，都在这里。">
            <span className="quiet-label">保留你的想法，也保留修改的过程</span>
          </SectionHead>
          {store.state.writingHistory.length ? (
            store.state.writingHistory.map((h) => {
              const p = prompts.find((x) => x.id === h.promptId)
              return (
                <button className="history-row" key={h.id} onClick={() => setOpenedHistory(h)}>
                  <span className="history-icon">
                    <FileText size={22} />
                  </span>
                  <span>
                    <strong>{p?.title || '自由表达'}</strong>
                    <small>
                      {h.text.slice(0, 100)}
                      {h.text.length > 100 ? '…' : ''}
                    </small>
                  </span>
                  <span className="history-meta">
                    <Tag>{p ? modeLabels[p.mode] : '写作'}</Tag>
                    <small>
                      {shortDate(h.at)} · {countWords(h.text)} 词
                    </small>
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              )
            })
          ) : (
            <Empty
              icon={<PenTool size={32} />}
              title="给自己的第一句，留一个位置。"
              text="完成写作后保存练习，你的表达与修改就会出现在这里。"
            >
              <Button onClick={() => selectMode('sentence')}>
                写下第一句
                <ArrowRight size={16} />
              </Button>
            </Empty>
          )}
        </div>
      ) : (
        <>
          <div className="writing-topic-bar">
            <div>
              <span className="topic-dot" />
              <span>{prompt.topic}</span>
              <span className="muted">/</span>
              <select aria-label="选择写作题目" value={selected} onChange={(e) => setSelected(e.target.value)}>
                {prompts
                  .filter((p) => p.mode === prompt.mode)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </div>
            <span>
              {prompt.mode === 'sentence'
                ? '用 1—2 句话表达'
                : prompt.mode === 'task1'
                ? '建议 20 分钟 · 150+ 词'
                : '建议 40 分钟 · 250+ 词'}
            </span>
          </div>
          <div className="writing-workspace">
            <div className="writing-main-column">
              <section className="writing-prompt">
                <div className="prompt-heading">
                  <span className="eyebrow">
                    {prompt.mode === 'sentence' ? 'TODAY’S LITTLE CHALLENGE' : 'YOUR WRITING TASK'}
                  </span>
                  <Tag>{prompt.mode === 'sentence' ? '中 → 英' : '原创练习题'}</Tag>
                </div>
                <h2>{prompt.mode === 'sentence' ? prompt.instruction : prompt.title}</h2>
                <p className="prompt-english">{prompt.english}</p>
                {prompt.mode !== 'sentence' && <p className="prompt-instruction">{prompt.instruction}</p>}
                {prompt.mode === 'task1' && <TransportChart />}
                {prompt.mode === 'sentence' && (
                  <div className="prompt-targets">
                    <span>可以试着用</span>
                    {targetWords.map((w) => (
                      <button key={w.id} onClick={() => openWord(w)}>
                        {w.word}
                        <ArrowUpRight size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </section>
              <section className="editor-panel">
                <div className="editor-toolbar">
                  <span>
                    <PenTool size={15} />
                    你的表达
                  </span>
                  <div>
                    <button
                      className={`timer-control ${running ? 'running' : ''}`}
                      onClick={() => setRunning(!running)}
                      aria-label={running ? '暂停写作计时' : '开始写作计时'}
                    >
                      {running ? <Pause size={13} /> : <Play size={13} />}
                      <span>
                        {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
                      </span>
                    </button>
                    <span className="toolbar-divider" />
                    <IconButton label={focused ? '退出专注模式' : '专注模式'} onClick={() => setFocused(!focused)}>
                      {focused ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </IconButton>
                  </div>
                </div>
                <textarea
                  ref={editor}
                  aria-label="英文写作编辑器"
                  value={text}
                  maxLength={40000}
                  placeholder={
                    prompt.mode === 'sentence'
                      ? '从你的第一个词开始…\n\n不必追求完美，先把想法写下来。'
                      : 'Write your response here…\n\nStart with your main idea, then develop it in your own words.'
                  }
                  spellCheck={false}
                  onChange={(e) => store.saveDraft(prompt.id, e.target.value)}
                />
                <div className="editor-status">
                  <span>
                    <span className={`status-dot ${text ? '' : 'inactive'}`} />
                    {text ? '草稿已保存在此设备' : '开始输入后自动保存'}
                  </span>
                  <span>
                    <strong>{wordCount}</strong>
                    {minimum ? ` / ${minimum}` : ''} 词
                  </span>
                </div>
                <div className="editor-actions">
                  <button className="quiet-button" onClick={loadExample}>
                    <Lightbulb size={15} />
                    载入示例
                  </button>
                  <div>
                    <Button variant="secondary" onClick={save}>
                      <Bookmark size={15} />
                      保存练习
                    </Button>
                    <Button onClick={() => inspect()}>
                      <Sparkles size={16} />
                      检查表达
                      <ArrowRight size={15} />
                    </Button>
                  </div>
                </div>
              </section>
              <div className="writing-nudge">
                <span>✳</span>
                <p>自然表达优先。你可以用自己的说法，不需要逐字匹配参考句。</p>
              </div>
            </div>
            <aside className="writing-support">
              <div className="support-tabs" role="tablist" aria-label="写作辅助面板">
                {(
                  [
                    { id: 'words', label: '用得上的词' },
                    { id: 'reference', label: '参考表达' },
                    { id: 'feedback', label: '检查结果' },
                  ] as const
                ).map((tab) => (
                  <button
                    role="tab"
                    aria-selected={sideTab === tab.id}
                    key={tab.id}
                    className={sideTab === tab.id ? 'active' : ''}
                    onClick={() => setSideTab(tab.id)}
                  >
                    {tab.label}
                    {tab.id === 'feedback' && report && <span className="tab-dot" />}
                  </button>
                ))}
              </div>
              {sideTab === 'words' && (
                <div className="support-body">
                  <span className="eyebrow">WORDS IN CONTEXT</span>
                  <h3>给表达搭一座小桥。</h3>
                  <p className="support-intro">看看搭配，再决定它是否适合你的意思。</p>
                  {targetWords.map((w) => (
                    <div className="support-word" key={w.id}>
                      <div>
                        <button className="serif" onClick={() => openWord(w)}>
                          {w.word}
                          <ArrowUpRight size={13} />
                        </button>
                        <IconButton label={`把 ${w.word} 插入编辑器`} onClick={() => insertWord(w)}>
                          <Plus size={16} />
                        </IconButton>
                      </div>
                      <p>
                        <span>{w.pos}</span>
                        {w.meaning}
                      </p>
                      <span className="support-phrase">{w.phrase}</span>
                      {store.state.seen[w.id] && (
                        <span className="seen-badge">
                          <Check size={11} />
                          你已经见过
                        </span>
                      )}
                    </div>
                  ))}
                  {seenForTopic.length > 0 && (
                    <div className="seen-word-bank">
                      <span className="eyebrow">你还见过这些词</span>
                      <div>
                        {seenForTopic.map((w) => (
                          <button key={w.id} onClick={() => openWord(w)}>
                            {w.word}
                            <ArrowUpRight size={12} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="support-tip">
                    <Lightbulb size={18} />
                    <p>
                      {prompt.mode === 'task1'
                        ? '先概述整体趋势，再比较具体数据。重点是准确呈现图表。'
                        : prompt.mode === 'task2'
                        ? '先让观点清楚，再用理由和例子把它展开。每段围绕一个主要想法。'
                        : '从一个清楚的意思出发，再把词放进自然的搭配里。'}
                    </p>
                  </div>
                </div>
              )}
              {sideTab === 'reference' && (
                <div className="support-body reference-panel">
                  <span className="eyebrow">ONE WAY TO SAY IT</span>
                  <h3>一种表达，不是唯一答案。</h3>
                  <p className="support-intro">可以比较思路与搭配，再回到你自己的句子。</p>
                  <div className="reference-text">
                    {prompt.reference.split('\n\n').map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <div className="reference-actions">
                    <button
                      className="quiet-button"
                      onClick={() => speak(prompt.reference, store.state.settings, toast)}
                    >
                      <Volume2 size={16} />
                      听一听
                    </button>
                    <Tag>原创参考示例</Tag>
                  </div>
                </div>
              )}
              {sideTab === 'feedback' && (
                <div className="support-body feedback-panel">
                  {report ? (
                    <>
                      <div className="feedback-title">
                        <span className="feedback-icon">
                          <CheckCircle2 size={21} />
                        </span>
                        <div>
                          <span className="eyebrow">A CLOSER LOOK</span>
                          <h3>给表达一次回看。</h3>
                        </div>
                      </div>
                      <Tag>本地基础检查</Tag>
                      {report.original !== text && <p className="feedback-stale">草稿已修改，可以重新检查当前表达。</p>}
                      <div className="feedback-metrics">
                        <div>
                          <strong>{report.wordCount}</strong>
                          <span>英文词数</span>
                        </div>
                        <div>
                          <strong>
                            {report.used.length}
                            <small>/{report.targets.length}</small>
                          </strong>
                          <span>尝试的目标词</span>
                        </div>
                        <div>
                          <strong>{report.issues.length}</strong>
                          <span>发现的常见问题</span>
                        </div>
                      </div>
                      {minimum > 0 && (
                        <div className="word-target-note">
                          <Progress value={(report.wordCount / minimum) * 100} label="建议写作词数进度" />
                          <p>
                            {report.wordCount >= minimum
                              ? '已达到本题建议词数，可以继续检查内容是否完整。'
                              : `距离本题建议词数还差 ${minimum - report.wordCount} 词，可以继续展开观点。`}
                          </p>
                        </div>
                      )}
                      <div className="feedback-issues">
                        {report.issues.length ? (
                          report.issues.map((issue, i) => (
                            <article key={i} className="feedback-issue">
                              <span className="issue-number">{String(i + 1).padStart(2, '0')}</span>
                              <div>
                                <h4>{issue.title}</h4>
                                <div className="correction-pair">
                                  <del>{issue.before}</del>
                                  <ArrowRight size={12} />
                                  <ins>{issue.after}</ins>
                                </div>
                                <p>{issue.explanation}</p>
                              </div>
                            </article>
                          ))
                        ) : (
                          <div className="no-issues">
                            <Check size={22} />
                            <p>没有发现当前规则覆盖的常见问题。你仍可以对照参考表达，检查意思和搭配。</p>
                          </div>
                        )}
                      </div>
                      {report.issues.length > 0 && (
                        <Button
                          variant="secondary"
                          className="full-width"
                          disabled={report.original !== text}
                          onClick={() => {
                            store.saveDraft(prompt.id, report.corrected)
                            toast('已应用这些修改，保存练习后可以回顾修改前后。')
                          }}
                        >
                          {report.original !== text ? '修改已应用或草稿已变化' : '应用这些修改'}
                          <Check size={15} />
                        </Button>
                      )}
                      <p className="caption">基础检查覆盖少量明确的语言规则，可对照参考表达继续修改。</p>
                    </>
                  ) : (
                    <div className="feedback-empty">
                      <Sparkles size={28} strokeWidth={1.3} />
                      <h3>先写一点，再一起看看。</h3>
                      <p>检查词数、目标词使用和常见语法问题。你也可以载入示例，体验修改过程。</p>
                      <Button variant="secondary" onClick={loadExample}>
                        载入一段示例
                      </Button>
                      <p className="caption">检查在此设备完成，不上传写作内容。</p>
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>
        </>
      )}
      {openedHistory && (
        <Modal
          title={prompts.find((p) => p.id === openedHistory.promptId)?.title || '我的表达'}
          eyebrow={`${shortDate(openedHistory.at)} / YOUR EXPRESSION`}
          wide
          onClose={() => setOpenedHistory(null)}
        >
          {openedHistory.original !== openedHistory.text && (
            <div className="history-original">
              <span className="eyebrow">修改前</span>
              <p>{openedHistory.original}</p>
            </div>
          )}
          <div className="history-final">
            <span className="eyebrow">保存的表达</span>
            <p>{openedHistory.text}</p>
          </div>
          <div className="modal-footer">
            <span className="caption">{countWords(openedHistory.text)} 词 · 保存在此设备</span>
            <Button
              onClick={() => {
                setSelected(openedHistory.promptId)
                store.saveDraft(openedHistory.promptId, openedHistory.text)
                setHistoryView(false)
                setOpenedHistory(null)
              }}
            >
              继续修改
              <ArrowRight size={16} />
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function TargetIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" />
      <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  )
}

function MobileWriting({ store, toast, openWord }: ViewProps) {
  const [tab, setTab] = useState<'expressions' | 'history'>('expressions'),
    [example, setExample] = useState(false),
    [index, setIndex] = useState(0),
    [selected, setSelected] = useState<number | null>(null),
    [done, setDone] = useState(false),
    [opened, setOpened] = useState<History | null>(null)
  useEffect(() => {
    document.getElementById('main-content')?.scrollTo({ top: 0 })
  }, [index, example, tab, done])
  useEffect(() => {
    if (selected !== null) document.querySelector('.expression-explanation')?.scrollIntoView({ block: 'nearest' })
  }, [selected])
  const sampleReport = checkWriting(prompts[0].starter, 'sentence', prompts[0].targets)
  const exampleRecord: History = {
    id: 'example',
    promptId: prompts[0].id,
    original: prompts[0].starter,
    text: sampleReport.corrected,
    at: 0,
  }
  const records = example ? [exampleRecord] : store.state.writingHistory
  const current = records[index],
    prompt = prompts.find((p) => p.id === current?.promptId) || prompts[0]
  const checkedOriginal = current ? checkWriting(current.original, prompt.mode, prompt.targets) : null
  const changed =
    !!current &&
    !!checkedOriginal?.issues.length &&
    checkedOriginal.corrected === current.text &&
    current.original !== current.text
  const choices = current ? (index % 2 ? [current.text, current.original] : [current.original, current.text]) : []
  const choose = (value: number) => {
    if (selected === null) setSelected(value)
  }
  const next = () => {
    if (index === records.length - 1) setDone(true)
    else {
      setIndex((i) => i + 1)
      setSelected(null)
    }
  }
  return (
    <div className="page mobile-writing-page">
      <PageHead
        eyebrow="YOUR OWN EXPRESSIONS"
        title="写过的句子，再看一遍。"
        subtitle="电脑上认真写，在这里轻松回顾。"
      />
      <div className="filter-tabs mobile-writing-tabs" role="tablist" aria-label="表达复习类型">
        <button
          role="tab"
          aria-selected={tab === 'expressions'}
          className={tab === 'expressions' ? 'active' : ''}
          onClick={() => setTab('expressions')}
        >
          表达卡<span>{store.state.writingHistory.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'history'}
          className={tab === 'history' ? 'active' : ''}
          onClick={() => setTab('history')}
        >
          写作记录
        </button>
      </div>
      {tab === 'history' ? (
        <div className="mobile-history-list">
          {store.state.writingHistory.length ? (
            store.state.writingHistory.map((h) => (
              <button className="mobile-history-item" key={h.id} onClick={() => setOpened(h)}>
                <div>
                  <Tag>{modeLabels[prompts.find((p) => p.id === h.promptId)?.mode || 'sentence']}</Tag>
                  <span>{shortDate(h.at)}</span>
                </div>
                <h3>{prompts.find((p) => p.id === h.promptId)?.title || '我的表达'}</h3>
                <p>
                  {h.text.slice(0, 150)}
                  {h.text.length > 150 ? '…' : ''}
                </p>
                <span className="text-link">
                  回顾这次表达
                  <ArrowRight size={15} />
                </span>
              </button>
            ))
          ) : (
            <Empty
              icon={<FileText size={30} />}
              title="你的想法，值得留下。"
              text="在电脑完成写作并保存练习后，可以在这里回顾。"
            />
          )}
        </div>
      ) : !records.length ? (
        <>
          <div className="mobile-writing-intro">
            <span className="mobile-writing-feather">
              <PenTool size={34} strokeWidth={1.2} />
            </span>
            <span className="eyebrow">FROM A WORD TO YOUR VOICE</span>
            <h2>
              把改过的表达，
              <br />
              变成下一次的自然落笔。
            </h2>
            <p>
              这里会保留你写过的句子和修改。
              <br />
              点选、对照、再看一眼，不需要输入。
            </p>
            <Button
              className="full-width"
              onClick={() => {
                setExample(true)
                setIndex(0)
                setDone(false)
                setSelected(null)
              }}
            >
              先看一个表达示例
              <ArrowRight size={16} />
            </Button>
          </div>
          <div className="mobile-writing-path">
            <span>在电脑写一句</span>
            <ChevronRight size={13} />
            <span>保存与修改</span>
            <ChevronRight size={13} />
            <span>在这里再见</span>
          </div>
        </>
      ) : done ? (
        <div className="completion mobile-expression-complete">
          <SuccessMark />
          <h2>这些表达，又近了一点。</h2>
          <p>
            回顾了 {records.length} 张{example ? '示例' : ''}表达卡。
            <br />
            下次落笔时，试着想起这些搭配。
          </p>
          <Button
            onClick={() => {
              setIndex(0)
              setSelected(null)
              setDone(false)
            }}
          >
            再看一遍
            <RotateCcw size={16} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setExample(false)
              setDone(false)
              setIndex(0)
              setSelected(null)
              setTab('history')
            }}
          >
            查看我的写作记录
          </Button>
        </div>
      ) : (
        current && (
          <section className="expression-review-card">
            <div className="expression-card-top">
              <Tag>{example ? '表达示例' : '我的表达'}</Tag>
              <span>
                {index + 1} / {records.length}
              </span>
            </div>
            <span className="eyebrow">{changed ? 'WHICH EXPRESSION WORKS BETTER?' : 'A THOUGHT WORTH KEEPING'}</span>
            <h2>{changed ? '哪种表达更自然？' : '再看看，你写下的想法。'}</h2>
            <p className="expression-prompt-cn">{prompt.mode === 'sentence' ? prompt.instruction : prompt.title}</p>
            {changed ? (
              <div className="expression-choices">
                {choices.map((text, i) => (
                  <button
                    key={i}
                    disabled={selected !== null}
                    className={
                      selected === null
                        ? ''
                        : text === current.text
                        ? 'choice-correct'
                        : i === selected
                        ? 'choice-wrong'
                        : 'choice-muted'
                    }
                    onClick={() => choose(i)}
                  >
                    <span className="choice-index">
                      {selected !== null && text === current.text ? <Check size={16} /> : String.fromCharCode(65 + i)}
                    </span>
                    <p>{text}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="saved-expression-text">{current.text}</div>
            )}
            {(selected !== null || !changed) && (
              <div className="expression-explanation">
                <span className="eyebrow">KEEP THIS IN MIND</span>
                {changed && (
                  <p>
                    {selected !== null && choices[selected] === current.text
                      ? '是的，这样更自然。'
                      : '一起看看修改后的表达。'}{' '}
                    {checkedOriginal?.issues.map((issue) => issue.explanation).join(' ')}
                  </p>
                )}
                <div className="expression-word-chips">
                  {prompt.targets
                    .map((id) => wordById[id])
                    .filter(Boolean)
                    .map((w) => (
                      <button key={w.id} onClick={() => openWord(w)}>
                        {w.word}
                        <small>{w.meaning}</small>
                      </button>
                    ))}
                </div>
                <Button className="full-width" onClick={next}>
                  {index === records.length - 1 ? '完成这次回顾' : '下一张表达卡'}
                  <ArrowRight size={16} />
                </Button>
              </div>
            )}
            {selected === null && changed && (
              <button className="unknown-button" onClick={() => setSelected(-1)}>
                直接看看修改
                <ArrowRight size={15} />
              </button>
            )}
          </section>
        )
      )}
      {opened && (
        <Modal
          title={prompts.find((p) => p.id === opened.promptId)?.title || '我的表达'}
          onClose={() => setOpened(null)}
        >
          {opened.original !== opened.text && (
            <div className="history-original">
              <span className="eyebrow">修改前</span>
              <p>{opened.original}</p>
            </div>
          )}
          <div className="history-final">
            <span className="eyebrow">保存的表达</span>
            <p>{opened.text}</p>
          </div>
          <Button className="full-width" onClick={() => setOpened(null)}>
            回到写作记录
          </Button>
        </Modal>
      )}
    </div>
  )
}
