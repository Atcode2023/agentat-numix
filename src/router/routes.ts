import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // { path: '', component: () => import('pages/Index-Page.vue') },
      { path: '', component: () => import('pages/Index-Page.vue') },
      { path: 'list', component: () => import('pages/List-table.vue') },
      { path: 'records', component: () => import('pages/Records-table.vue') },
      { path: 'chat', component: () => import('pages/chat/Chat-Page.vue') },
      {
        path: 'profiles',
        name: 'profiles',
        component: () => import('pages/Profiles-Page.vue'),
      },
      {
        path: 'history-charts',
        name: 'history-charts',
        component: () => import('pages/History-Charts.vue'),
      },
      {
        path: 'sales',
        name: 'sales',
        component: () => import('pages/Sales-Page.vue'),
      },
      {
        path: 'maps',
        name: 'maps',
        component: () => import('pages/Map-Page.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
