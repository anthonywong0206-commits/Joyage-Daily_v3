import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  Home,
  Image as ImageIcon,
  Menu,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  X
} from 'lucide-react'

const STORAGE_KEY = 'moodflow_records_v1'

const EMOTIONS = [
  { emotion: '喜', subtitle: '開心・愉快・滿足', emoji: '😊', color: '#63D982', soft: '#E7F9EC', ring: '#B8F1C6' },
  { emotion: '怒', subtitle: '生氣・煩躁・不滿', emoji: '😠', color: '#FF7F7A', soft: '#FFE8E7', ring: '#FFC6C3' },
  { emotion: '哀', subtitle: '難過・失落・疲累', emoji: '😢', color: '#6DAEFF', soft: '#E8F2FF', ring: '#B9D9FF' },
  { emotion: '懼', subtitle: '擔心・害怕・不安', emoji: '😨', color: '#A88BFF', soft: '#EFEAFF', ring: '#D8CBFF' },
  { emotion: '驚訝', subtitle: '意外・驚喜・好奇', emoji: '😲', color: '#FFD35A', soft: '#FFF6D7', ring: '#FFE89A' },
  { emotion: '厭惡', subtitle: '抗拒・不舒服・反感', emoji: '🤢', color: '#A7CE86', soft: '#EDF6E8', ring: '#CDE9B8' }
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

function getRecordTime(record) {
  if (!record) return ''
  const d = new Date(record.updatedAt || record.createdAt)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' })
}

function AppTopBar({ title, rightIcon = 'clock' }) {
  return (
    <div className="mb-5 flex items-center justify-between px-1 pt-4">
      <button className="grid h-11 w-11 place-items-center rounded-2xl text-slate-600">
        <Menu size={22} />
      </button>
      <div className="text-base font-black text-slate-900">{title}</div>
      <div className="grid h-11 w-11 place-items-center rounded-2xl text-slate-700">
        {rightIcon === 'calendar' ? <CalendarDays size={22} /> : <Clock3 size={22} />}
      </div>
    </div>
  )
}

function BrandHero() {
  return (
    <div className="mb-5 rounded-[2.2rem] bg-white/50 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="gradient-title text-4xl font-black tracking-tight">MoodFlow</h1>
            <Sparkles className="text-[#8b78ff]" size={24} />
          </div>
          <p className="mt-2 text-lg font-bold tracking-[0.14em] text-slate-600">每天記下自己的情緒。</p>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-[#8879ff] to-[#77b8ff] text-2xl text-white shadow-glow">
          ✦
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          ['☺', '記錄情緒'],
          ['☑', '回顧每天'],
          ['▥', '了解自己']
        ].map(([icon, label]) => (
          <div key={label} className="rounded-3xl bg-white/68 p-3 text-center shadow-sm">
            <div className="text-2xl text-slate-700">{icon}</div>
            <div className="mt-1 text-xs font-black text-slate-600">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
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
        <div className="glass rounded-[2rem] p-2 shadow-soft">
          <div className="grid grid-cols-3 gap-2">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`relative flex h-16 flex-col items-center justify-center rounded-[1.5rem] text-xs font-black transition ${
                    isActive ? 'text-[#7d68ff]' : 'text-slate-500 hover:bg-white/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-[1.5rem] bg-white shadow-md"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 grid h-7 w-7 place-items-center">
                    <Icon size={22} />
                  </span>
                  <span className="relative z-10 mt-1">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function MoodWheel({ selected, setSelected }) {
  const startX = useRef(null)

  const move = (dir) => {
    setSelected((prev) => (prev + dir + EMOTIONS.length) % EMOTIONS.length)
  }

  const selectedMood = EMOTIONS[selected]

  return (
    <div
      className="relative mx-auto mt-5 h-[390px] w-full max-w-[355px] select-none overflow-hidden rounded-[2.3rem]"
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
      <div className="absolute left-1/2 top-[68px] h-[330px] w-[330px] -translate-x-1/2 rounded-full bg-white/55 shadow-inner" />
      <div className="absolute left-1/2 top-[93px] h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-gradient-to-br from-white/85 to-white/35 shadow-soft" />

      {EMOTIONS.map((item, index) => {
        const offset = index - selected
        const angle = offset * 34 - 90
        const rad = angle * (Math.PI / 180)
        const radius = 136
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius + 210
        const active = index === selected
        return (
          <motion.button
            key={item.emotion}
            type="button"
            onClick={() => setSelected(index)}
            animate={{
              x,
              y,
              scale: active ? 1.18 : 0.84,
              opacity: Math.abs(offset) > 3 ? 0 : active ? 1 : 0.72,
              zIndex: active ? 10 : 2
            }}
            transition={{ type: 'spring', stiffness: 270, damping: 25 }}
            className="absolute left-1/2 top-0 -ml-12 grid h-24 w-24 place-items-center rounded-full border-[3px] border-white shadow-lg"
            style={{
              background: `radial-gradient(circle at 35% 25%, #fff, ${item.color})`
            }}
            aria-label={item.emotion}
          >
            <div className="text-center">
              <div className="text-4xl drop-shadow-sm">{item.emoji}</div>
              {active && <div className="mt-0.5 text-xs font-black text-white drop-shadow">{item.emotion}</div>}
            </div>
          </motion.button>
        )
      })}

      <div className="absolute left-1/2 top-[184px] h-[154px] w-[154px] -translate-x-1/2 rounded-full bg-white shadow-soft" />
      <motion.div
        key={selectedMood.emotion}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute left-1/2 top-[202px] grid h-[118px] w-[118px] -translate-x-1/2 place-items-center rounded-full border-[8px] border-white shadow-glow"
        style={{
          background: `radial-gradient(circle at 35% 25%, #fff, ${selectedMood.color})`
        }}
      >
        <div className="text-6xl">{selectedMood.emoji}</div>
      </motion.div>

      <div className="absolute bottom-6 left-0 right-0 text-center">
        <div className="text-3xl font-black text-slate-900">{selectedMood.emotion}</div>
        <div className="mt-1 text-sm font-bold text-slate-500">{selectedMood.subtitle}</div>
        <div className="mt-4 flex justify-center gap-1.5">
          {EMOTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`h-2.5 rounded-full transition-all ${selected === i ? 'w-7 bg-[#8d7aff]' : 'w-2.5 bg-slate-300'}`}
              aria-label={`切換至第 ${i + 1} 個情緒`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => move(-1)}
        className="absolute left-2 top-[178px] grid h-10 w-10 place-items-center rounded-full bg-white/80 text-slate-700 shadow"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => move(1)}
        className="absolute right-2 top-[178px] grid h-10 w-10 place-items-center rounded-full bg-white/80 text-slate-700 shadow"
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
        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/28 px-3 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button className="absolute inset-0 h-full w-full" onClick={onClose} aria-label="關閉" />
        <motion.div
          className="safe-bottom relative mb-3 w-full max-w-md rounded-[2.3rem] bg-white p-5 shadow-2xl"
          initial={{ y: 420 }}
          animate={{ y: 0 }}
          exit={{ y: 420 }}
          transition={{ type: 'spring', stiffness: 270, damping: 28 }}
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900">想記下什麼？</h2>
              <p className="mt-1 text-sm font-bold text-slate-400">{date}</p>
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
                className={`rounded-[1.35rem] border p-3 text-center transition ${
                  selected === i ? 'scale-[1.02] border-transparent text-white shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-700'
                }`}
                style={selected === i ? { background: `linear-gradient(135deg, ${e.color}, #9d8cff)` } : {}}
              >
                <div className="text-2xl">{e.emoji}</div>
                <div className="mt-1 text-sm font-black">{e.emotion}</div>
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="今天發生了什麼？可以留空。"
            className="h-32 w-full resize-none rounded-[1.6rem] border border-slate-100 bg-slate-50 p-4 text-base outline-none transition focus:border-[#b7a8ff] focus:bg-white"
          />

          {existing && (
            <div className="mt-3 rounded-[1.3rem] bg-slate-50 p-3 text-xs font-semibold text-slate-500">
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
              className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-[#8879ff] to-[#d681e8] text-lg font-black text-white shadow-glow"
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
  const selectedMood = EMOTIONS[selected]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <AppTopBar title="今日情緒" />
      <BrandHero />

      <section className="soft-card p-5">
        <div className="text-center">
          <h2 className="text-lg font-black text-slate-900">嗨，今天過得如何？</h2>
          <p className="mt-2 text-sm font-semibold text-slate-400">選擇一個最能代表你現在的情緒</p>
        </div>

        <MoodWheel selected={selected} setSelected={setSelected} />

        <button
          onClick={() => setSheetOpen(true)}
          className="mt-4 h-14 w-full rounded-[1.5rem] bg-gradient-to-r from-[#8576ff] to-[#d581e8] text-lg font-black text-white shadow-glow"
        >
          確認記錄
        </button>

        {existing && (
          <div className="mt-4 rounded-[1.7rem] bg-white/78 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className="grid h-14 w-14 place-items-center rounded-full border-4 border-white text-3xl shadow"
                style={{ backgroundColor: existing.color }}
              >
                {existing.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-slate-400">今日已記錄</div>
                <div className="text-lg font-black text-slate-800">{existing.emotion}</div>
              </div>
              <div className="text-xs font-bold text-slate-400">{getRecordTime(existing)}</div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">
              {existing.note || '沒有文字備註'}
            </p>
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

function MonthControls({ monthDate, setMonthDate, compact = false }) {
  const changeMonth = (delta) => {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  return (
    <div className={`mb-4 flex items-center justify-between ${compact ? 'rounded-[1.5rem] bg-white/75 px-3 py-2 shadow-sm' : ''}`}>
      <button onClick={() => changeMonth(-1)} className="grid h-11 w-11 place-items-center rounded-2xl bg-white/90 text-slate-700 shadow">
        <ChevronLeft size={20} />
      </button>
      <div className="text-lg font-black text-slate-900">{formatMonth(monthDate)}</div>
      <button onClick={() => changeMonth(1)} className="grid h-11 w-11 place-items-center rounded-2xl bg-white/90 text-slate-700 shadow">
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
    <div className="soft-card p-4">
      <div className="mb-4 grid grid-cols-7 text-center text-xs font-black text-slate-400">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="h-[48px]" />
          const date = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const rec = recordsByDate[date]
          const isToday = date === today
          return (
            <button
              key={date}
              onClick={() => onPickDate(date)}
              className={`relative grid h-[52px] place-items-center rounded-2xl text-center transition active:scale-95 ${
                isToday ? 'ring-2 ring-[#8f7bff] ring-offset-2' : ''
              }`}
              style={{ backgroundColor: rec ? rec.soft || rec.color : '#F1F2F6' }}
            >
              <div className={`text-sm font-black ${rec ? 'text-slate-900' : 'text-slate-400'}`}>{d}</div>
              {rec && <div className="absolute bottom-1 text-[20px] leading-none">{rec.emoji}</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SelectedDayCard({ record, date, onEdit, onDelete }) {
  if (!date) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-[2rem] bg-white/82 p-4 shadow-soft"
    >
      {record ? (
        <>
          <div className="flex items-center gap-4">
            <div
              className="grid h-20 w-20 place-items-center rounded-full border-[6px] border-white text-5xl shadow-lg"
              style={{ background: `radial-gradient(circle at 35% 25%, #fff, ${record.color})` }}
            >
              {record.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-slate-400">{date}</div>
              <div className="mt-1 text-xl font-black text-slate-900">{record.emotion}</div>
              <div className="mt-1 text-sm font-semibold text-slate-400">{getRecordTime(record)}</div>
            </div>
          </div>
          <p className="mt-4 rounded-[1.4rem] bg-slate-50 p-4 text-sm font-medium leading-relaxed text-slate-600">
            {record.note || '沒有文字備註'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={onEdit} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-50 font-black text-slate-700">
              <Edit3 size={18} /> 編輯
            </button>
            <button onClick={onDelete} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-50 font-black text-red-500">
              <Trash2 size={18} /> 刪除
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-50 text-slate-400">
            <Plus size={28} />
          </div>
          <div className="mt-3 text-lg font-black text-slate-900">{date}</div>
          <p className="mt-1 text-sm font-semibold text-slate-400">這天尚未有紀錄</p>
          <button
            onClick={onEdit}
            className="mt-4 h-12 w-full rounded-2xl bg-gradient-to-r from-[#8879ff] to-[#d681e8] font-black text-white shadow-glow"
          >
            新增紀錄
          </button>
        </div>
      )}
    </motion.div>
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
      className="pointer-events-none fixed left-[-9999px] top-0 h-[1920px] w-[1080px] bg-[#fff8fb] p-20 text-slate-900"
    >
      <div
        className="relative h-full overflow-hidden rounded-[74px] p-16"
        style={{
          background:
            'radial-gradient(circle at 8% 3%, rgba(206,188,255,.9), transparent 32%), radial-gradient(circle at 95% 2%, rgba(255,224,184,.95), transparent 30%), linear-gradient(160deg,#fff8fb,#f6f7ff 48%,#fff8ee)'
        }}
      >
        <div className="absolute right-12 top-12 text-6xl text-white">✦</div>
        <div className="text-center">
          <div className="story-big-title font-black" style={{ color: '#806fff' }}>MoodFlow</div>
          <div className="story-title mt-5 font-black tracking-[0.14em] text-slate-600">每天記下自己的情緒。</div>
          <div className="story-title mt-12 font-black">{formatMonth(monthDate)}</div>
        </div>

        <div className="mt-16 rounded-[52px] bg-white/82 p-10 shadow-2xl">
          <div className="mb-8 grid grid-cols-7 text-center story-small font-black text-slate-400">
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
                  className="grid h-24 place-items-center rounded-[30px] text-center font-black"
                  style={{ backgroundColor: rec ? rec.soft || rec.color : '#F0F1F5', color: '#1f2433' }}
                >
                  <div>
                    <div className="story-small">{d}</div>
                    <div className="story-text leading-none">{rec?.emoji || ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8">
          <div className="rounded-[46px] bg-white/85 p-10 shadow-xl">
            <div className="story-small font-black text-slate-400">本月總記錄日數</div>
            <div className="mt-5 text-8xl font-black text-[#8879ff]">{stats.total}</div>
            <div className="story-small font-black text-slate-500">天</div>
          </div>
          <div className="rounded-[46px] bg-white/85 p-10 shadow-xl">
            <div className="story-small font-black text-slate-400">最多出現情緒</div>
            <div className="mt-5 text-7xl font-black">{stats.top ? stats.top.emoji : '—'}</div>
            <div className="story-text mt-2 font-black">{stats.top ? stats.top.emotion : '暫無'}</div>
          </div>
        </div>

        <div className="story-title mt-16 rounded-[46px] bg-gradient-to-r from-[#8879ff] to-[#d681e8] p-12 text-center font-black leading-tight text-white shadow-2xl">
          {line}
        </div>

        <div className="absolute bottom-12 left-16 right-16 rounded-full bg-white/55 px-10 py-6 text-center story-small font-black text-slate-600">
          ♥ MoodFlow 陪伴你，記錄每一種情緒
        </div>
      </div>
    </div>
  )
}

function CalendarPage({ records, monthDate, setMonthDate, onSave, onDelete }) {
  const [pickedDate, setPickedDate] = useState(getTodayString())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const storyRef = useRef(null)
  const monthStats = getStats(records, monthDate)
  const recordsByDate = Object.fromEntries(records.map((r) => [r.date, r]))
  const pickedRecord = pickedDate ? recordsByDate[pickedDate] : null

  async function generateStory() {
    if (!storyRef.current || busy) return
    setBusy(true)
    try {
      const canvas = await html2canvas(storyRef.current, {
        width: 1080,
        height: 1920,
        scale: 1,
        backgroundColor: '#fff8fb',
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <AppTopBar title="月曆紀錄" rightIcon="calendar" />
      <MonthControls monthDate={monthDate} setMonthDate={setMonthDate} />
      <CalendarGrid monthDate={monthDate} recordsByDate={recordsByDate} onPickDate={setPickedDate} />

      <SelectedDayCard
        record={pickedRecord}
        date={pickedDate}
        onEdit={() => setSheetOpen(true)}
        onDelete={() => pickedDate && onDelete(pickedDate)}
      />

      <button
        onClick={generateStory}
        disabled={busy}
        className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-[#8879ff] to-[#d681e8] text-lg font-black text-white shadow-glow disabled:opacity-60"
      >
        {busy ? <Download size={20} /> : <ImageIcon size={20} />}
        {busy ? '正在生成...' : '生成 IG Story 圖'}
      </button>

      <div className="mt-4 rounded-[2rem] bg-white/74 p-5 shadow-soft">
        <div className="text-sm font-black text-slate-400">本月摘要</div>
        <div className="mt-2 text-2xl font-black text-slate-900">{monthStats.total} 日有紀錄</div>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          最多出現：{monthStats.top ? `${monthStats.top.emoji} ${monthStats.top.emotion}` : '暫未有資料'}
        </p>
      </div>

      <IGStoryCanvas monthDate={monthDate} records={records} storyRef={storyRef} />

      <RecordSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <AppTopBar title="統計分析" rightIcon="calendar" />

      <button className="mx-auto mb-5 flex h-12 items-center justify-center gap-2 rounded-[1.4rem] bg-white/86 px-6 font-black text-slate-900 shadow-sm">
        {formatMonth(monthDate)}
        <ChevronDown size={18} />
      </button>
      <MonthControls monthDate={monthDate} setMonthDate={setMonthDate} compact />

      <section className="rounded-[2rem] bg-gradient-to-r from-[#a58cff] to-[#8da4ff] p-5 text-white shadow-glow">
        <div className="grid grid-cols-2 gap-4">
          <div className="border-r border-white/25 pr-4">
            <div className="text-sm font-black text-white/80">本月總記錄日數</div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-black">{stats.total}</span>
              <span className="mb-1 font-black">天</span>
            </div>
          </div>
          <div className="pl-2">
            <div className="text-sm font-black text-white/80">最常出現情緒</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white/25 text-4xl">{stats.top ? stats.top.emoji : '—'}</div>
              <div>
                <div className="text-2xl font-black">{stats.top ? stats.top.emotion : '暫無'}</div>
                <div className="text-sm font-bold text-white/75">{stats.top ? `${stats.top.count} 天` : '未有紀錄'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 soft-card p-5">
        <h2 className="mb-4 text-lg font-black text-slate-900">情緒分佈</h2>
        <div className="space-y-4">
          {stats.counts.map((item) => {
            const percent = stats.total ? Math.round((item.count / stats.total) * 100) : 0
            return (
              <div key={item.emotion} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <div className="flex w-14 items-center gap-1.5 font-black text-slate-700">
                  <span>{item.emotion}</span>
                  <span>{item.emoji}</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${item.color}, ${item.ring})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-right text-sm font-black text-slate-500">{item.count}天　{percent}%</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-4 soft-card p-5">
        <h2 className="mb-4 text-lg font-black text-slate-900">情緒分佈長條圖</h2>
        <div className="flex h-44 items-end justify-between gap-2 rounded-[1.6rem] bg-white/72 px-3 pb-4 pt-6">
          {stats.counts.map((item) => (
            <div key={item.emotion} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div className="text-xs font-black text-slate-500">{item.count}</div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(10, (item.count / maxCount) * 100)}%` }}
                className="w-full max-w-9 rounded-t-2xl"
                style={{ background: `linear-gradient(180deg, ${item.color}, ${item.ring})` }}
              />
              <div className="text-lg">{item.emoji}</div>
              <div className="text-xs font-black text-slate-500">{item.emotion}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 soft-card p-5">
        <h2 className="mb-4 text-lg font-black text-slate-900">情緒趨勢</h2>
        {sortedDays.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">本月暫未有紀錄</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {sortedDays.map((r) => (
              <div key={r.id} className="min-w-[74px] rounded-[1.5rem] bg-white/78 p-3 text-center shadow-sm">
                <div
                  className="mx-auto grid h-12 w-12 place-items-center rounded-full border-4 border-white text-2xl shadow"
                  style={{ backgroundColor: r.color }}
                >
                  {r.emoji}
                </div>
                <div className="mt-2 text-sm font-black text-slate-800">{Number(r.date.slice(-2))}</div>
                <div className="text-xs font-bold text-slate-400">
                  {new Date(r.date).toLocaleDateString('zh-HK', { weekday: 'short' })}
                </div>
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
                  soft: emotionData.soft,
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
              soft: emotionData.soft,
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
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden px-4 pb-32 pt-2">
      <div className="pointer-events-none fixed left-1/2 top-[-60px] h-64 w-64 -translate-x-1/2 rounded-full bg-[#b9a8ff]/25 blur-3xl" />
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
