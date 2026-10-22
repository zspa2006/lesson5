import Vue from 'vue'
import VueRouter from 'vue-router'
import UserView from '../views/element/UserView.vue'
import QuestionView from '../views/element/QuestionView.vue'

Vue.use(VueRouter)
const routes = [
  { path: '/', redirect: '/user' },
  { path: '/user', name: 'user', component: UserView },
  { path: '/question', name: 'question', component: QuestionView },
  { path: '*', redirect: '/user' }
]
export default new VueRouter({ routes })
