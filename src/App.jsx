import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Save, BookOpen, Printer, X, Plus, Trash2, Users, FileText, Edit3, Check, Download } from 'lucide-react'
import LunarCalendar from 'lunar-calendar'

// =====================
// 農曆工具
// =====================
const zodiacs = ["鼠", "牛", "虎", "兔", "龍", "蛇", "馬", "羊", "猴", "雞", "狗", "豬"]
const dizhis = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
const dizhiToZodiacIdx = { 子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5, 午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11 }
const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '臘月']
const dayNames = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

// 計算日沖生肖的影響年齡（以12年為一輪）
function getChongSuiList(chongZodiac) {
  if (!chongZodiac) return ''
  // 傳統上日沖影響1,13,25,37,49,61,73,85,97歲...
  const ages = []
  for (let i = 1; i <= 120; i += 12) {
    ages.push(i)
  }
  // 只顯示1-99歲範圍
  return ages.filter(a => a <= 99).join('/') + '歲'
}

function getLunarInfo(gregorianYear, month, day) {
  // gregorianYear: 西元年 (如 2026), 不是民國年
  // lunar-calendar 支援 1891-2100 年
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
      lunarMonthName,
      lunarDayName,
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

// =====================
// 預設值
// =====================
const DEFAULT_FORM = {
  // 基本資料
  name: '', gender: '男', age: '',
  // 煞
  benMing: '', naYin: '', benMingSha: '',
  sanHe: '', xiangChong: '', ciHaiSha: '',
  liuHe: '', sanSha: '', nianSha: '',
  duiGui: '', sanXing: '', yueSha: '',
  huiTouSha: '', riSha: '',
  // 座向
  zuo: '', xiang: '',
  // 對年
  duiNian_gongLi: { year: '', month: '', day: '' },
  duiNian_nongLi: { year: '', month: '', day: '' },
  // 三年
  sanNian_gongLi: { year: '', month: '', day: '' },
  sanNian_nongLi: { year: '', month: '', day: '' },
  // 擇合爐日
  zeHeLu_gongLi: { year: '', month: '', day: '' },
  zeHeLu_nongLi: { year: '', month: '', day: '' },
  zeHeLu_zhengChong: '', zeHeLu_anWei: '', zeHeLu_shiSha: '',
  // 家屬
  family: [{ name: '', relation: '配偶', zodiac: '', age: '' }],
  // 備註
  notes: ''
}

const STORAGE_KEY = 'zheri-tongshu-form'

// =====================
// 日期選擇器元件（西元年）
// =====================
function DatePicker({ value = {}, onChange, label }) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 200 }, (_, i) => currentYear - 100 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate()
  const maxDays = value.year && value.month ? getDaysInMonth(parseInt(value.year), parseInt(value.month)) : 31

  return (
    <div>
      {label && <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{label}</div>}
      <div className="grid grid-cols-3 gap-1">
        {/* 年 */}
        <select
          value={value.year || ''}
          onChange={e => onChange({ ...value, year: e.target.value, day: parseInt(value.day) > maxDays ? '' : value.day })}
          className="px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white appearance-none cursor-pointer"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          <option value="">年</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {/* 月 */}
        <select
          value={value.month || ''}
          onChange={e => onChange({ ...value, month: e.target.value, day: parseInt(value.day) > getDaysInMonth(parseInt(value.year), parseInt(e.target.value)) ? '' : value.day })}
          className="px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white appearance-none cursor-pointer"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          <option value="">月</option>
          {months.map(m => <option key={m} value={String(m).padStart(2, '0')}>{m}</option>)}
        </select>
        {/* 日 */}
        <select
          value={value.day || ''}
          onChange={e => onChange({ ...value, day: e.target.value })}
          className="px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white appearance-none cursor-pointer"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          <option value="">日</option>
          {days.slice(0, maxDays).map(d => <option key={d} value={String(d).padStart(2, '0')}>{d}</option>)}
        </select>
      </div>
    </div>
  )
}

