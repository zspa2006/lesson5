import { filterRows, paginate, loadRows, saveRows } from './data.mjs'

export default function manager(kind, fallback, field) {
  return {
    data: () => ({ rows: [], keyword: '', appliedKeyword: '', page: 1, pageSize: 10, dialogVisible: false, editingId: null, formError: '', storageError: false }),
    computed: {
      filteredRows() { return filterRows(this.rows, field, this.appliedKeyword) },
      pageRows() { return paginate(this.filteredRows, this.page, this.pageSize) }
    },
    created() {
      try { this.rows = loadRows(kind, fallback) }
      catch { this.storageError = true }
    },
    methods: {
      search() { this.appliedKeyword = this.keyword; this.page = 1 },
      resetSearch() { this.keyword = ''; this.search() },
      changeSize() { this.page = 1 },
      commit(rows) {
        try { saveRows(kind, rows) }
        catch { this.$message.error('保存失败：浏览器存储不可用或空间不足'); return false }
        this.rows = rows
        this.page = Math.max(1, Math.min(this.page, Math.ceil(this.filteredRows.length / this.pageSize)))
        return true
      },
      async remove(row) {
        try { await this.$confirm(`确定删除“${row[field]}”吗？删除后无法恢复。`, '删除确认', { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }) }
        catch { return }
        if (this.commit(this.rows.filter(item => item.id !== row.id))) this.$message.success('删除成功')
      },
      async restore() {
        try { await this.$confirm('恢复后将覆盖当前页面的全部数据，是否继续？', '恢复示例数据', { type: 'warning', confirmButtonText: '恢复', cancelButtonText: '取消' }) }
        catch { return }
        if (this.commit(JSON.parse(JSON.stringify(fallback)))) { this.storageError = false; this.resetSearch(); this.$message.success('已恢复示例数据') }
      },
      finishSave(row) {
        const rows = this.editingId ? this.rows.map(item => item.id === this.editingId ? row : item) : [...this.rows, row]
        if (!this.commit(rows)) return
        this.resetSearch()
        if (!this.editingId) this.page = Math.ceil(this.rows.length / this.pageSize)
        this.dialogVisible = false
        this.$message.success(this.editingId ? '修改成功' : '添加成功')
      }
    }
  }
}
