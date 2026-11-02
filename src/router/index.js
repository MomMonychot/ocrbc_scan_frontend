import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VerificationView from '../views/VerificationView.vue'

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
    path: '/verify',
    name: 'verify',
    component: VerificationView,
    meta: {
      title: 'Civil Registration Verification'
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
