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
        <el-form-item label="用户名"><el-input v-model="keyword" placeholder="请输入用户名" aria-label="查询用户名" /></el-form-item>
        <el-form-item><el-button type="primary" native-type="submit">查询</el-button></el-form-item>
        <el-form-item><el-button type="success" @click="open()">添加用户</el-button></el-form-item>
      </el-form>
      <el-table :data="pageRows" empty-text="暂无匹配的用户，请调整查询条件或添加用户" row-key="id">
        <el-table-column label="日期" width="180"><template slot-scope="scope"><i class="el-icon-time muted"></i> {{ scope.row.date }}</template></el-table-column>
        <el-table-column label="姓名" width="180"><template slot-scope="scope"><el-popover trigger="hover" placement="top"><p>姓名：{{ scope.row.name }}</p><p>住址：{{ scope.row.address || '未填写' }}</p><el-tag slot="reference" size="medium">{{ scope.row.name }}</el-tag></el-popover></template></el-table-column>
        <el-table-column label="操作"><template slot-scope="scope"><el-button size="mini" @click="open(scope.row)">编辑</el-button><el-button size="mini" type="danger" @click="remove(scope.row)">删除</el-button></template></el-table-column>
      </el-table>
      <br />
      <el-pagination background :current-page.sync="page" :page-size="pageSize" :total="filteredRows.length" layout="prev, pager, next" />
    <el-dialog :title="editingId ? '编辑用户' : '添加新用户'" :visible.sync="dialogVisible" width="50%" :close-on-click-modal="false">
      <el-form :model="form" label-width="80px" @submit.native.prevent="save">
        <el-form-item label="用户名"><el-input v-model="form.name" maxlength="20" autocomplete="off" aria-label="用户名" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" type="password" show-password maxlength="32" autocomplete="new-password" :placeholder="editingId ? '留空表示不修改' : '请输入 6–32 位密码'" aria-label="密码" /></el-form-item>
        <el-form-item label="确认密码"><el-input v-model="form.confirmPassword" type="password" show-password maxlength="32" autocomplete="new-password" aria-label="确认密码" /></el-form-item>
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
import { initialUsers, nextId, validateUser } from '../../data.mjs'
export default {
  mixins: [manager('users', initialUsers, 'name')],
  data: () => ({ form: { name: '', password: '', confirmPassword: '', address: '' } }),
  methods: {
    open(row) {
      this.editingId = row ? row.id : null
      this.form = { name: row ? row.name : '', address: row ? row.address : '', password: '', confirmPassword: '' }
      this.formError = ''; this.dialogVisible = true
    },
    save() {
      this.formError = validateUser(this.form, this.rows, this.editingId)
      if (this.formError) return
      const original = this.rows.find(row => row.id === this.editingId)
      const today = new Date()
      const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      this.finishSave({ id: this.editingId || nextId(this.rows), name: this.form.name.trim(), address: this.form.address.trim(), date: original ? original.date : date })
    }
  }
}
</script>
