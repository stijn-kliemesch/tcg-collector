import { createRouter, createWebHistory } from 'vue-router';
import CollectionPage from '@/pages/CollectionPage.vue';
import MarketPage from '@/pages/MarketPage.vue';
import LookupPage from '@/pages/LookupPage.vue';
import SetsPage from '@/pages/SetsPage.vue';
import AboutPage from '@/pages/AboutPage.vue';
import SettingsPage from '@/pages/SettingsPage.vue';
import { setupGuards } from './guards';

const routes = [
  {
    path: '/',
    redirect: '/collection',
  },
  {
    path: '/collection',
    name: 'collection',
    component: CollectionPage,
  },
  {
    path: '/market',
    name: 'market',
    component: MarketPage,
  },
  {
    path: '/lookup',
    name: 'lookup',
    component: LookupPage,
  },
  {
    path: '/sets',
    name: 'sets',
    component: SetsPage,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage,
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Setup route guards
setupGuards(router);

export { router };
