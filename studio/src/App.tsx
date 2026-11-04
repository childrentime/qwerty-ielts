import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronRight,
  Cloud,
  CloudOff,
  Command,
  HelpCircle,
  Home,
  Keyboard,
  Leaf,
  Monitor,
  PenTool,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Volume2,
  WifiOff,
  X,
} from 'lucide-react'
import { words, Word, prompts, modeLabels } from './data'
import { navigate, Route, useRoute, useStore } from './model'
import { Brand, Button, IconButton, Modal, speak, Tag } from './ui'
import { Today, Practice, Review, Library, Preferences } from './Views'
import { Writing } from './Writing'

const nav: { id: Route; label: string; en: string; icon: typeof Home }[] = [
  { id: 'today', label: '今日', en: 'Overview', icon: Home },
  { id: 'practice', label: '练词', en: 'Practice', icon: Keyboard },
  { id: 'review', label: '复习', en: 'Review', icon: BookOpen },
  { id: 'writing', label: '写作', en: 'Writing', icon: PenTool },
  { id: 'library', label: '词库', en: 'Vocabulary', icon: Bookmark },
]
export type ViewProps = {
  store: ReturnType<typeof useStore>
  mobile: boolean
  toast: (message: string) => void
  openWord: (word: Word) => void
  startWriting: (promptId?: string) => void
}