// =====================
// 民國年選擇器（1-130年）
// =====================
function RocYearPicker({ value = {}, onChange, label }) {
  const currentRocYear = new Date().getFullYear() - 1911
  const years = Array.from({ length: 130 }, (_, i) => i + 1)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate()
  // 根據選擇的年月計算最大日數
  const selectedYear = value.year ? parseInt(value.year) + 1911 : null
  const maxDays = selectedYear && value.month ? getDaysInMonth(selectedYear, parseInt(value.month)) : 31

  return (
    <div>
      {label && <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{label}</div>}
      <div className="grid grid-cols-3 gap-1">
        {/* 年（民國） */}
        <select
          value={value.year || ''}
          onChange={e => onChange({ ...value, year: e.target.value, day: parseInt(value.day) > maxDays ? '' : value.day })}
          className="px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white appearance-none cursor-pointer"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          <option value="">年</option>
          {years.map(y => <option key={y} value={y}>{y} 年</option>)}
        </select>
        {/* 月 */}
        <select
          value={value.month || ''}
          onChange={e => {
            const newMax = getDaysInMonth(selectedYear, parseInt(e.target.value))
            onChange({ ...value, month: e.target.value, day: parseInt(value.day) > newMax ? '' : value.day })
          }}
          className="px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white appearance-none cursor-pointer"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          <option value="">月</option>
          {months.map(m => <option key={m} value={String(m).padStart(2, '0')}>{m}</option>)}
        </select>
        {/* 日 */}
        <select
          value={value.day || ''}
          onChange={e => onChange({ ...value, day: e.target.value })}
          className="px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white appearance-none cursor-pointer"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          <option value="">日</option>
          {days.slice(0, maxDays).map(d => <option key={d} value={String(d).padStart(2, '0')}>{d}</option>)}
        </select>
      </div>
    </div>
  )
}

