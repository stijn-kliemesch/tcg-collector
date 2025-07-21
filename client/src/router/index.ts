import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue'
import CollectionPage from '@/pages/CollectionPage.vue'

// Temporary wrapper components until we create the real page components
const createTemporaryPage = (content: string) => ({
  render: () => h('div', { class: 'mt-4' }, content)
})

const routes = [
  {
    path: '/',
    redirect: '/collection'
  },
  {
    path: '/collection',
    name: 'collection',
    component: CollectionPage
  },
  {
    path: '/market',
    name: 'market',
    component: createTemporaryPage('Market Page Content')
  },
  {
    path: '/lookup',
    name: 'lookup',
    component: createTemporaryPage('Lookup Page Content')
  },
  {
    path: '/sets',
    name: 'sets',
    component: createTemporaryPage('Sets Page Content')
  },
  {
    path: '/about',
    name: 'about',
    component: createTemporaryPage('About Page Content')
  },
  {
    path: '/settings',
    name: 'settings',
    component: createTemporaryPage('Settings Page Content')
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