export default function App() {
  const route = useRoute()
  const [message, setMessage] = useState(''),
    timer = useRef<ReturnType<typeof setTimeout>>()
  const toast = useCallback((text: string) => {
    setMessage(text)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), 4200)
  }, [])
  const store = useStore(toast)
  const [preview, setPreview] = useState(new URLSearchParams(window.location.search).get('view') === 'phone')
  const [narrow, setNarrow] = useState(window.matchMedia('(max-width: 760px)').matches)
  const mobile = narrow || preview
  const [modal, setModal] = useState<'search' | 'sync' | 'help' | 'welcome' | null>(null)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [search, setSearch] = useState('')
  const [promptId, setPromptId] = useState(prompts[0].id)
  const [online, setOnline] = useState(navigator.onLine)
  const mainRef = useRef<HTMLElement>(null)
  const startWriting = (id?: string) => {
    if (id) setPromptId(id)
    setSelectedWord(null)
    navigate('writing')
  }
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)'),
      handler = () => setNarrow(media.matches)
    media.addEventListener('change', handler)
    const onNetwork = () => setOnline(navigator.onLine)
    window.addEventListener('online', onNetwork)
    window.addEventListener('offline', onNetwork)
    return () => {
      media.removeEventListener('change', handler)
      window.removeEventListener('online', onNetwork)
      window.removeEventListener('offline', onNetwork)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
    document.title = `${nav.find((n) => n.id === route)?.label || '设置'} · Wordloom`
  }, [route, mobile])
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      document.documentElement.dataset.theme =
        store.state.settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : store.state.settings.theme
    }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [store.state.settings.theme])
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setModal('search')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  const props: ViewProps = { store, mobile, toast, openWord: setSelectedWord, startWriting }
  const today = new Date()
    .toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: '2-digit' })
    .toUpperCase()
  return (
    <div className={preview && !narrow ? 'device-stage' : ''}>
      {preview && !narrow && (
        <div className="preview-controls">
          <span>
            <Smartphone size={17} /> iPhone 交互预览
          </span>
          <Button variant="secondary" onClick={() => setPreview(false)}>
            <Monitor size={16} />
            返回电脑端
          </Button>
        </div>
      )}
      <div className={`app-shell ${mobile ? 'mobile' : ''} ${preview && !narrow ? 'phone-frame' : ''}`}>
        <a
          className="skip-link"
          href="#main-content"
          onClick={(event) => {
            event.preventDefault()
            mainRef.current?.focus()
          }}
        >
          跳到主要内容
        </a>
        {!mobile && (
          <aside className="sidebar">
            <button type="button" className="brand-button" onClick={() => navigate('today')} aria-label="Wordloom 首页">
              <Brand />
            </button>
            <div className="workspace-label">
              <span className="workspace-icon">
                <Leaf size={16} />
              </span>
              <span>
                我的学习空间<small>IELTS JOURNEY</small>
              </span>
              <ChevronRight size={14} />
            </div>
            <span className="nav-section-label">学习</span>
            <nav aria-label="主要导航">
              {nav.map(({ id, label, en, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`nav-item ${route === id ? 'active' : ''}`}
                  onClick={() => navigate(id)}
                  aria-current={route === id ? 'page' : undefined}
                >
                  <Icon size={19} strokeWidth={1.7} />
                  <span>{label}</span>
                  {id === 'review' && Object.keys(store.state.seen).length > 0 ? (
                    <span className="nav-count">{Object.keys(store.state.seen).length}</span>
                  ) : (
                    <span className="nav-en">{en}</span>
                  )}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-note">
                <span className="serif">A little, every day.</span>
                <p>
                  让每一次遇见，
                  <br />
                  都变成自己的表达。
                </p>
                <span className="note-line" />
              </div>
              <button
                className={`nav-item ${route === 'settings' ? 'active' : ''}`}
                onClick={() => navigate('settings')}
              >
                <Settings size={19} strokeWidth={1.7} />
                <span>设置</span>
              </button>
              <button className="local-account" onClick={() => setModal('sync')}>
                <span className="avatar">W</span>
                <span>
                  我的 Wordloom
                  <small>
                    <span className="status-dot" /> 本地学习空间
                  </small>
                </span>
                <ChevronRight size={15} />
              </button>
            </div>
          </aside>
        )}
        <div className="app-main">
          <header className="topbar">
            {mobile ? (
              <button className="brand-button" onClick={() => navigate('today')} aria-label="Wordloom 首页">
                <Brand small />
              </button>
            ) : (
              <div className="breadcrumbs">
                我的空间
                <ChevronRight size={13} />
                <span>{nav.find((n) => n.id === route)?.label || '设置'}</span>
              </div>
            )}
            <div className="topbar-actions">
              {!mobile && (
                <>
                  <button className="search-trigger" onClick={() => setModal('search')}>
                    <Search size={15} />
                    <span>搜索单词或页面</span>
                    <kbd>⌘ K</kbd>
                  </button>
                  <span className="topbar-divider" />
                  <IconButton label="手机预览" onClick={() => setPreview(true)}>
                    <Smartphone size={19} />
                  </IconButton>
                  <IconButton label="快捷键与帮助" onClick={() => setModal('help')}>
                    <HelpCircle size={19} />
                  </IconButton>
                </>
              )}
              <button aria-label="iCloud 同步状态" className="sync-status" onClick={() => setModal('sync')}>
                <CloudOff size={mobile ? 18 : 15} />
                {!mobile && <span>仅此设备</span>}
              </button>
              {mobile && (
                <IconButton label="设置" onClick={() => navigate('settings')}>
                  <span className="avatar avatar-small">W</span>
                </IconButton>
              )}
            </div>
          </header>
          {!online && (
            <div className="offline-banner">
              <WifiOff size={15} />
              当前离线，学习记录仍会保存在此设备。
            </div>
          )}
          <main ref={mainRef} id="main-content" tabIndex={-1} className={`content content-${route}`}>
            {route === 'today' && <Today {...props} date={today} onWelcome={() => setModal('welcome')} />}
            {route === 'practice' && <Practice {...props} />}
            {route === 'review' && <Review {...props} />}
            {route === 'library' && <Library {...props} />}
            {route === 'writing' && <Writing {...props} initialPrompt={promptId} />}
            {route === 'settings' && <Preferences {...props} openSync={() => setModal('sync')} />}
          </main>
          {mobile && (
            <nav className="bottom-nav" aria-label="手机导航">
              {nav
                .filter((n) => n.id !== 'practice')
                .map(({ id, label, icon: Icon }) => (
                  <button
                    type="button"
                    key={id}
                    className={route === id || (route === 'practice' && id === 'today') ? 'active' : ''}
                    aria-current={route === id ? 'page' : undefined}
                    onClick={() => navigate(id)}
                  >
                    <Icon size={21} strokeWidth={1.7} />
                    <span>{label}</span>
                  </button>
                ))}
            </nav>
          )}
        </div>
        {message && (
          <div className="toast" role="status">
            <Check size={16} />
            <span>{message}</span>
            <button aria-label="关闭提示" onClick={() => setMessage('')}>
              <X size={14} />
            </button>
          </div>
        )}
        {selectedWord && (
          <Modal
            title={selectedWord.word}
            eyebrow={`${selectedWord.topic} / WORD NOTES`}
            onClose={() => setSelectedWord(null)}
          >
            <div className="word-modal-meta">
              <span>{selectedWord.phonetic}</span>
              <IconButton label="朗读单词" onClick={() => speak(selectedWord, store.state.settings, toast)}>
                <Volume2 size={20} />
              </IconButton>
              <IconButton
                label={store.state.saved.includes(selectedWord.id) ? '取消收藏' : '收藏单词'}
                onClick={() => store.toggleSaved(selectedWord.id)}
              >
                <Bookmark size={20} fill={store.state.saved.includes(selectedWord.id) ? 'currentColor' : 'none'} />
              </IconButton>
            </div>
            <p className="word-modal-meaning">
              <span>{selectedWord.pos}</span>
              {selectedWord.meaning}
            </p>
            <div className="phrase-note">
              <span className="eyebrow">把词连起来</span>
              <h3 className="serif">{selectedWord.phrase}</h3>
              <p>{selectedWord.phraseMeaning}</p>
            </div>
            <div className="example-note">
              <span className="eyebrow">放进一个句子</span>
              <p className="english-sentence">{selectedWord.example}</p>
              <p>{selectedWord.translation}</p>
            </div>
            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!store.state.seen[selectedWord.id]) {
                    store.markSeen(selectedWord.id)
                    toast('已加入见过的词，可以开始复习。')
                  } else {
                    navigate('review')
                    setSelectedWord(null)
                  }
                }}
              >
                {store.state.seen[selectedWord.id] ? '去复习' : '加入复习'}
              </Button>
              <Button
                onClick={() =>
                  startWriting(prompts.find((p) => p.mode === 'sentence' && p.topic === selectedWord.topic)?.id)
                }
              >
                用它写一句
                <ArrowRight size={16} />
              </Button>
            </div>
          </Modal>
        )}
        {modal === 'search' && (
          <Modal
            title="找一个词，或换个方向"
            eyebrow="QUICK FIND"
            onClose={() => {
              setModal(null)
              setSearch('')
            }}
          >
            <div className="search-field search-field-large">
              <Search size={20} />
              <input
                aria-label="搜索单词或页面"
                autoFocus
                value={search}
                placeholder="输入英文单词、中文含义…"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="command-results">
              {search.trim()
                ? words
                    .filter((w) => `${w.word} ${w.meaning} ${w.phrase}`.toLowerCase().includes(search.toLowerCase()))
                    .slice(0, 8)
                    .map((w) => (
                      <button
                        className="command-result"
                        key={w.id}
                        onClick={() => {
                          setSelectedWord(w)
                          setModal(null)
                          setSearch('')
                        }}
                      >
                        <span className="serif">{w.word}</span>
                        <span>{w.meaning}</span>
                        <ChevronRight size={15} />
                      </button>
                    ))
                : nav.map((n) => (
                    <button
                      className="command-result"
                      key={n.id}
                      onClick={() => {
                        navigate(n.id)
                        setModal(null)
                      }}
                    >
                      <n.icon size={18} />
                      <span>{n.label}</span>
                      <ChevronRight size={15} />
                    </button>
                  ))}
              {search &&
                words.every(
                  (w) => !`${w.word} ${w.meaning} ${w.phrase}`.toLowerCase().includes(search.toLowerCase()),
                ) && <p className="muted center">暂时没有这个词，试试其他拼写。</p>}
            </div>
          </Modal>
        )}
        {modal === 'sync' && (
          <Modal title="从电脑，到你的口袋" eyebrow="YOUR WORDS, EVERYWHERE" onClose={() => setModal(null)}>
            <div className="devices-art">
              <Monitor size={68} strokeWidth={1} />
              <span className="device-dots">
                ·····
                <Cloud size={30} strokeWidth={1.3} />
                ·····
              </span>
              <Smartphone size={48} strokeWidth={1} />
            </div>
            <p className="modal-description">连接 iCloud 后，电脑上见过的词和写过的表达，就能在 iPhone 上接着复习。</p>
            <div className="connection-state">
              <CloudOff size={20} />
              <div>
                <strong>iCloud 尚未连接</strong>
                <p>此交互版使用本地记录，尚未配置 Apple 授权。当前没有上传或跨设备同步。</p>
              </div>
            </div>
            <div className="sync-benefits">
              <span>
                <Check size={15} />
                已见单词与收藏
              </span>
              <span>
                <Check size={15} />
                写作草稿与修改记录
              </span>
              <span>
                <Check size={15} />
                复习进度
              </span>
            </div>
            <Button
              className="full-width"
              onClick={() => {
                setModal(null)
                navigate('settings')
              }}
            >
              管理此设备的学习记录
              <ArrowRight size={16} />
            </Button>
            <p className="caption center">现在可以通过导出、导入记录，在另一台设备继续体验。</p>
          </Modal>
        )}
        {modal === 'help' && (
          <Modal title="给专注留一点捷径" eyebrow="A FEW SHORTCUTS" onClose={() => setModal(null)}>
            <div className="shortcut-row">
              <span>搜索单词与页面</span>
              <kbd>⌘ / Ctrl + K</kbd>
            </div>
            <div className="shortcut-row">
              <span>练词完成后继续</span>
              <kbd>Enter</kbd>
            </div>
            <div className="shortcut-row">
              <span>复习时选择选项</span>
              <kbd>1 — 4</kbd>
            </div>
            <div className="shortcut-row">
              <span>关闭弹窗</span>
              <kbd>Esc</kbd>
            </div>
            <div className="phrase-note">
              <h3>从认识，到表达</h3>
              <p>电脑练词时，显示过的词会进入复习列表。写完句子后保存练习，再到手机视图回顾你的表达。</p>
            </div>
            <Button className="full-width" onClick={() => setModal(null)}>
              知道了
            </Button>
          </Modal>
        )}
        {modal === 'welcome' && (
          <Modal title="给进步一个小小的方向" eyebrow="MAKE IT YOURS" onClose={() => setModal(null)}>
            <div className="welcome-leaf">
              <Leaf size={36} strokeWidth={1.2} />
            </div>
            <p className="modal-description">每天认识一点，复习一点，再写出一点。先为自己设定一个轻松开始的目标。</p>
            <label className="form-label">
              目标写作分数
              <select
                value={store.state.settings.target}
                onChange={(e) => store.setState((p) => ({ ...p, settings: { ...p.settings, target: e.target.value } }))}
              >
                {['6.0', '6.5', '7.0', '7.5', '8.0'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="form-label">
              每天想见到多少个词
              <select
                value={store.state.settings.goal}
                onChange={(e) =>
                  store.setState((p) => ({ ...p, settings: { ...p.settings, goal: Number(e.target.value) } }))
                }
              >
                {[10, 20, 30, 50].map((x) => (
                  <option key={x} value={x}>
                    {x} 个词
                  </option>
                ))}
              </select>
            </label>
            <Button
              className="full-width"
              onClick={() => {
                store.setState((p) => ({ ...p, onboarded: true }))
                setModal(null)
                navigate('practice')
              }}
            >
              开始我的第一组
              <ArrowRight size={16} />
            </Button>
          </Modal>
        )}
      </div>
    </div>
  )
}
