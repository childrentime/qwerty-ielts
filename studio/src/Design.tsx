import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Moon, Sun, Smartphone, Monitor } from 'lucide-react'
import colors from './colors.json'
import { Button } from './ui'
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
      <span className="eyebrow">WORDLOOM / DESIGN SYSTEM 02</span>
      <div className="design-heading">
        <div>
          <h1>纸、墨，与一点绿。</h1>
          <p>同一套语义色，两种光线。网页与原生 App 共用视觉语言。</p>
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
              {mode === 'light' ? <Sun size={17} /> : <Moon size={17} />}{' '}
              {mode === 'light' ? '晨间 · Light' : '夜读 · Dark'}
            </div>
            <span className="eyebrow">A LITTLE, EVERY DAY.</span>
            <h2 className="serif">Make it your own.</h2>
            <p>从遇见单词，到写出自己的句子。</p>
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
  ['settings', '我的与外观', '主题、口音、学习目标和 iCloud 连接入口。'],
  ['sync', '同步状态', '未连接时说明下一步，不显示虚构的同步成功。'],
] as const
export function AppPrototype() {
  const [index, setIndex] = useState(0),
    [mode, setMode] = useState<'light' | 'dark'>('light')
  const current = screens[index]
  return (
    <div className="page design-page">
      <span className="eyebrow">WORDLOOM FOR IPHONE / SWIFTUI</span>
      <div className="design-heading">
        <div>
          <h1>学习，随身继续。</h1>
          <p>独立编写的原生 iOS 原型。下面展示真实模拟器画面。</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('design')}>
          查看色彩画板 <ArrowRight size={16} />
        </Button>
      </div>
      <div className="native-showcase">
        <aside>
          <span className="eyebrow">APP SCREEN FLOW</span>
          {screens.map((s, i) => (
            <button className={i === index ? 'active' : ''} key={s[0]} onClick={() => setIndex(i)}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {s[1]}
              <ArrowRight size={15} />
            </button>
          ))}
          <div className="native-boundary">
            <strong>可运行的原生交互</strong>
            <p>底部导航、选择题、收藏、表达卡片、写作详情和外观切换已实现。云同步与在线批改等待账号配置。</p>
          </div>
        </aside>
        <div className="native-preview">
          <div className="native-toolbar">
            <div className="segmented">
              <button className={mode === 'light' ? 'active' : ''} onClick={() => setMode('light')}>
                <Sun size={14} />
                浅色
              </button>
              <button className={mode === 'dark' ? 'active' : ''} onClick={() => setMode('dark')}>
                <Moon size={14} />
                深色
              </button>
            </div>
            <span>iPhone · iOS Simulator</span>
          </div>
          <img
            className="native-screenshot"
            src={`/native/${current[0]}-${mode}.webp`}
            alt={`${current[1]}，${mode === 'light' ? '浅色' : '深色'}模式的原生 App 截图`}
          />
          <div className="native-pagination">
            <button aria-label="上一屏" onClick={() => setIndex((index + screens.length - 1) % screens.length)}>
              <ArrowLeft size={18} />
            </button>
            <span>
              {current[1]} · {index + 1}/{screens.length}
            </span>
            <button aria-label="下一屏" onClick={() => setIndex((index + 1) % screens.length)}>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="native-description">
          <span className="eyebrow">{current[0].toUpperCase()}</span>
          <h2>{current[1]}</h2>
          <p>{current[2]}</p>
          <hr />
          <p>电脑端负责输入和创作；手机端用来回顾见过的词，以及自己写过的表达。</p>
          <a href="/?view=phone#/review" target="_blank" rel="noreferrer">
            <Smartphone size={16} /> 打开手机交互网页 <ArrowRight size={14} />
          </a>
          <button onClick={() => navigate('today')}>
            <Monitor size={16} />
            返回电脑学习空间
          </button>
        </div>
      </div>
    </div>
  )
}
