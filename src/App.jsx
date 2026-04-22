import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Save, BookOpen, Printer, X, Plus, Trash2, Users, Check, Download } from 'lucide-react'
import LunarCalendar from 'lunar-calendar'

const zodiacs = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬']
const monthNames = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '臘']
const dayNames = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

const dizhiToZodiacIdx = { '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5, '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11 }

function getLunarInfo(gregorianYear, month, day) {
  if (gregorianYear < 1891 || gregorianYear > 2100) {
    return { lunarMonthName: '', lunarDayName: '', ganZhiYear: '', ganZhiMonth: '', ganZhiDay: '', chongZodiac: '', zodiac: '' }
  }
  try {
    const data = LunarCalendar.solarToLunar(gregorianYear, month, day)
    const dizhiDay = data.GanZhiDay?.[1] || ''
    const dayIdx = dizhiToZodiacIdx[dizhiDay] || 0
    const chongIdx = (dayIdx + 6) % 12
    const lunarMonthName = data.lunarMonthName || (data.lunarMonth > 0 ? monthNames[data.lunarMonth - 1] : '')
    const lunarDayName = data.lunarDayName || dayNames[(data.lunarDay || 1) - 1] || data.lunarDay
    return {
      lunarMonthName, lunarDayName,
      ganZhiYear: data.GanZhiYear || '',
      ganZhiMonth: data.GanZhiMonth || '',
      ganZhiDay: data.GanZhiDay || '',
      chongZodiac: zodiacs[chongIdx],
      zodiac: zodiacs[dayIdx]
    }
  } catch {
    return { lunarMonthName: '', lunarDayName: '', ganZhiYear: '', ganZhiMonth: '', ganZhiDay: '', chongZodiac: '', zodiac: '' }
  }
}

const STORAGE_KEY = 'zheri-tongshu-form'

const DEFAULT_FORM = {
  name: '', gender: '男', age: '',
  benMing: '', naYin: '', benMingSha: '',
  zuo: '', xiang: '',
  duiNian_nongLi: { year: '', month: '', day: '' },
  sanNian_nongLi: { year: '', month: '', day: '' },
  zeHeLu_nongLi: { year: '', month: '', day: '' },
  zeHeLu_zhengChong: '', zeHeLu_anWei: '', zeHeLu_shiSha: '',
  family: [{ name: '', relation: '兒子', zodiac: '', age: '' }],
  notes: ''
}

function RocYearPicker({ value = {}, onChange, label }) {
  const currentRocYear = new Date().getFullYear() - 1911
  const years = Array.from({ length: 130 }, (_, i) => i + 1)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate()
  const selectedYear = value.year ? parseInt(value.year) + 1911 : null
  const maxDays = selectedYear && value.month ? getDaysInMonth(selectedYear, parseInt(value.month)) : 31
  return (
    <div>
      {label && <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{label}</div>}
      <div className="grid grid-cols-3 gap-1">
        <select value={value.year || ''} onChange={e => onChange({ ...value, year: e.target.value, day: parseInt(value.day) > maxDays ? '' : value.day })}
          className="px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white">
          <option value="">年</option>
          {years.map(y => <option key={y} value={y}>{y}年</option>)}
        </select>
        <select value={value.month || ''} onChange={e => onChange({ ...value, month: e.target.value })}
          className="px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white">
          <option value="">月</option>
          {months.map(m => <option key={m} value={String(m).padStart(2, '0')}>{m}</option>)}
        </select>
        <select value={value.day || ''} onChange={e => onChange({ ...value, day: e.target.value })}
          className="px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white">
          <option value="">日</option>
          {days.slice(0, maxDays).map(d => <option key={d} value={String(d).padStart(2, '0')}>{d}</option>)}
        </select>
      </div>
    </div>
  )
}

