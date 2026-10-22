export const letters = ['A', 'B', 'C', 'D']
export const initialUsers = [
  { id: 1, date: '2016-05-02', name: '王小虎', address: '上海市普陀区金沙江路 1518 弄' },
  { id: 2, date: '2016-05-04', name: '王小虎', address: '上海市普陀区金沙江路 1517 弄' },
  { id: 3, date: '2016-05-01', name: '王小虎', address: '上海市普陀区金沙江路 1519 弄' },
  { id: 4, date: '2016-05-03', name: '王小虎', address: '上海市普陀区金沙江路 1516 弄' }
]
export const initialQuestions = [
  { id: 1, question: 'Vue 列表渲染时，用哪个属性为每一项提供唯一标识？', options: ['class', 'key', 'style', 'title'], answer: 'B' },
  { id: 2, question: '在 Vue 模板中，监听按钮点击事件可以使用哪种写法？', options: ['v-for', 'v-model', '@click', 'v-if'], answer: 'C' },
  { id: 3, question: '要让容器采用 Flex 弹性布局，应设置哪个样式？', options: ['display: flex', 'display: block', 'position: fixed', 'overflow: hidden'], answer: 'A' },
  { id: 4, question: '将 JSON 字符串转换为 JavaScript 对象，应使用哪个方法？', options: ['JSON.stringify()', 'Object.keys()', 'Array.from()', 'JSON.parse()'], answer: 'D' }
]

export function filterRows(rows, field, keyword) {
  const query = keyword.trim().toLocaleLowerCase()
  return rows.filter(row => row[field].toLocaleLowerCase().includes(query))
}
export function paginate(rows, page, size) { return rows.slice((page - 1) * size, page * size) }
export function nextId(rows) { return Math.max(0, ...rows.map(row => row.id)) + 1 }
export function validateUser(form, rows, editingId) {
  if (!form.name.trim()) return '请输入用户名'
  if (form.name.trim().length > 20) return '用户名不能超过 20 个字符'
  if ((!editingId || rows.find(row => row.id === editingId)?.name !== form.name.trim()) && rows.some(row => row.id !== editingId && row.name.toLocaleLowerCase() === form.name.trim().toLocaleLowerCase())) return '该用户名已存在'
  if (!editingId || form.password || form.confirmPassword) {
    if (form.password.length < 6 || form.password.length > 32) return '密码长度应为 6–32 位'
    if (form.password !== form.confirmPassword) return '两次输入的密码不一致'
  }
  return ''
}
export function prepareQuestion(form) {
  const options = form.options.map(option => option.trim())
  const answerText = form.answer.trim()
  const index = options.findIndex(option => option && option === answerText)
  return { ...form, question: form.question.trim(), options, answer: index >= 0 ? letters[index] : answerText.toUpperCase() }
}
export function validateQuestion(form) {
  if (!form.question.trim()) return '请输入题目'
  if (form.options.some(option => !option.trim())) return '请填写完整的四个选项'
  if (new Set(form.options.map(option => option.trim())).size !== 4) return '四个选项不能重复'
  if (!letters.includes(form.answer)) return '请输入正确选项的内容或字母 A、B、C、D'
  return ''
}

const key = kind => `lesson5-quiz-admin-v1-${kind}`
export function loadRows(kind, fallback) {
  const raw = localStorage.getItem(key(kind))
  if (raw === null) return JSON.parse(JSON.stringify(fallback))
  const rows = JSON.parse(raw)
  const valid = Array.isArray(rows) && rows.every(row => row && Number.isSafeInteger(row.id) && row.id > 0 && (
    kind === 'users'
      ? typeof row.name === 'string' && typeof row.date === 'string' && typeof row.address === 'string'
      : typeof row.question === 'string' && Array.isArray(row.options) && row.options.length === 4 && row.options.every(o => typeof o === 'string') && letters.includes(row.answer)
  )) && new Set(rows.map(row => row.id)).size === rows.length
  if (!valid) throw new Error('Invalid stored data')
  // 仅替换旧版本未修改过的课堂示例，保留用户自行编辑或添加的题目。
  if (kind === 'questions') {
    return rows.map(row => {
      const replacement = initialQuestions.find(item => item.id === row.id)
      const isOldExample = row.question === '法国的首都是哪个城市？' && row.answer === 'A' &&
        JSON.stringify(row.options) === JSON.stringify(['巴黎', '伦敦', '柏林', '马德里'])
      return replacement && isOldExample ? JSON.parse(JSON.stringify(replacement)) : row
    })
  }
  return rows
}
// 先写入存储，成功后再更新页面，避免保存失败时误报成功。
export function saveRows(kind, rows) { localStorage.setItem(key(kind), JSON.stringify(rows)) }
