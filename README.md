# lesson5 — Quiz后台管理

第五次课作业，使用 Vue 2、Vue Router 3、Element UI 和 Vue CLI 5。

## Project setup

```sh
npm install
```

## Compiles and hot-reloads for development

```sh
npm run serve
```

打开终端显示的网址，默认 http://localhost:8080。

## Compiles and minifies for production

```sh
npm run build
```

编译结果在 dist 中。不要直接双击 dist/index.html，使用本地服务器或部署平台打开。

## Lints and fixes files

```sh
npm run lint
```

## 功能说明

- 用户管理：日期、姓名、编辑、删除；按用户名查询；添加用户弹窗含用户名、密码、确认密码。
- 题目管理：序号、题目、选项、答案、编辑、删除；关键词查询；添加题目弹窗含题目、四个选项和答案。
- 顶部 Quiz 标题、200px 左侧菜单和 Element UI 默认样式，与课堂参考布局接近。
- 增删改查和分页可用，数据存于当前浏览器 localStorage。密码仅演示表单校验，不会保存，也没有登录功能。
- 默认进入 /#/user，题目页为 /#/question。

。
