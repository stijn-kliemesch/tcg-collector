import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue'
import CollectionPage from '@/pages/CollectionPage.vue'
import MarketPage from '@/pages/MarketPage.vue'
import LookupPage from '@/pages/LookupPage.vue'
import SetsPage from '@/pages/SetsPage.vue'
import AboutPage from '@/pages/AboutPage.vue'

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
    component: MarketPage
  },
  {
    path: '/lookup',
    name: 'lookup',
    component: LookupPage
  },
  {
    path: '/sets',
    name: 'sets',
    component: SetsPage
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage
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
