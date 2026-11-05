import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Moon, Sun, Smartphone, Monitor, Maximize2 } from 'lucide-react'
import colors from './colors.json'
import { Button, Modal } from './ui'
import { navigate } from './model'

export function DesignBoard() {
  const [copied, setCopied] = useState('')
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
    } catch {
      setCopied('')
    }
  }
  return (
    <div className="page design-page">
      <span className="eyebrow">WORDLOOM · DESIGN SYSTEM</span>
      <div className="design-heading">
        <div>
          <h1>设计系统</h1>
          <p>系统字体、语义颜色与原生控件。网页和 App 使用统一的视觉语言。</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('app')}>
          <Smartphone size={17} />
          查看 App 原型
        </Button>
      </div>
      <div className="palette-intro">
        <span>
          <strong>{colors.length}</strong> 组深浅配对色
        </span>
        <span>点击色值复制</span>
        <span>取自实际界面使用的色彩源文件</span>
      </div>
      <div className="palette-comparison">
        {(['light', 'dark'] as const).map((mode) => (
          <section data-theme={mode} className="palette-sample" key={mode}>
            <div className="palette-mode">
              {mode === 'light' ? <Sun size={17} /> : <Moon size={17} />} {mode === 'light' ? '浅色' : '深色'}
            </div>
            <span className="eyebrow">WORDLOOM</span>
            <h2 className="serif">继续复习</h2>
            <p>12 个见过的词，接着上次继续。</p>
            <div className="sample-actions">
              <button>
                开始复习 <ArrowRight size={15} />
              </button>
              <span className="sample-correct">
                <Check size={14} />
                记住了
              </span>
              <span className="sample-error">再想想</span>
            </div>
          </section>
        ))}
      </div>
      {Array.from(new Set(colors.map((c) => c.group))).map((group) => (
        <section className="palette-section" key={group}>
          <div className="palette-section-title">
            <h2>{group}</h2>
            <span>LIGHT / DARK</span>
          </div>
          <div className="swatch-grid">
            {colors
              .filter((c) => c.group === group)
              .map((c) => (
                <article className="swatch" key={c.name}>
                  <div className="swatch-colors">
                    {(['light', 'dark'] as const).map((mode) => (
                      <button key={mode} aria-label={`复制 ${c.name} ${mode} ${c[mode]}`} onClick={() => copy(c[mode])}>
                        <span>
                          <i style={{ background: c[mode] }} />
                        </span>
                        <code>{copied === c[mode] ? '已复制 ✓' : c[mode].toUpperCase()}</code>
                        <small>{mode === 'light' ? '浅色' : '深色'}</small>
                      </button>
                    ))}
                  </div>
                  <strong>{c.label}</strong>
                  <code>--{c.name}</code>
                </article>
              ))}
          </div>
        </section>
      ))}
      <p className="caption">
        所有界面颜色集中在 colors.json；主题样式由它生成，画板直接读取同一份数据。透明色在棋盘背景上显示。
      </p>
    </div>
  )
}
const screens = [
  ['today', '今日', '电脑学过的词，在口袋里继续。'],
  ['review', '释义复习', '选择、揭晓、回听，完整走完一组复习。'],
  ['answer', '答案反馈', '显示每个选项的释义，保留上下文例句。'],
  ['complete', '复习完成', '查看本轮结果，重新练习或回到今日。'],
  ['writing', '表达与写作', '句子、Task 1、Task 2，手机轻触回顾表达。'],
  ['essay', '写作回顾', '保留电脑上的原文、修改建议和可复用表达。'],
  ['library', '词集', '浏览、收藏、朗读和查看单词详情。'],
  ['settings', '设置', '主题、口音、学习目标和 iCloud 连接入口。'],
  ['sync', '同步状态', '未连接时说明下一步，不显示虚构的同步成功。'],
] as const
export function AppPrototype() {
  const [index, setIndex] = useState(0),
    [mode, setMode] = useState<'light' | 'dark'>('light'),
    [zoom, setZoom] = useState(false)
  const current = screens[index]
  const picture = (
    <img
      className="native-screenshot"
      src={`/native/${current[0]}-${mode}.webp`}
      alt={`${current[1]}，${mode === 'light' ? '浅色' : '深色'}模式的原生 App 截图`}
    />
  )
  return (
    <div className="page prototype-page">
      <div className="prototype-heading">
        <div>
          <h1>iPhone 原型</h1>
          <p>9 个页面 · SwiftUI 原生交互</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('design')}>
          设计系统
          <ArrowRight size={15} />
        </Button>
      </div>
      <div className="prototype-workspace">
        <aside className="prototype-nav">
          {screens.map((s, i) => (
            <button
              key={s[0]}
              aria-current={i === index ? 'page' : undefined}
              className={i === index ? 'active' : ''}
              onClick={() => setIndex(i)}
            >
              {s[1]}
              <ChevronMark />
            </button>
          ))}
          <div className="prototype-notes">
            <strong>可在模拟器操作</strong>
            <p>复习、收藏、表达回顾与设置已实现。iCloud 同步待配置。</p>
            <a href="/?view=phone#/review" target="_blank" rel="noreferrer">
              手机网页
              <ArrowRight size={13} />
            </a>
          </div>
        </aside>
        <section className="prototype-stage">
          <div className="prototype-toolbar">
            <div className="segmented">
              {(['light', 'dark'] as const).map((m) => (
                <button
                  key={m}
                  aria-pressed={mode === m}
                  className={mode === m ? 'active' : ''}
                  onClick={() => setMode(m)}
                >
                  {m === 'light' ? <Sun size={14} /> : <Moon size={14} />} {m === 'light' ? '浅色' : '深色'}
                </button>
              ))}
            </div>
            <button className="prototype-zoom-button" onClick={() => setZoom(true)}>
              <Maximize2 size={15} />
              放大
            </button>
          </div>
          <button className="prototype-picture" aria-label="放大当前 App 页面" onClick={() => setZoom(true)}>
            {picture}
          </button>
          <div className="prototype-caption">
            <button aria-label="上一屏" onClick={() => setIndex((index + screens.length - 1) % screens.length)}>
              <ArrowLeft size={17} />
            </button>
            <div>
              <strong>{current[1]}</strong>
              <span>
                {index + 1} / {screens.length}
              </span>
            </div>
            <button aria-label="下一屏" onClick={() => setIndex((index + 1) % screens.length)}>
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </div>
      {zoom && (
        <Modal title={current[1]} eyebrow={mode === 'light' ? '浅色' : '深色'} onClose={() => setZoom(false)} wide>
          <div className="prototype-zoom">{picture}</div>
        </Modal>
      )}
    </div>
  )
}
function ChevronMark() {
  return <ArrowRight size={14} />
}
