<template>
  <el-container style="min-height: 100vh" direction="vertical">
    <el-header class="quiz-header">Quiz后台管理</el-header>
    <el-container>
      <el-aside width="200px" class="quiz-aside">
        <el-menu :default-openeds="['1']" router>
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-message"></i>管理选项</template>
            <el-menu-item-group>
              <el-menu-item index="/user">用户管理</el-menu-item>
              <el-menu-item index="/question">题目管理</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
    <el-alert v-if="storageError" title="本地数据读取失败，请清除本站点数据后重试。" type="error" :closable="false" show-icon class="storage-alert" />
      <el-form inline class="demo-form-inline" @submit.native.prevent="search">
        <el-form-item label="题目"><el-input v-model="keyword" placeholder="请输入题目关键词" aria-label="查询题目" /></el-form-item>
        <el-form-item><el-button type="primary" native-type="submit">查询</el-button></el-form-item>
        <el-form-item><el-button type="success" @click="open()">添加题目</el-button></el-form-item>
      </el-form>
      <el-table :data="pageRows" empty-text="暂无匹配的题目，请调整查询条件或添加题目" row-key="id">
        <el-table-column prop="id" label="序号" width="80" />
        <el-table-column prop="question" label="题目" width="250" />
        <el-table-column label="选项" width="260"><template slot-scope="scope"><span>{{ scope.row.options.join('，') }}</span></template></el-table-column>
        <el-table-column label="答案" width="180"><template slot-scope="scope"><span>{{ scope.row.options[letters.indexOf(scope.row.answer)] }}</span></template></el-table-column>
        <el-table-column label="操作"><template slot-scope="scope"><el-button size="mini" @click="open(scope.row)">编辑</el-button><el-button size="mini" type="danger" @click="remove(scope.row)">删除</el-button></template></el-table-column>
      </el-table>
      <br />
      <el-pagination background :current-page.sync="page" :page-size="pageSize" :total="filteredRows.length" layout="prev, pager, next" />
    <el-dialog :title="editingId ? '编辑题目' : '添加新题目'" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false">
      <el-form :model="form" label-width="80px" @submit.native.prevent="save">
        <el-form-item label="题目"><el-input v-model="form.question" maxlength="300" aria-label="题目" /></el-form-item>
        <el-form-item v-for="(letter, index) in letters" :key="letter" :label="'选项' + letter.toLowerCase()"><el-input v-model="form.options[index]" maxlength="150" :aria-label="'选项 ' + letter" /></el-form-item>
        <el-form-item label="答案"><el-input v-model="form.answer" autocomplete="off" aria-label="答案" /></el-form-item>
        <el-alert v-if="formError" :title="formError" type="error" :closable="false" show-icon />
      </el-form>
      <span slot="footer"><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="save">确定</el-button></span>
    </el-dialog>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import manager from '../../manager'
import { initialQuestions, letters, nextId, validateQuestion, prepareQuestion } from '../../data.mjs'
export default {
  mixins: [manager('questions', initialQuestions, 'question')],
  data: () => ({ letters, form: { question: '', options: ['', '', '', ''], answer: '' } }),
  methods: {
    open(row) {
      this.editingId = row ? row.id : null
      this.form = row ? JSON.parse(JSON.stringify(row)) : { question: '', options: ['', '', '', ''], answer: '' }
      if (row) this.form.answer = row.options[letters.indexOf(row.answer)]
      this.formError = ''; this.dialogVisible = true
    },
    save() {
      const question = prepareQuestion(this.form)
      this.formError = validateQuestion(question)
      if (this.formError) return
      this.finishSave({ ...question, id: this.editingId || nextId(this.rows) })
    }
  }
}
</script>
