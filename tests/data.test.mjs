import test from 'node:test'
import assert from 'node:assert/strict'
import { filterRows, paginate, nextId, validateUser, validateQuestion, prepareQuestion, initialUsers, initialQuestions, loadRows, saveRows } from '../src/data.mjs'

test('查询去除首尾空格、忽略大小写，分页使用真实结果', () => {
  const rows = [{ id: 1, name: 'Alice' }, { id: 7, name: 'alice2' }, { id: 10, name: 'Bob' }]
  const result = filterRows(rows, 'name', ' ALICE ')
  assert.equal(result.length, 2)
  assert.deepEqual(paginate(result, 2, 1), [rows[1]])
  assert.deepEqual(paginate(result, 3, 1), [])
  assert.equal(nextId(rows), 11)
  assert.equal(nextId([]), 1)
})
test('用户拒绝空名、重复用户名、短密码和不一致密码；编辑自身可留空密码', () => {
  const form = { name: '测试用户', password: '123456', confirmPassword: '123456' }
  assert.equal(validateUser(form, initialUsers, null), '')
  assert.match(validateUser({ ...form, name: '  ' }, initialUsers, null), /用户名/)
  assert.match(validateUser({ ...form, name: '王小虎' }, initialUsers, null), /已存在/)
  assert.match(validateUser({ ...form, password: '123' }, initialUsers, null), /长度/)
  assert.match(validateUser({ ...form, confirmPassword: '654321' }, initialUsers, null), /不一致/)
  assert.equal(validateUser({ name: '王小虎', password: '', confirmPassword: '' }, initialUsers, 1), '')
})
test('题目必须有题干、四个不同选项和有效答案', () => {
  const form = initialQuestions[0]
  assert.equal(validateQuestion(form), '')
  assert.match(validateQuestion({ ...form, question: ' ' }), /题目/)
  assert.match(validateQuestion({ ...form, options: ['', 'b', 'c', 'd'] }), /四个选项/)
  assert.match(validateQuestion({ ...form, options: ['a', 'a ', 'c', 'd'] }), /重复/)
  assert.match(validateQuestion({ ...form, answer: 'E' }), /正确选项/)
})
test('题目校验失败不改写答案，修正后可以直接重试；支持答案内容和字母', () => {
  const form = { question: '', options: ['巴黎', '伦敦', '柏林', '马德里'], answer: ' 巴黎 ' }
  const original = JSON.stringify(form)
  assert.match(validateQuestion(prepareQuestion(form)), /题目/)
  assert.equal(JSON.stringify(form), original)
  form.question = '法国首都？'
  assert.equal(validateQuestion(prepareQuestion(form)), '')
  assert.equal(prepareQuestion(form).answer, 'A')
  assert.equal(prepareQuestion({ ...form, answer: 'b' }).answer, 'B')
})
test('存储可往返、已删除的空列表不被重新填充、损坏的数据会报错', () => {
  const memory = new Map()
  globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) }
  const seed = loadRows('users', initialUsers)
  seed[0].name = '修改后的名字'
  assert.notEqual(seed[0].name, initialUsers[0].name)
  saveRows('users', seed)
  assert.equal(loadRows('users', initialUsers)[0].name, '修改后的名字')
  saveRows('users', [])
  assert.deepEqual(loadRows('users', initialUsers), [])
  saveRows('questions', initialQuestions)
  assert.deepEqual(loadRows('questions', []), initialQuestions)
  memory.set('lesson5-quiz-admin-v1-questions', '{broken')
  assert.throws(() => loadRows('questions', initialQuestions))
  saveRows('users', [{ ...initialUsers[0] }, { ...initialUsers[0] }])
  assert.throws(() => loadRows('users', initialUsers))
})
test('旧示例自动换为新题，保留自定义题、已删除记录和用户管理数据', () => {
  const memory = new Map()
  globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) }
  const old = id => ({ id, question: '法国的首都是哪个城市？', options: ['巴黎', '伦敦', '柏林', '马德里'], answer: 'A' })
  const edited = { ...old(2), question: '自己编辑的题目' }
  const custom = { ...old(5), question: '自己添加的题目' }
  saveRows('questions', [old(1), edited, old(4), custom])
  const result = loadRows('questions', initialQuestions)
  assert.deepEqual(result, [initialQuestions[0], edited, initialQuestions[3], custom])
  saveRows('questions', [])
  assert.deepEqual(loadRows('questions', initialQuestions), [])
  saveRows('users', initialUsers)
  assert.deepEqual(loadRows('users', initialUsers), initialUsers)
})