export default function App() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)
  const [activeTab, setActiveTab] = useState('tongshu')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [events, setEvents] = useState({})
  const [notes, setNotes] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [eventText, setEventText] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [editNotes, setEditNotes] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedDates, setSelectedDates] = useState({})
  const [inlineEditDate, setInlineEditDate] = useState(null)
  const [inlineEditText, setInlineEditText] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setForm(JSON.parse(saved))
    const savedEvents = localStorage.getItem('zheri-events')
    if (savedEvents) setEvents(JSON.parse(savedEvents))
    const savedNotes = localStorage.getItem('zheri-notes')
    if (savedNotes) setNotes(savedNotes)
  }, [])

  const saveForm = (newForm) => {
    setForm(newForm)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newForm))
  }
  const updateForm = (key, val) => saveForm({ ...form, [key]: val })
  const saveEvents = (newEvents) => {
    setEvents(newEvents)
    localStorage.setItem('zheri-events', JSON.stringify(newEvents))
  }

  const updateFamily = (idx, key, val) => {
    const newFamily = [...form.family]
    newFamily[idx] = { ...newFamily[idx], [key]: val }
    saveForm({ ...form, family: newFamily })
  }
  const addFamily = () => saveForm({ ...form, family: [...form.family, { name: '', relation: '兒子', zodiac: '', age: '' }] })
  const removeFamily = (idx) => saveForm({ ...form, family: form.family.filter((_, i) => i !== idx) })

  const cells = (() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
    const result = []
    for (let i = 0; i < firstDay; i++) result.push({ year: viewYear, month: viewMonth, day: 0, isCurrentMonth: false })
    for (let d = 1; d <= daysInMonth; d++) result.push({ year: viewYear, month: viewMonth, day: d, isCurrentMonth: true })
    return result
  })()

  const dateKey = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth() + 1) }
  const prevMonth = () => { if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }

  const openDay = (cell) => {
    const key = dateKey(cell.year, cell.month, cell.day)
    setSelectedDate(key); setEventText(events[key] || ''); setEditNotes(false)
  }
  const closeModal = () => { setSelectedDate(null); setEventText(''); setEditNotes(false) }
  const saveEvent = () => {
    if (!selectedDate) return
    const ne = { ...events }
    if (eventText.trim()) ne[selectedDate] = eventText.trim()
    else delete ne[selectedDate]
    saveEvents(ne); closeModal()
  }
  const deleteEvent = () => {
    if (!selectedDate) return
    const ne = { ...events }; delete ne[selectedDate]; saveEvents(ne); closeModal()
  }

  const startInlineEdit = (cell, e) => {
    e.stopPropagation()
    if (!cell.isCurrentMonth) return
    const key = dateKey(cell.year, cell.month, cell.day)
    setInlineEditDate(key)
    setInlineEditText(events[key] || '')
  }
  const saveInlineEdit = () => {
    if (!inlineEditDate) return
    const ne = { ...events }
    if (inlineEditText.trim()) ne[inlineEditDate] = inlineEditText.trim()
    else delete ne[inlineEditDate]
    saveEvents(ne)
    setInlineEditDate(null)
    setInlineEditText('')
  }
  const cancelInlineEdit = () => { setInlineEditDate(null); setInlineEditText('') }

  const toggleDateSelection = (cell) => {
    if (!cell.isCurrentMonth) return
    const key = dateKey(cell.year, cell.month, cell.day)
    const newSelected = { ...selectedDates }
    if (newSelected[key]) delete newSelected[key]
    else {
      const lunar = getLunarInfo(cell.year, cell.month, cell.day)
      newSelected[key] = { year: cell.year, month: cell.month, day: cell.day, lunar: `${lunar.lunarMonthName}${lunar.lunarDayName}`, ganZhi: lunar.ganZhiDay, chong: lunar.chongZodiac }
    }
    setSelectedDates(newSelected)
  }

  const exportSelectedDates = () => {
    const keys = Object.keys(selectedDates).sort()
    if (keys.length === 0) return alert('請先勾選要輸出的日期')
    const lines = []
    lines.push('═══════════════════════════════════════')
    lines.push('         擇日服務行事曆 - 日課清單')
    lines.push(`         匯出日期：${new Date().toLocaleDateString('zh-TW')}`)
    lines.push('═══════════════════════════════════════')
    lines.push(`共選取 ${keys.length} 個日期`)
    lines.push('')
    keys.forEach((key, idx) => {
      const data = selectedDates[key]
      lines.push(`${idx + 1}. ${key}`)
      lines.push(`   農曆：${data.lunar}`)
      lines.push(`   干支：${data.ganZhi}`)
      if (data.chong) lines.push(`   日沖：${data.chong}`)
      lines.push('')
    })
    lines.push('僅供參考 ｜ 傳承生命事業有限公司')
    const content = lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `日課清單_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    const f = form
    const lines = []
    lines.push('═══════════════════════════════════════')
    lines.push('         擇日服務行事曆')
    lines.push('═══════════════════════════════════════')
    lines.push('')
    lines.push('【基本資料】')
    lines.push(`  姓名：${f.name || '___'}   性別：${f.gender || '___'}   年齡：${f.age || '___'}歲`)
    lines.push('')
    lines.push('【本命五行】')
    lines.push(`  本命：${f.benMing || '___'}   納音：${f.naYin || '___'}   本命煞：${f.benMingSha || '___'}`)
    lines.push('')
    lines.push(`座向：${f.zuo || '_______'}    向：${f.xiang || '_______'}`)
    lines.push('')
    lines.push('【對年】')
    lines.push(`  民國：${f.duiNian_nongLi.year || '___'}年 ${f.duiNian_nongLi.month || '___'}月 ${f.duiNian_nongLi.day || '___'}日`)
    lines.push('')
    lines.push('【三年】')
    lines.push(`  民國：${f.sanNian_nongLi.year || '___'}年 ${f.sanNian_nongLi.month || '___'}月 ${f.sanNian_nongLi.day || '___'}日`)
    lines.push('')
    lines.push('【擇合爐日】')
    lines.push(`  民國：${f.zeHeLu_nongLi.year || '___'}年 ${f.zeHeLu_nongLi.month || '___'}月 ${f.zeHeLu_nongLi.day || '___'}日`)
    lines.push('')
    lines.push('═══════════════════════════════════════')
    lines.push('【家屬資料】')
    f.family.forEach((fm, idx) => {
      lines.push(`  ${idx + 1}. ${fm.relation || '家屬'}：${fm.name || '___'} ${fm.zodiac ? `（${fm.zodiac}）` : ''} ${fm.age ? `${fm.age}歲` : ''}`)
    })
    lines.push('')
    lines.push('【備註】')
    lines.push(`  ${f.notes || ''}`)
    lines.push('')
    lines.push('═══════════════════════════════════════')
    lines.push('       僅供參考 ｜ 傳承生命事業有限公司')
    const content = lines.join('\n')
    const win = window.open('', '_blank')
    win.document.write(`<pre style="font-family: 'Noto Serif TC', serif; font-size: 15px; line-height: 2.0; padding: 40px; white-space: pre-wrap; max-width: 700px; margin: auto;">${content}</pre>`)
    win.document.close()
    win.print()
  }

  const handlePrintCalendar = () => {
    const weekdayNamesPrint = ['日', '一', '二', '三', '四', '五', '六']
    const lines = []
    lines.push('═══════════════════════════════════════')
    lines.push(`         擇日服務行事曆 ${viewYear}年 ${viewMonth}月`)
    lines.push('═══════════════════════════════════════')
    lines.push('  日  一  二  三  四  五  六')
    lines.push('───────────────────────────────')
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
    const allDays = []
    for (let i = 0; i < firstDay; i++) allDays.push(null)
    for (let d = 1; d <= daysInMonth; d++) allDays.push(d)
    for (let w = 0; w < 6; w++) {
      const week = allDays.slice(w * 7, w * 7 + 7)
      const row = week.map(d => {
        if (d === null) return '   '
        const chong = getLunarInfo(viewYear, viewMonth, d).chongZodiac
        const event = events[dateKey(viewYear, viewMonth, d)]
        const chongStr = chong ? `(${chong})` : ''
        const dayStr = String(d).padStart(2, ' ')
        return `${dayStr}${chongStr.substring(0, 4)}`
      })
      lines.push(row.join(' '))
      const eventRow = week.map(d => {
        if (d === null) return '       '
        const ev = events[dateKey(viewYear, viewMonth, d)] || ''
        return ev ? ev.substring(0, 6).padEnd(6, ' ') : '      '
      })
      if (eventRow.some(e => e.trim())) lines.push(eventRow.join('|'))
    }
    lines.push('')
    lines.push('───────────────────────────────')
    lines.push(`西元年:${viewYear}  民國:${viewYear - 1911}`)
    lines.push('')
    lines.push('       僅供參考 ｜ 傳承生命事業有限公司')
    const content = lines.join('\n')
    const win = window.open('', '_blank')
    win.document.write(`<pre style="font-family:monospace;font-size:14px;line-height:1.6;">${content}</pre>`)
    win.document.close()
    win.print()
  }

  const getWeekday = (y, m, d) => {
    const dayNames = ['日', '一', '二', '三', '四', '五', '六']
    const date = new Date(y, m - 1, d)
    return dayNames[date.getDay()]
  }

  const TongshuTab = () => (
    <div className="px-3 py-4 space-y-4">
      <div className="text-center py-3">
        <h2 className="text-xl font-bold text-amber-700 tracking-widest">通 書  表  單</h2>
        <p className="text-xs text-amber-400 mt-1">傳承生命事業有限公司</p>
      </div>

      {/* 基本資料 */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5 flex items-center gap-2">
          <BookOpen size={14} className="text-white" />
          <span className="text-white font-bold text-sm">基本資料</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase">姓名</label>
              <input value={form.name} onChange={e => updateForm('name', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200" />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase">性別</label>
              <select value={form.gender} onChange={e => updateForm('gender', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white">
                <option>男</option><option>女</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase">年齡</label>
              <select value={form.age} onChange={e => updateForm('age', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white">
                <option value="">請選擇</option>
                {Array.from({ length: 120 }, (_, i) => i + 1).map(age => (
                  <option key={age} value={age}>{age} 歲</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 本命五行 */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="bg-amber-600 px-4 py-2.5">
          <span className="text-white font-bold text-sm">本命五行</span>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {[{ label: '本命', field: 'benMing' }, { label: '納音', field: 'naYin' }, { label: '本命煞', field: 'benMingSha' }].map(e => (
            <div key={e.field}>
              <label className="text-[10px] text-gray-400 font-bold uppercase">{e.label}</label>
              <input value={form[e.field] || ''} onChange={t => updateForm(e.field, t.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" />
            </div>
          ))}
        </div>
      </div>

      {/* 座向 */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase">座</label>
            <input value={form.zuo} onChange={e => updateForm('zuo', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200" />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase">向</label>
            <input value={form.xiang} onChange={e => updateForm('xiang', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200" />
          </div>
        </div>
      </div>

      {/* 對年/三年/擇合爐日 */}
      {[
        { title: '對年', nKey: 'duiNian_nongLi', showExtra: false },
        { title: '三年', nKey: 'sanNian_nongLi', showExtra: false },
        { title: '擇合爐日', nKey: 'zeHeLu_nongLi', zhengChong: 'zeHeLu_zhengChong', anWei: 'zeHeLu_anWei', shiSha: 'zeHeLu_shiSha', showExtra: true }
      ].map(section => (
        <div key={section.title} className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5">
            <span className="text-white font-bold text-sm">【{section.title}】</span>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <RocYearPicker label="民國" value={form[section.nKey]} onChange={val => updateForm(section.nKey, val)} />
            </div>
            {section.showExtra && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold">正沖</label>
                  <input value={form[section.zhengChong] || ''} onChange={e => updateForm(section.zhengChong, e.target.value)}
                    className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold">安位</label>
                  <input value={form[section.anWei] || ''} onChange={e => updateForm(section.anWei, e.target.value)}
                    className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold">時煞</label>
                  <input value={form[section.shiSha] || ''} onChange={e => updateForm(section.shiSha, e.target.value)}
                    className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 家屬資料 */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-white" />
            <span className="text-white font-bold text-sm">家屬資料</span>
          </div>
          <button onClick={addFamily} className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full transition">
            <Plus size={12} /> 新增
          </button>
        </div>
        <div className="p-4 space-y-2">
          {form.family.map((fm, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 font-bold">姓名</label>
                <input value={fm.name} onChange={e => updateFamily(idx, 'name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200" />
              </div>
              <div className="w-20">
                <label className="text-[10px] text-gray-400 font-bold">稱謂</label>
                <select value={fm.relation} onChange={e => updateFamily(idx, 'relation', e.target.value)}
                  className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white">
                  <option value="兒子">兒子</option>
                  <option value="女兒">女兒</option>
                  <option value="孫">孫</option>
                </select>
              </div>
              <div className="w-16">
                <label className="text-[10px] text-gray-400 font-bold">年齡</label>
                <select value={fm.age || ''} onChange={e => updateFamily(idx, 'age', e.target.value)}
                  className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white">
                  <option value="">-</option>
                  {Array.from({ length: 120 }, (_, i) => i + 1).map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>
              <div className="w-16">
                <label className="text-[10px] text-gray-400 font-bold">生肖</label>
                <select value={fm.zodiac} onChange={e => updateFamily(idx, 'zodiac', e.target.value)}
                  className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white">
                  <option value="">-</option>
                  {zodiacs.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <button onClick={() => removeFamily(idx)} className="p-2 text-gray-300 hover:text-red-400 transition mb-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 備註 */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
        <label className="text-[10px] text-gray-400 font-bold uppercase">備註</label>
        <textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} rows={3}
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
          placeholder="輸入備註內容..." />
      </div>

      {/* 列印按鈕 */}
      <button onClick={handlePrint}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl text-sm font-bold hover:shadow-lg transition">
        <Printer size={16} /> 列印 / 匯出
      </button>
      <div className="text-center text-amber-300 text-[10px] pb-2">僅供參考 ｜ 傳承生命事業有限公司</div>
    </div>
  )

  const CalendarTab = () => (
    <>
      <div className="grid grid-cols-7 gap-px bg-amber-200 p-px mx-2 rounded-b-xl">
        {cells.map((cell, idx) => {
          const key = dateKey(cell.year, cell.month, cell.day)
          const isToday = cell.year === today.getFullYear() && cell.month === today.getMonth() + 1 && cell.day === today.getDate()
          const dayEvents = events[key] || ''
          const lunar = cell.isCurrentMonth ? getLunarInfo(cell.year, cell.month, cell.day) : {}
          const isWeekend = idx % 7 === 0 || idx % 7 === 6
          const isSelected = !!selectedDates[key]
          const isInlineEditing = inlineEditDate === key
          return (
            <div key={key}
              onClick={() => selectionMode ? toggleDateSelection(cell) : (cell.isCurrentMonth && !isInlineEditing && openDay(cell))}
              className={`min-h-[88px] bg-white rounded-xl p-2 cursor-pointer hover:shadow-md transition-all relative
                ${!cell.isCurrentMonth ? 'bg-amber-50 opacity-40' : 'shadow-sm'}
                ${isToday ? 'ring-2 ring-amber-400 shadow-md' : ''}
                ${isSelected ? 'bg-amber-100 ring-2 ring-amber-500' : ''}`}>
              {selectionMode && cell.isCurrentMonth && (
                <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs z-10
                  ${isSelected ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {isSelected ? <Check size={12} /> : <span className="text-[10px]">{cell.day}</span>}
                </div>
              )}
              <div className={`text-sm font-bold mb-1 ${isWeekend ? (idx % 7 === 0 ? 'text-amber-600' : 'text-orange-400') : 'text-gray-700'}`}>
                {!selectionMode && cell.day}{isToday && !selectionMode && <span className="ml-1 text-[9px] bg-amber-500 text-white rounded-full px-1.5 py-0.5 font-medium">今</span>}
              </div>
              {cell.isCurrentMonth && (
                <div className="text-[10px] text-gray-400 leading-tight space-y-0.5">
                  {lunar.lunarMonthName && <div className="text-amber-500 font-medium">{lunar.lunarMonthName}{lunar.lunarDayName}</div>}
                  {lunar.ganZhiDay && <div className="text-gray-400">{lunar.ganZhiDay}</div>}
                  {lunar.chongZodiac && <div className="bg-orange-50 text-orange-500 rounded px-1 py-0.5 text-[9px] font-medium mt-1">沖{lunar.chongZodiac}</div>}
                </div>
              )}
              {isInlineEditing ? (
                <div className="mt-1" onClick={e => e.stopPropagation()}>
                  <input type="text" value={inlineEditText} onChange={e => setInlineEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveInlineEdit(); if (e.key === 'Escape') cancelInlineEdit() }}
                    onBlur={saveInlineEdit} autoFocus
                    className="w-full px-1 py-1 text-[9px] border border-amber-300 rounded bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    placeholder="輸入文字..." />
                </div>
              ) : dayEvents ? (
                <div onClick={(e) => startInlineEdit(cell, e)}
                  className="mt-1.5 text-[9px] bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-lg px-1.5 py-1 truncate leading-tight font-medium border border-amber-100 cursor-text"
                  title="點擊編輯">
                  {dayEvents}
                </div>
              ) : (
                cell.isCurrentMonth && !selectionMode && (
                  <div onClick={(e) => startInlineEdit(cell, e)} className="mt-1.5 text-center cursor-text">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-50 rounded-full text-amber-300 hover:bg-amber-100 transition"><Plus size={10} /></span>
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>

      {selectionMode && (
        <div className="mx-2 mt-3 bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500">已選取 </span>
              <span className="text-amber-600 font-bold">{Object.keys(selectedDates).length}</span>
              <span className="text-gray-500"> 個日期</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedDates({})} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">清除</button>
              <button onClick={exportSelectedDates} className="px-3 py-1.5 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium flex items-center gap-1">
                <Download size={12} /> 匯出文字檔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 事件彈窗 */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-3 flex items-center justify-between">
              <div className="text-white font-bold">{selectedDate}</div>
              <button onClick={closeModal} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4">
              {(() => {
                const [y, m, d] = selectedDate.split('-').map(Number)
                const lunar = getLunarInfo(y, m, d)
                return (
                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div><div className="text-xs text-gray-400 mb-1">星期</div><div className="font-bold text-amber-600">{getWeekday(y, m, d)}</div></div>
                    {lunar.lunarMonthName && <div><div className="text-xs text-gray-400 mb-1">農曆</div><div className="font-bold text-amber-600">{lunar.lunarMonthName}{lunar.lunarDayName}</div></div>}
                    {lunar.ganZhiDay && <div><div className="text-xs text-gray-400 mb-1">干支</div><div className="font-bold text-amber-600">{lunar.ganZhiDay}</div></div>}
                    {lunar.chongZodiac && <div><div className="text-xs text-gray-400 mb-1">日沖</div><div className="text-orange-500 font-bold">{lunar.chongZodiac}</div></div>}
                  </div>
                )
              })()}
              <textarea value={eventText} onChange={e => setEventText(e.target.value)} rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="輸入事件內容..." />
              <div className="flex gap-2 mt-3">
                <button onClick={saveEvent} className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium">儲存</button>
                {events[selectedDate] && <button onClick={deleteEvent} className="px-4 py-2 border border-red-200 text-red-400 rounded-xl text-sm">刪除</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-amber-50 to-orange-50 min-h-screen pb-8 shadow-2xl border-x border-amber-100 font-sans">
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-4 text-white shadow-lg">
        <h1 className="text-lg font-bold text-center flex items-center justify-center gap-2">
          擇日服務行事曆
        </h1>
        <div className="flex gap-2 mt-3">
          {[{id: 'tongshu', label: '通書表單'}, {id: 'calendar', label: '行事曆'}].map(e => (
            <button key={e.id} onClick={() => setActiveTab(e.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${activeTab === e.id ? 'bg-white text-amber-600' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              {e.label}
            </button>
          ))}
        </div>
        {activeTab === 'calendar' && (
          <div className="flex items-center justify-between mt-3">
            <button onClick={prevMonth} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition backdrop-blur"><ChevronLeft size={20} /></button>
            <div className="text-center">
              <div className="text-xl font-bold tracking-wide">{viewYear}年 {viewMonth}月</div>
              <button onClick={goToday} className="text-xs bg-white/25 hover:bg-white/35 px-4 py-1 rounded-full mt-1.5 transition backdrop-blur font-medium">今天</button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectionMode(!selectionMode)}
                className={`p-2 rounded-xl transition backdrop-blur ${selectionMode ? 'bg-amber-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`} title="勾選模式">
                <Check size={20} />
              </button>
              <button onClick={handlePrintCalendar} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition backdrop-blur text-white" title="列印行事曆">
                <Printer size={20} />
              </button>
              <button onClick={nextMonth} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition backdrop-blur"><ChevronRight size={20} /></button>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'calendar' && <CalendarTab />}
      {activeTab === 'tongshu' && <TongshuTab />}
    </div>
  )
}
