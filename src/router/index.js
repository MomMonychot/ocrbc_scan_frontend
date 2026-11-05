import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import VerificationView from '../views/VerificationView.vue'
import AboutView from '../views/AboutView.vue'
import TemplatesView from '../views/TemplatesView.vue'
import AdministrativeDivisionsView from '../views/AdministrativeDivisionsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'District Administration OCR Portal'
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'OCR Audit Dashboard - District Administration'
    }
  },
  {
    path: '/divisions',
    name: 'divisions',
    component: AdministrativeDivisionsView,
    meta: {
      title: 'Cambodia Administrative Gazetteer - 25 Provinces'
    }
  },
  {
    path: '/verify',
    name: 'verify',
    component: VerificationView,
    meta: {
      title: 'Civil Registration Verification'
    }
  },
  {
    path: '/templates',
    name: 'templates',
    component: TemplatesView,
    meta: {
      title: 'Civil Registry Document Templates'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: {
      title: 'About OCRBC Scan - District Administration'
    }
  },
  // Fallback redirect to home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
