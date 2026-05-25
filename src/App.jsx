import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Home,
  Image as ImageIcon,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  X
} from 'lucide-react'

const STORAGE_KEY = 'moodflow_records_v1'

const EMOTIONS = [
  { emotion: '喜', emoji: '😊', color: '#5fbd8f', soft: '#e3f6ec' },
  { emotion: '怒', emoji: '😠', color: '#ee6b6e', soft: '#ffe5e7' },
  { emotion: '哀', emoji: '😢', color: '#6aa7e8', soft: '#e4f0ff' },
  { emotion: '懼', emoji: '😨', color: '#9b7de3', soft: '#eee8ff' },
  { emotion: '驚訝', emoji: '😲', color: '#f2c94c', soft: '#fff6cf' },
  { emotion: '厭惡', emoji: '🤢', color: '#819c79', soft: '#eaf0e5' }
]

const HEALING_LINES = [
  '今天已經很努力，慢慢來也很好。',
  '情緒像天氣，會來，也會走。',
  '願你給自己一點溫柔的位置。',
  '記下來，就是照顧自己的開始。',
  '不必完美，只要誠實地感受。'
]

function getTodayString() {
  return new Date().toISOString().slice(0, 10)
}

function formatMonth(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function getFirstWeekday(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function getStats(records, monthDate) {
  const key = getMonthKey(monthDate)
  const monthly = records.filter((r) => r.date?.startsWith(key))
  const counts = EMOTIONS.map((e) => ({
    ...e,
    count: monthly.filter((r) => r.emotion === e.emotion).length
  }))
  const max = counts.reduce((a, b) => (b.count > a.count ? b : a), counts[0])
  return {
    monthly,
    total: monthly.length,
    counts,
    top: max?.count > 0 ? max : null
  }
}

function BottomNav({ active, setActive }) {
  const items = [
    { id: 'today', label: '今日', icon: Home },
    { id: 'calendar', label: '月曆', icon: CalendarDays },
    { id: 'stats', label: '統計', icon: BarChart3 }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="rounded-[2rem] border border-white/70 bg-white/82 p-2 shadow-soft backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-2">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`flex h-14 flex-col items-center justify-center rounded-[1.45rem] text-xs font-semibold transition ${
                    isActive ? 'bg-[#34303d] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="mt-1">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="mb-5 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-rose-400">MoodFlow</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">每天記下自己的情緒。</h1>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/80 text-xl shadow-soft">🌿</div>
      </div>
    </header>
  )
}

function MoodWheel({ selected, setSelected }) {
  const startX = useRef(null)

  const move = (dir) => {
    setSelected((prev) => (prev + dir + EMOTIONS.length) % EMOTIONS.length)
  }

  return (
    <div
      className="relative mx-auto mt-4 h-72 w-full max-w-[350px] select-none overflow-hidden rounded-[2.2rem] bg-white/70 shadow-soft"
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX.current === null) return
        const dx = e.changedTouches[0].clientX - startX.current
        if (Math.abs(dx) > 35) move(dx > 0 ? -1 : 1)
        startX.current = null
      }}
      onMouseDown={(e) => (startX.current = e.clientX)}
      onMouseUp={(e) => {
        if (startX.current === null) return
        const dx = e.clientX - startX.current
        if (Math.abs(dx) > 35) move(dx > 0 ? -1 : 1)
        startX.current = null
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-8 text-center text-sm font-semibold text-slate-400">
        左右拖動切換情緒
      </div>
      <div className="absolute bottom-[-80px] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full border border-white bg-gradient-to-br from-white to-rose-50" />
      {EMOTIONS.map((item, index) => {
        const offset = index - selected
        const angle = offset * 34
        const rad = (angle - 90) * (Math.PI / 180)
        const radius = 118
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius + 164
        const active = index === selected
        return (
          <motion.button
            key={item.emotion}
            type="button"
            onClick={() => setSelected(index)}
            animate={{
              x,
              y,
              scale: active ? 1.35 : 0.82,
              opacity: Math.abs(offset) > 3 ? 0 : active ? 1 : 0.54,
              zIndex: active ? 10 : 1
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="absolute left-1/2 top-0 -ml-10 grid h-20 w-20 place-items-center rounded-full border border-white/80 shadow-lg"
            style={{ backgroundColor: active ? item.soft : 'rgba(255,255,255,0.88)' }}
            aria-label={item.emotion}
          >
            <span className="text-4xl">{item.emoji}</span>
          </motion.button>
        )
      })}

      <div className="absolute bottom-7 left-0 right-0 text-center">
        <div className="text-5xl">{EMOTIONS[selected].emoji}</div>
        <div className="mt-2 text-2xl font-black text-slate-800">{EMOTIONS[selected].emotion}</div>
      </div>

      <button
        onClick={() => move(-1)}
        className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 shadow"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => move(1)}
        className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 shadow"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

function RecordSheet({ open, onClose, date, records, onSave, onDelete }) {
  const existing = records.find((r) => r.date === date)
  const [selected, setSelected] = useState(0)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    const found = existing ? EMOTIONS.findIndex((e) => e.emotion === existing.emotion) : 0
    setSelected(found >= 0 ? found : 0)
    setNote(existing?.note || '')
  }, [open, date, existing?.id])

  if (!open) return null

  const chosen = EMOTIONS[selected]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/28 px-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button className="absolute inset-0 h-full w-full" onClick={onClose} aria-label="關閉" />
        <motion.div
          className="safe-bottom relative mb-3 w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl"
          initial={{ y: 380 }}
          animate={{ y: 0 }}
          exit={{ y: 380 }}
          transition={{ type: 'spring', stiffness: 270, damping: 28 }}
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-800">想記下什麼？</h2>
              <p className="mt-1 text-sm text-slate-500">{date}</p>
            </div>
            <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">
              <X size={18} />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {EMOTIONS.map((e, i) => (
              <button
                key={e.emotion}
                onClick={() => setSelected(i)}
                className={`rounded-2xl border p-3 text-center transition ${
                  selected === i ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-2xl">{e.emoji}</div>
                <div className="mt-1 text-sm font-bold">{e.emotion}</div>
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="今天發生了什麼？可以留空。"
            className="h-32 w-full resize-none rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4 text-base outline-none focus:border-rose-200 focus:bg-white"
          />

          {existing && (
            <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
              建立：{new Date(existing.createdAt).toLocaleString('zh-HK')}<br />
              更新：{new Date(existing.updatedAt).toLocaleString('zh-HK')}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            {existing && (
              <button
                onClick={() => {
                  onDelete(date)
                  onClose()
                }}
                className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500"
                aria-label="刪除紀錄"
              >
                <Trash2 size={22} />
              </button>
            )}
            <button
              onClick={() => {
                onSave(date, chosen, note)
                onClose()
              }}
              className="h-14 flex-1 rounded-2xl bg-slate-900 font-black text-white shadow-lg"
            >
              完成
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function TodayPage({ records, onSave }) {
  const [selected, setSelected] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)
  const today = getTodayString()
  const existing = records.find((r) => r.date === today)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header />
      <section className="rounded-[2rem] bg-white/70 p-5 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
          <Sparkles size={18} /> 今日情緒
        </div>
        <MoodWheel selected={selected} setSelected={setSelected} />
        <button
          onClick={() => setSheetOpen(true)}
          className="mt-5 h-14 w-full rounded-2xl bg-slate-900 text-lg font-black text-white shadow-lg"
        >
          確認記錄
        </button>
        {existing && (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600">
            今日已記錄：<span className="font-black">{existing.emoji} {existing.emotion}</span>
            {existing.note ? <p className="mt-2 leading-relaxed">{existing.note}</p> : <p className="mt-2 text-slate-400">沒有文字備註</p>}
          </div>
        )}
      </section>
      <RecordSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        date={today}
        records={records}
        onSave={onSave}
        onDelete={() => {}}
      />
    </motion.div>
  )
}

function MonthControls({ monthDate, setMonthDate }) {
  const changeMonth = (delta) => {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }
  return (
    <div className="mb-4 flex items-center justify-between">
      <button onClick={() => changeMonth(-1)} className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow">
        <ChevronLeft size={20} />
      </button>
      <div className="text-lg font-black text-slate-800">{formatMonth(monthDate)}</div>
      <button onClick={() => changeMonth(1)} className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

function CalendarGrid({ monthDate, recordsByDate, onPickDate }) {
  const days = getDaysInMonth(monthDate)
  const first = getFirstWeekday(monthDate)
  const today = getTodayString()
  const cells = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)

  return (
    <div className="rounded-[2rem] bg-white/75 p-4 shadow-soft">
      <div className="mb-3 grid grid-cols-7 text-center text-xs font-black text-slate-400">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />
          const date = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const rec = recordsByDate[date]
          const isToday = date === today
          return (
            <button
              key={date}
              onClick={() => onPickDate(date)}
              className={`calendar-cell relative rounded-2xl p-1 text-center transition active:scale-95 ${
                isToday ? 'ring-2 ring-slate-900 ring-offset-2' : ''
              }`}
              style={{ backgroundColor: rec ? rec.color : '#f1f3f5' }}
            >
              <div className={`text-sm font-black ${rec ? 'text-white' : 'text-slate-400'}`}>{d}</div>
              <div className="mt-1 text-xl">{rec?.emoji || ''}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function IGStoryCanvas({ monthDate, records, storyRef }) {
  const stats = getStats(records, monthDate)
  const recordsByDate = Object.fromEntries(stats.monthly.map((r) => [r.date, r]))
  const days = getDaysInMonth(monthDate)
  const first = getFirstWeekday(monthDate)
  const cells = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  const line = HEALING_LINES[monthDate.getMonth() % HEALING_LINES.length]

  return (
    <div
      ref={storyRef}
      className="pointer-events-none fixed left-[-9999px] top-0 h-[1920px] w-[1080px] bg-[#fff7fb] p-20 text-slate-800"
    >
      <div className="h-full rounded-[70px] bg-gradient-to-br from-[#fff7fb] via-[#f5fbff] to-[#fff6df] p-16 shadow-2xl">
        <div className="text-center">
          <div className="text-72 font-black">MoodFlow</div>
          <div className="mt-4 text-42 font-bold text-slate-500">{formatMonth(monthDate)}</div>
        </div>
        <div className="mt-16 rounded-[48px] bg-white/80 p-10">
          <div className="mb-8 grid grid-cols-7 text-center text-28 font-black text-slate-400">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-4">
            {cells.map((d, i) => {
              if (!d) return <div key={`s-empty-${i}`} className="h-24" />
              const date = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
              const rec = recordsByDate[date]
              return (
                <div
                  key={date}
                  className="grid h-24 place-items-center rounded-[28px] text-32 font-black"
                  style={{ backgroundColor: rec ? rec.color : '#edf0f2', color: rec ? '#ffffff' : '#a8adb5' }}
                >
                  <div>
                    <div>{d}</div>
                    <div className="text-28">{rec?.emoji || ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-8">
          <div className="rounded-[42px] bg-white/85 p-10">
            <div className="text-30 font-bold text-slate-400">本月總記錄</div>
            <div className="mt-4 text-72 font-black">{stats.total}日</div>
          </div>
          <div className="rounded-[42px] bg-white/85 p-10">
            <div className="text-30 font-bold text-slate-400">最多情緒</div>
            <div className="mt-4 text-72 font-black">{stats.top ? `${stats.top.emoji} ${stats.top.emotion}` : '—'}</div>
          </div>
        </div>
        <div className="mt-16 rounded-[42px] bg-slate-900 p-12 text-center text-44 font-black leading-tight text-white">
          {line}
        </div>
      </div>
    </div>
  )
}

function CalendarPage({ records, monthDate, setMonthDate, onSave, onDelete }) {
  const [pickedDate, setPickedDate] = useState(null)
  const [busy, setBusy] = useState(false)
  const storyRef = useRef(null)
  const monthStats = getStats(records, monthDate)
  const recordsByDate = Object.fromEntries(records.map((r) => [r.date, r]))

  async function generateStory() {
    if (!storyRef.current || busy) return
    setBusy(true)
    try {
      const canvas = await html2canvas(storyRef.current, {
        width: 1080,
        height: 1920,
        scale: 1,
        backgroundColor: '#fff7fb',
        useCORS: true
      })
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('未能生成圖片')
      const file = new File([blob], `MoodFlow-${getMonthKey(monthDate)}.png`, { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'MoodFlow 月曆',
          text: '我的本月心情月曆',
          files: [file]
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      alert('生成圖片時出現問題，請稍後再試。')
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header />
      <MonthControls monthDate={monthDate} setMonthDate={setMonthDate} />
      <CalendarGrid monthDate={monthDate} recordsByDate={recordsByDate} onPickDate={setPickedDate} />

      <button
        onClick={generateStory}
        disabled={busy}
        className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-400 to-amber-300 text-lg font-black text-white shadow-lg disabled:opacity-60"
      >
        {busy ? <Download size={20} /> : <ImageIcon size={20} />}
        {busy ? '正在生成...' : '生成 IG Story 圖'}
      </button>

      <div className="mt-4 rounded-[2rem] bg-white/70 p-5 shadow-soft">
        <div className="text-sm font-bold text-slate-400">本月摘要</div>
        <div className="mt-2 text-2xl font-black text-slate-800">{monthStats.total} 日有紀錄</div>
        <p className="mt-1 text-sm text-slate-500">
          最多出現：{monthStats.top ? `${monthStats.top.emoji} ${monthStats.top.emotion}` : '暫未有資料'}
        </p>
      </div>

      <IGStoryCanvas monthDate={monthDate} records={records} storyRef={storyRef} />

      <RecordSheet
        open={Boolean(pickedDate)}
        onClose={() => setPickedDate(null)}
        date={pickedDate}
        records={records}
        onSave={onSave}
        onDelete={onDelete}
      />
    </motion.div>
  )
}

function StatsPage({ records, monthDate, setMonthDate }) {
  const stats = getStats(records, monthDate)
  const maxCount = Math.max(1, ...stats.counts.map((c) => c.count))
  const sortedDays = [...stats.monthly].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header />
      <MonthControls monthDate={monthDate} setMonthDate={setMonthDate} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[2rem] bg-white/75 p-5 shadow-soft">
          <div className="text-sm font-bold text-slate-400">本月總記錄</div>
          <div className="mt-2 text-4xl font-black">{stats.total}</div>
          <div className="text-sm text-slate-500">日</div>
        </div>
        <div className="rounded-[2rem] bg-white/75 p-5 shadow-soft">
          <div className="text-sm font-bold text-slate-400">最常出現</div>
          <div className="mt-2 text-3xl font-black">{stats.top ? stats.top.emoji : '—'}</div>
          <div className="text-sm font-bold text-slate-600">{stats.top ? stats.top.emotion : '暫無資料'}</div>
        </div>
      </div>

      <section className="mt-4 rounded-[2rem] bg-white/75 p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-black text-slate-800">本月情緒分佈</h2>
        <div className="space-y-4">
          {stats.counts.map((item) => {
            const percent = stats.total ? Math.round((item.count / stats.total) * 100) : 0
            return (
              <div key={item.emotion}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-black">{item.emoji} {item.emotion}</span>
                  <span className="text-slate-500">{item.count}次 · {percent}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white/75 p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-black text-slate-800">簡單情緒趨勢</h2>
        {sortedDays.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">本月暫未有紀錄</div>
        ) : (
          <div className="space-y-2">
            {sortedDays.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl text-2xl" style={{ backgroundColor: r.color }}>
                  {r.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-black text-slate-700">{r.date}</div>
                  <div className="truncate text-sm text-slate-500">{r.note || '沒有文字備註'}</div>
                </div>
                <div className="text-sm font-bold text-slate-500">{r.emotion}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}

export default function App() {
  const [active, setActive] = useState('today')
  const [records, setRecords] = useState([])
  const [monthDate, setMonthDate] = useState(new Date())

  useEffect(() => {
    setRecords(loadRecords())
  }, [])

  function upsertRecord(date, emotionData, note) {
    setRecords((prev) => {
      const existing = prev.find((r) => r.date === date)
      const now = new Date().toISOString()
      const next = existing
        ? prev.map((r) =>
            r.date === date
              ? {
                  ...r,
                  emotion: emotionData.emotion,
                  emoji: emotionData.emoji,
                  color: emotionData.color,
                  note,
                  updatedAt: now
                }
              : r
          )
        : [
            ...prev,
            {
              id: uid(),
              date,
              emotion: emotionData.emotion,
              emoji: emotionData.emoji,
              color: emotionData.color,
              note,
              createdAt: now,
              updatedAt: now
            }
          ]
      saveRecords(next)
      return next
    })
  }

  function deleteRecord(date) {
    if (!window.confirm('確定刪除這日紀錄？')) return
    setRecords((prev) => {
      const next = prev.filter((r) => r.date !== date)
      saveRecords(next)
      return next
    })
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-32 pt-2">
      <AnimatePresence mode="wait">
        <div key={active}>
          {active === 'today' && <TodayPage records={records} onSave={upsertRecord} />}
          {active === 'calendar' && (
            <CalendarPage
              records={records}
              monthDate={monthDate}
              setMonthDate={setMonthDate}
              onSave={upsertRecord}
              onDelete={deleteRecord}
            />
          )}
          {active === 'stats' && <StatsPage records={records} monthDate={monthDate} setMonthDate={setMonthDate} />}
        </div>
      </AnimatePresence>
      <BottomNav active={active} setActive={setActive} />
    </div>
  )
}