// =====================
// 主元件
// =====================
export default function App() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)
  const [activeTab, setActiveTab] = useState('tongshu') // 'tongshu' | 'calendar'
  const [tabTransition, setTabTransition] = useState(false) | 'info'
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
    try {
      const savedForm = localStorage.getItem(STORAGE_KEY)
      if (savedForm) { 
        const parsed = JSON.parse(savedForm)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setForm(parsed) 
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      const savedEvents = localStorage.getItem('zheri-events')
      if (savedEvents) { 
        try {
          const parsed = JSON.parse(savedEvents)
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setEvents(parsed)
          } else {
            localStorage.removeItem('zheri-events')
          }
        } catch {
          localStorage.removeItem('zheri-events')
        }
      }
      const savedNotes = localStorage.getItem('zheri-notes')
      if (savedNotes && typeof savedNotes === 'string') {
        setNotes(savedNotes)
      } else {
        setNotes('📋 備註事項說明\n記錄重要的择日參考資訊')
        localStorage.removeItem('zheri-notes')
      }
    } catch (e) {
      console.error('Load error:', e)
      // 清除所有本地資料並重設
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('zheri-events')
      localStorage.removeItem('zheri-notes')
    }
  }, [])

  const saveForm = (f) => { 
    if (!f || typeof f !== 'object') return
    if (!Array.isArray(f.family)) f.family = []
    setForm(f); 
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(f))
    } catch (e) {
      console.error('Save error:', e)
    }
  }
  const saveEvents = (e) => { setEvents(e); localStorage.setItem('zheri-events', JSON.stringify(e)) }
  const saveNotes = (n) => { setNotes(n); localStorage.setItem('zheri-notes', n) }

  const updateForm = (field, val) => saveForm({ ...form, [field]: val })

  // ===== 家屬 =====
  const addFamily = () => saveForm({ ...form, family: [...(form.family || []), { name: '', relation: '親屬', zodiac: '' }] })
  const removeFamily = (idx) => saveForm({ ...form, family: Array.isArray(form.family) ? form.family.filter((_, i) => i !== idx) : [] })
  const updateFamily = (idx, field, val) => {
    const f = [...(form.family || [])]; f[idx] = { ...f[idx], [field]: val }; saveForm({ ...form, family: f })
  }

  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  // ===== 預覽列印 =====
  const generatePrintContent = () => {
    const f = form
    const makeLunarStr = (gl, isLunar) => {
      if (!gl.year || !gl.month || !gl.day) return '___年___月___日'
      try {
        const gregYear = isLunar ? parseInt(gl.year) + 1911 : parseInt(gl.year)
        const info = getLunarInfo(gregYear, parseInt(gl.month), parseInt(gl.day))
        return `${info.lunarMonthName}${info.lunarDayName}`
      } catch { return '___月___日' }
    }

    // 專業 HTML 格式
    const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Serif TC', 'PingFang TC', 'Microsoft JhengHei', serif; padding: 30px 20px; background: #fff; }
  .header { text-align: center; border-bottom: 3px double #8B4513; padding-bottom: 15px; margin-bottom: 25px; }
  .header h1 { font-size: 26px; color: #8B4513; letter-spacing: 8px; margin-bottom: 8px; }
  .header .company { font-size: 13px; color: #666; }
  .section { margin-bottom: 20px; }
  .section-title { background: linear-gradient(to right, #D2691E, #F4A460); color: white; padding: 8px 15px; font-size: 14px; font-weight: bold; border-radius: 4px; margin-bottom: 10px; }
  .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
  .info-item { background: #FFF8DC; padding: 8px 12px; border-radius: 4px; border-left: 3px solid #D2691E; }
  .info-item label { font-size: 11px; color: #888; display: block; }
  .info-item span { font-size: 14px; color: #333; font-weight: bold; }
  .info-row { display: flex; gap: 20px; margin-bottom: 8px; }
  .info-box { flex: 1; background: #FFF8DC; padding: 10px 12px; border-radius: 4px; border-left: 3px solid #D2691E; }
  .info-box label { font-size: 11px; color: #888; display: block; margin-bottom: 3px; }
  .info-box span { font-size: 14px; color: #333; font-weight: bold; }
  .shafa-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .shafa-item { background: #FFF5EE; padding: 6px 10px; border-radius: 4px; text-align: center; }
  .shafa-item label { font-size: 10px; color: #888; display: block; }
  .shafa-item span { font-size: 13px; color: #333; font-weight: bold; }
  .shafa-item.two-col { grid-column: span 1; }
  .zuoxiang { display: flex; gap: 15px; margin-top: 10px; }
  .zuoxiang-item { flex: 1; background: #FFF8DC; padding: 10px; border-radius: 4px; text-align: center; }
  .zuoxiang-item label { font-size: 12px; color: #888; }
  .zuoxiang-item span { font-size: 18px; color: #8B4513; font-weight: bold; }
  .date-section { background: #FAFAFA; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #E8E8E8; }
  .date-section h4 { font-size: 13px; color: #8B4513; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px dashed #DDD; }
  .date-row { display: flex; gap: 10px; align-items: center; margin-bottom: 6px; }
  .date-row label { font-size: 11px; color: #888; min-width: 35px; }
  .date-row span { font-size: 14px; color: #333; }
  .family-list { background: #FAFAFA; padding: 10px; border-radius: 6px; }
  .family-item { display: flex; gap: 10px; padding: 6px 0; border-bottom: 1px dashed #EEE; }
  .family-item:last-child { border-bottom: none; }
  .family-item .num { font-size: 12px; color: #888; min-width: 20px; }
  .family-item .name { font-size: 14px; color: #333; flex: 1; }
  .family-item .relation { font-size: 12px; color: #666; }
  .family-item .zodiac { font-size: 12px; color: #D2691E; }
  .notes-section { background: #FAFAFA; padding: 12px; border-radius: 6px; margin-top: 10px; }
  .notes-section h4 { font-size: 13px; color: #8B4513; margin-bottom: 8px; }
  .notes-text { font-size: 13px; color: #555; line-height: 1.8; white-space: pre-wrap; }
  .footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 2px solid #DDD; color: #999; font-size: 11px; }
  @media print { body { padding: 20px 15px; } }
</style>
</head>
<body>
  <div class="header">
    <h1>通 書 擇 日</h1>
    <div class="company">傳承生命事業有限公司</div>
  </div>

  <div class="section">
    <div class="section-title">【基本資料】</div>
    <div class="info-grid">
      <div class="info-item"><label>姓　　名</label><span>${f.name || '____________'}</span></div>
      <div class="info-item"><label>性　　別</label><span>${f.gender || '___'}</span></div>
      <div class="info-item"><label>年　　齡</label><span>${f.age ? f.age + ' 歲' : '___'}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">【本命五行】</div>
    <div class="info-grid">
      <div class="info-item"><label>本　　命</label><span>${f.benMing || '___'}</span></div>
      <div class="info-item"><label>納　　音</label><span>${f.naYin || '___'}</span></div>
      <div class="info-item"><label>本 命 煞</label><span>${f.benMingSha || '___'}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">【煞神沖合】</div>
    <div class="shafa-grid">
      <div class="shafa-item"><label>三　合</label><span>${f.sanHe || '___'}</span></div>
      <div class="shafa-item"><label>相　沖</label><span>${f.xiangChong || '___'}</span></div>
      <div class="shafa-item"><label>刺害煞</label><span>${f.ciHaiSha || '___'}</span></div>
      <div class="shafa-item"><label>六　合</label><span>${f.liuHe || '___'}</span></div>
      <div class="shafa-item"><label>三　殺</label><span>${f.sanSha || '___'}</span></div>
      <div class="shafa-item"><label>年　煞</label><span>${f.nianSha || '___'}</span></div>
      <div class="shafa-item"><label>堆　貴</label><span>${f.duiGui || '___'}</span></div>
      <div class="shafa-item"><label>三　刑</label><span>${f.sanXing || '___'}</span></div>
      <div class="shafa-item"><label>月　煞</label><span>${f.yueSha || '___'}</span></div>
      <div class="shafa-item two-col"><label>回頭殺</label><span>${f.huiTouSha || '___'}</span></div>
      <div class="shafa-item two-col"><label>日　煞</label><span>${f.riSha || '___'}</span></div>
    </div>
    <div style="background:#FFF8DC;padding:10px;border-radius:6px;margin-top:10px;font-size:12px;color:#666;">
      <b>五行關係：</b>本命剋山頭為進 ｜ 山頭生本命為發 ｜ 山頭剋本命為敗 ｜ 本命生山頭為洩
    </div>
  </div>

  <div class="section">
    <div class="section-title">【座　　向】</div>
    <div class="zuoxiang">
      <div class="zuoxiang-item"><label>座</label><span>${f.zuo || '____'}</span></div>
      <div class="zuoxiang-item"><label>向</label><span>${f.xiang || '____'}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">【重要日期】</div>
    <div class="date-section">
      <h4>◆ 對年（進金）</h4>
      <div class="date-row"><label>民國</label><span>${f.duiNian_nongLi.year || '___'} 年 ${f.duiNian_nongLi.month || '__'} 月 ${f.duiNian_nongLi.day || '__'} 日</span></div>
    </div>
    <div class="date-section">
      <h4>◆ 三年（合爐）</h4>
      <div class="date-row"><label>民國</label><span>${f.sanNian_nongLi.year || '___'} 年 ${f.sanNian_nongLi.month || '__'} 月 ${f.sanNian_nongLi.day || '__'} 日</span></div>
    </div>
    <div class="date-section">
      <h4>◆ 擇合爐日</h4>
      <div class="date-row"><label>民國</label><span>${f.zeHeLu_nongLi.year || '___'} 年 ${f.zeHeLu_nongLi.month || '__'} 月 ${f.zeHeLu_nongLi.day || '__'} 日</span></div>
      <div style="display:flex;gap:15px;margin-top:8px;">
        <div><label>正沖</label><span>${f.zeHeLu_zhengChong || '___'}</span></div>
        <div><label>安位</label><span>${f.zeHeLu_anWei || '___'}</span></div>
        <div><label>時煞</label><span>${f.zeHeLu_shiSha || '___'}</span></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">【家屬資料】</div>
    <div class="family-list">
      ${Array.isArray(f.family) && f.family.length > 0 ? f.family.map((fm, i) => `
      <div class="family-item">
        <span class="num">${i + 1}.</span>
        <span class="name">${fm.name || '___'}</span>
        <span class="relation">（${fm.relation || '親屬'}）</span>
        <span class="zodiac">${fm.zodiac ? '生肖：' + fm.zodiac : ''}</span>
      </div>`).join('') : '<div style="color:#888;font-size:13px;">（無）</div>'}
    </div>
  </div>

  ${f.notes ? `
  <div class="section">
    <div class="section-title">【備註】</div>
    <div class="notes-section">
      <div class="notes-text">${f.notes}</div>
    </div>
  </div>` : ''}

  <div class="footer">
    僅供參考 ｜ 傳承生命事業有限公司 ｜ 查詢電話：請至本公司官網
  </div>
</body>
</html>`
    return html
  }

  const openPreview = () => {
    setPreviewContent(generatePrintContent())
    setShowPreview(true)
  }

  const confirmPrint = () => {
    const win = window.open('', '_blank')
    win.document.write(previewContent)
    win.document.close()
    setTimeout(() => { win.print() }, 500)
    setShowPreview(false)
  }

  const handlePrint = () => {
    openPreview()
  }

  // ===== 月曆工具 =====
  const getMonthData = () => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
    const cells = []
    const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i; const m = viewMonth === 1 ? 12 : viewMonth - 1
      const y = viewMonth === 1 ? viewYear - 1 : viewYear
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false })
    }
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true })
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 12 ? 1 : viewMonth + 1
      const y = viewMonth === 12 ? viewYear + 1 : viewYear
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false })
    }
    return cells
  }
  const dateKey = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const prevMonth = () => { if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) } else setViewMonth(m => m + 1) }
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth() + 1) }

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

  // ===== 行事曆快速輸入 =====
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

  const cancelInlineEdit = () => {
    setInlineEditDate(null)
    setInlineEditText('')
  }

  // ===== 日期勾選 =====
  const toggleDateSelection = (cell) => {
    if (!cell.isCurrentMonth) return
    const key = dateKey(cell.year, cell.month, cell.day)
    const newSelected = { ...selectedDates }
    if (newSelected[key]) {
      delete newSelected[key]
    } else {
      const lunar = getLunarInfo(cell.year, cell.month, cell.day)
      newSelected[key] = {
        year: cell.year,
        month: cell.month,
        day: cell.day,
        lunar: `${lunar.lunarMonthName}${lunar.lunarDayName}`,
        ganZhi: lunar.ganZhiDay,
        chong: lunar.chongZodiac
      }
    }
    setSelectedDates(newSelected)
  }

  const exportSelectedDates = () => {
    const keys = Object.keys(selectedDates).sort()
    if (keys.length === 0) {
      alert('請先勾選要輸出的日期')
      return
    }
    
    const lines = []
    lines.push('═══════════════════════════════════════')
    lines.push('         擇日服務行事曆 - 日課清單')
    lines.push(`         匯出日期：${new Date().toLocaleDateString('zh-TW')}`)
    lines.push('═══════════════════════════════════════')
    lines.push('')
    lines.push(`共選取 ${keys.length} 個日期`)
    lines.push('')
    lines.push('日期列表：')
    lines.push('───────────────────────────────────────')
    
    keys.forEach((key, idx) => {
      const data = selectedDates[key]
      lines.push(`${idx + 1}. ${key}`)
      lines.push(`   農曆：${data.lunar}`)
      lines.push(`   干支：${data.ganZhi}`)
      if (data.chong) lines.push(`   日沖：${data.chong}`)
      lines.push('')
    })
    
    lines.push('───────────────────────────────────────')
    lines.push('')
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

  const clearSelection = () => setSelectedDates({})

  const getWeekday = (y, m, d) => {
    const dayNames = ['日', '一', '二', '三', '四', '五', '六']
    const date = new Date(y, m - 1, d)
    return dayNames[date.getDay()]
  }

  const cells = getMonthData()

  // ===== TAB: 通書擇日 =====
  const TongShuTab = () => (
    <div className="px-3 py-4 space-y-4">
      {/* 標題 */}
      <div className="text-center py-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/50 to-transparent rounded-3xl"></div>
        <h2 className="text-2xl font-bold text-amber-700 tracking-widest relative z-10">通 書 擇 日</h2>
        <p className="text-xs text-amber-400 mt-2 font-medium relative z-10">傳承生命事業有限公司</p>
      </div>

      {/* 基本資料 */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5 flex items-center gap-2">
          <FileText size={14} className="text-white" />
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

          {/* 五行關係說明 */}
          <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 grid grid-cols-2 gap-1 font-medium">
            <span>本命 剋 山頭 → 進</span>
            <span>山頭 生 本命 → 發</span>
            <span>山頭 剋 本命 → 敗</span>
            <span>本命 生 山頭 → 洩</span>
          </div>
        </div>
      </div>

      {/* 本命五行 */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="bg-amber-600 px-4 py-2.5">
          <span className="text-white font-bold text-sm">本命五行</span>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {[
            { label: '本命', field: 'benMing' },
            { label: '納音', field: 'naYin' },
            { label: '本命煞', field: 'benMingSha' }
          ].map(item => (
            <div key={item.field}>
              <label className="text-[10px] text-gray-400 font-bold uppercase">{item.label}</label>
              <input value={form[item.field] || ''} onChange={e => updateForm(item.field, e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" />
            </div>
          ))}
        </div>
      </div>

      {/* 煞神沖合 */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="bg-amber-600 px-4 py-2.5">
          <span className="text-white font-bold text-sm">煞神沖合</span>
        </div>
        <div className="p-4 space-y-2">
          {/* 列1：三合、相沖、刺害煞 */}
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-[10px] text-gray-400 font-bold">三合</label>
              <input value={form.sanHe} onChange={e => updateForm('sanHe', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
            <div><label className="text-[10px] text-gray-400 font-bold">相沖</label>
              <input value={form.xiangChong} onChange={e => updateForm('xiangChong', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
            <div><label className="text-[10px] text-gray-400 font-bold">刺害煞</label>
              <input value={form.ciHaiSha} onChange={e => updateForm('ciHaiSha', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
          </div>
          {/* 列2：六合、三殺、年煞 */}
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-[10px] text-gray-400 font-bold">六合</label>
              <input value={form.liuHe} onChange={e => updateForm('liuHe', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
            <div><label className="text-[10px] text-gray-400 font-bold">三殺</label>
              <input value={form.sanSha} onChange={e => updateForm('sanSha', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
            <div><label className="text-[10px] text-gray-400 font-bold">年煞</label>
              <input value={form.nianSha} onChange={e => updateForm('nianSha', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
          </div>
          {/* 列3：堆貴、三刑、月煞 */}
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-[10px] text-gray-400 font-bold">堆貴</label>
              <input value={form.duiGui} onChange={e => updateForm('duiGui', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
            <div><label className="text-[10px] text-gray-400 font-bold">三刑</label>
              <input value={form.sanXing} onChange={e => updateForm('sanXing', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
            <div><label className="text-[10px] text-gray-400 font-bold">月煞</label>
              <input value={form.yueSha} onChange={e => updateForm('yueSha', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
          </div>
          {/* 列4：回頭殺、日煞 */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-gray-400 font-bold">回頭殺</label>
              <input value={form.huiTouSha} onChange={e => updateForm('huiTouSha', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
            <div><label className="text-[10px] text-gray-400 font-bold">日煞</label>
              <input value={form.riSha} onChange={e => updateForm('riSha', e.target.value)}
                className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" /></div>
          </div>
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

      {/* 對年 / 三年 / 擇合爐日 */}
      {[
        {
          title: '對年', gKey: 'duiNian_gongLi', nKey: 'duiNian_nongLi',
          showExtra: false
        },
        {
          title: '三年', gKey: 'sanNian_gongLi', nKey: 'sanNian_nongLi',
          showExtra: false
        },
        {
          title: '擇合爐日', gKey: 'zeHeLu_gongLi', nKey: 'zeHeLu_nongLi',
          zhengChong: 'zeHeLu_zhengChong', anWei: 'zeHeLu_anWei', shiSha: 'zeHeLu_shiSha',
          showExtra: true
        }
      ].map(section => (
        <div key={section.title} className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5">
            <span className="text-white font-bold text-sm">【{section.title}】</span>
          </div>
          <div className="p-4 space-y-3">
            {/* 農曆（民國年） */}
            <div>
              <RocYearPicker 
                label="民國" 
                value={form[section.nKey]} 
                onChange={val => updateForm(section.nKey, val)} 
              />
            </div>
            {/* 額外欄位（擇合爐日才有） */}
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

      {/* 家屬 */}
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
          {(Array.isArray(form.family) ? form.family : []).map((fm, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 font-bold">姓名</label>
                <input value={fm.name} onChange={e => updateFamily(idx, 'name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200" />
              </div>
              <div className="w-20">
                <label className="text-[10px] text-gray-400 font-bold">稱謂</label>
                <input value={fm.relation} onChange={e => updateFamily(idx, 'relation', e.target.value)}
                  className="w-full mt-1 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-200" />
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
          placeholder="輸入備註事項..." />
      </div>

      {/* 列印按鈕 */}
      <button onClick={handlePrint}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl text-sm font-bold hover:shadow-lg transition">
        <Printer size={16} /> 列印 / 匯出
      </button>

      <div className="text-center text-amber-300 text-[10px] pb-2">
        資料自動儲存 ｜ 僅供參考
      </div>
    </div>
  )

  // ===== TAB: 行事曆（維持原功能）=====
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
            <div 
              key={key} 
              onClick={() => selectionMode ? toggleDateSelection(cell) : (cell.isCurrentMonth && !isInlineEditing && openDay(cell))}
              className={`min-h-[88px] bg-white rounded-xl p-1.5 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden
                ${!cell.isCurrentMonth ? 'bg-gray-50 opacity-50' : 'shadow-sm hover:shadow-md'} 
                ${isToday ? 'ring-2 ring-amber-400 shadow-lg ring-offset-1' : ''}
                ${isSelected ? 'bg-amber-50 ring-2 ring-amber-500' : ''}
                ${selectionMode && cell.isCurrentMonth ? 'cursor-pointer' : ''}
                ${isWeekend && cell.isCurrentMonth ? 'bg-gradient-to-b from-red-50/30 to-transparent' : ''}`}
            >
              {/* 裝飾角標 */}
              {isToday && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-amber-500 border-l-[20px] border-l-transparent"></div>
              )}
              {selectionMode && cell.isCurrentMonth && (
                <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs z-10 transition-all
                  ${isSelected ? 'bg-amber-500 text-white shadow-lg scale-110' : 'bg-gray-200/80 text-gray-500'}`}>
                  {isSelected ? <Check size={12} /> : <span className="text-[10px]">{cell.day}</span>}
                </div>
              )}
              <div className={`text-sm font-bold mb-0.5 ${isWeekend ? (idx % 7 === 0 ? 'text-red-500' : 'text-orange-400') : 'text-gray-700'}`}>
                {!selectionMode && cell.day}{isToday && !selectionMode && <span className="ml-0.5 text-[8px] bg-amber-500 text-white rounded-full px-1 py-0.5 font-medium">今</span>}
              </div>
              {cell.isCurrentMonth && (
                <div className="text-[9px] text-gray-400 leading-tight space-y-0.5">
                  {lunar.lunarMonthName && <div className="text-amber-500 font-medium truncate">{lunar.lunarMonthName}{lunar.lunarDayName}</div>}
                  {lunar.ganZhiDay && <div className="text-gray-400 truncate">{lunar.ganZhiDay}</div>}
                  {lunar.chongZodiac && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 text-orange-500 rounded px-1 py-0.5 text-[8px] font-medium mt-0.5 truncate">
                      沖{lunar.chongZodiac}
                    </div>
                  )}
                </div>
              )}
              
              {/* 快速輸入框 */}
              {isInlineEditing ? (
                <div className="mt-1" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={inlineEditText}
                    onChange={e => setInlineEditText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveInlineEdit()
                      if (e.key === 'Escape') cancelInlineEdit()
                    }}
                    onBlur={saveInlineEdit}
                    autoFocus
                    className="w-full px-1 py-1 text-[9px] border border-amber-300 rounded-lg bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-sm"
                    placeholder="輸入..."
                  />
                </div>
              ) : dayEvents ? (
                <div 
                  onClick={(e) => startInlineEdit(cell, e)}
                  className="mt-1 text-[8px] bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-lg px-1.5 py-1 truncate leading-tight font-medium border border-amber-100 cursor-text shadow-sm hover:shadow-md transition"
                  title="點擊編輯"
                >
                  {dayEvents}
                </div>
              ) : (
                cell.isCurrentMonth && !selectionMode && (
                  <div 
                    onClick={(e) => startInlineEdit(cell, e)}
                    className="mt-1 text-center cursor-text opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="inline-flex items-center justify-center w-4 h-4 bg-amber-50 rounded-full text-amber-300 hover:bg-amber-100 hover:text-amber-400 transition"><Plus size={8} /></span>
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>
      
      {/* 勾選模式工具列 */}
      {selectionMode && (
        <div className="mx-2 mt-3 bg-white rounded-2xl p-4 shadow-lg border border-amber-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Check size={16} className="text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-700">已選取</div>
                <div className="text-xs text-gray-400"><span className="text-amber-600 font-bold">{Object.keys(selectedDates).length}</span> 個日期</div>
              </div>
            </div>
            <button 
              onClick={clearSelection}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition"
            >
              清除
            </button>
          </div>
          <button 
            onClick={exportSelectedDates}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Download size={14} /> 匯出為文字檔
          </button>
        </div>
      )}

      <div className="px-4 mt-4 space-y-2">
        {/* 快速說明提示 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <CalendarIcon size={14} className="text-amber-500" />
            <span className="font-medium">提示：點擊日期可新增/檢視記事，長按日期進入勾選模式</span>
          </div>
        </div>
        
        <button onClick={() => { setShowNotes(!showNotes); setEditNotes(false) }}
          className="w-full flex items-center gap-2 bg-white border border-amber-200 rounded-2xl px-4 py-3 text-sm text-gray-600 hover:shadow-md transition-all">
          <BookOpen size={16} className="text-amber-400" />
          <span className="font-medium">備註事項說明</span>
          <span className="ml-auto text-gray-400">{showNotes ? '▲' : '▼'}</span>
        </button>
        {showNotes && !editNotes && (
          <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm">
            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{notes}</pre>
            <button onClick={() => setEditNotes(true)} className="mt-3 text-xs text-amber-600 font-bold hover:text-amber-700 transition flex items-center gap-1">
              <Edit3 size={12} /> 編輯備註
            </button>
          </div>
        )}
        {showNotes && editNotes && (
          <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
              className="w-full text-sm text-gray-600 resize-none focus:outline-none border border-gray-200 rounded-xl p-3" />
            <div className="flex gap-2 mt-3">
              <button onClick={() => { const d = '📋 備註事項說明\n記錄重要的择日參考資訊'; setNotes(d); saveNotes(d) }}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">重設</button>
              <button onClick={() => { saveNotes(notes); setEditNotes(false) }}
                className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition flex items-center justify-center gap-1">
                <Save size={14} /> 儲存
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )

  // ===== 事件彈窗 =====
  const EventModal = () => {
    if (!selectedDate) return null
    const [y, m, d] = selectedDate.split('-').map(Number)
    const lunar = getLunarInfo(y, m, d)
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][new Date(y, m - 1, d).getDay()]
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fadeIn" onClick={closeModal}>
        <div className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
          {/* 頂部裝飾條 */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5"></div>
          
          <div className="p-5 pb-8">
            <div className="w-12 h-1 bg-amber-300 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedDate}</h2>
                <p className="text-xs text-amber-500 mt-0.5">星期{weekday}</p>
              </div>
              <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                <X size={22} />
              </button>
            </div>
            
            {/* 農曆資訊卡 */}
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-4 mb-4 border border-amber-100 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-medium mb-1">農曆</div>
                  <div className="text-amber-700 font-bold">{lunar.lunarMonthName}{lunar.lunarDayName}</div>
                </div>
                <div className="bg-white/80 rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-medium mb-1">歲次</div>
                  <div className="text-amber-700 font-bold">{lunar.ganZhiYear}年</div>
                </div>
                <div className="bg-white/80 rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-medium mb-1">日干支</div>
                  <div className="text-amber-700 font-bold">{lunar.ganZhiDay}</div>
                </div>
                {lunar.chongZodiac && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 shadow-sm border border-orange-100">
                    <div className="text-[10px] text-orange-400 font-medium mb-1">日沖</div>
                    <div className="text-orange-600 font-bold text-lg">{lunar.chongZodiac}</div>
                    <div className="text-orange-400 text-[10px]">({getChongSuiList(lunar.chongZodiac)})</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 備註輸入 */}
            <textarea 
              value={eventText} 
              onChange={e => setEventText(e.target.value)} 
              placeholder="輸入備註事項..." 
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition shadow-sm" 
            />
            
            {/* 按鈕區 */}
            <div className="flex gap-2 mt-4">
              <button onClick={deleteEvent} className="flex items-center gap-1.5 px-4 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition">
                <Trash2 size={14} /> 刪除
              </button>
              <button onClick={saveEvent} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition flex items-center justify-center gap-1.5">
                <Save size={14} /> 儲存
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-amber-50 to-orange-50 min-h-screen pb-8 shadow-2xl border-x border-amber-100 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 px-4 py-4 text-white shadow-lg relative overflow-hidden">
        {/* 裝飾背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-white rounded-full blur-2xl"></div>
        </div>
        
        <h1 className="text-lg font-bold text-center flex items-center justify-center gap-2 relative z-10">
          <CalendarIcon size={20} className="text-amber-100" /> 
          <span className="bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">擇日服務行事曆</span>
        </h1>

        {/* 分頁 */}
        <div className="flex gap-2 mt-3 relative z-10">
          {[
            { id: 'tongshu', label: '📋 通書', icon: FileText },
            { id: 'calendar', label: '📅 行事曆', icon: CalendarIcon }
          ].map(tab => (
            <button key={tab.id} onClick={() => {
                if (tab.id !== activeTab) {
                  setTabTransition(true)
                  setTimeout(() => { setActiveTab(tab.id); setTabTransition(false) }, 150)
                }
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5
                ${activeTab === tab.id ? 'bg-white text-amber-600 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}`}>
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 月份導航（只在行事曆頁顯示） */}
        {activeTab === 'calendar' && (
          <div className="flex items-center justify-between mt-3 relative z-10">
            <button onClick={prevMonth} className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition backdrop-blur-sm active:scale-95">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <div className="text-xl font-bold tracking-wide drop-shadow">{viewYear}年 {viewMonth}月</div>
              <button onClick={goToday} className="text-xs bg-white/25 hover:bg-white/35 px-4 py-1.5 rounded-full mt-1.5 transition backdrop-blur font-medium active:scale-95">
                今天
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectionMode(!selectionMode)} 
                className={`p-2.5 rounded-xl transition backdrop-blur-sm active:scale-95
                  ${selectionMode ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                title="勾選模式"
              >
                <Check size={20} />
              </button>
              <button onClick={nextMonth} className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition backdrop-blur-sm active:scale-95">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 星期抬頭 */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-7 bg-gradient-to-r from-amber-600 to-orange-500 text-center text-xs font-bold py-2.5 shadow-sm mx-2 mt-2 rounded-t-xl">
          {weekdayNames.map((w, i) => (
            <div key={i} className={`${i === 0 ? 'text-red-200' : i === 6 ? 'text-orange-200' : 'text-amber-100'}`}>週{w}</div>
          ))}
        </div>
      )}

      {/* 內容 */}
      <div className={`transition-opacity duration-150 ${tabTransition ? 'opacity-0' : 'opacity-100'}`}>
        {activeTab === 'tongshu' && <TongShuTab />}
        {activeTab === 'calendar' && <CalendarTab />}
      </div>

      {/* 版權 */}
      <div className="text-center py-6 px-4">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-4 inline-block">
          <div className="text-amber-600 text-xs font-medium">傳承生命事業有限公司</div>
          <div className="text-amber-400 text-[10px] mt-1">擇日服務行事曆 · 僅供參考</div>
        </div>
      </div>

      {selectedDate && <EventModal />}

      {/* 預覽列印彈窗 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-slideUp">
            <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-3 flex items-center justify-between">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Printer size={18} /> 預覽列印
              </h2>
              <button onClick={() => setShowPreview(false)} className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <iframe 
                srcDoc={previewContent}
                className="w-full h-full min-h-[500px] bg-white rounded-xl border border-gray-200 shadow-inner"
                title="Print Preview"
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
              <button 
                onClick={() => setShowPreview(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-white hover:shadow-sm transition"
              >
                取消
              </button>
              <button 
                onClick={confirmPrint}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Printer size={16} /> 確認列印
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
