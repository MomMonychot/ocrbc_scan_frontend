/**
 * Authentication and Administrative State Store.
 *
 * Architectural Rationale:
 * - Reactive state container for current user profile, role-based authorization,
 *   and real-time notification telemetry.
 * - Manages administrative reports unread counter.
 * - Persists session token in localStorage.
 */

import { reactive, computed } from 'vue'
import { apiLogin, getGeoReports, updateGeoReportStatus } from './api_client'

const STORAGE_KEY = 'ocrbc_civil_auth_session'

// Initial state restoring from localStorage if present
function loadStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.warn('Failed to parse saved auth session:', err)
  }
  // Default demo state: Admin initialized for seamless developer evaluation
  return {
    token: 'token_ocrbc_admin_demo',
    user: {
      username: 'admin',
      role: 'admin',
      full_name_km: 'អភិបាលប្រព័ន្ធរដ្ឋបាល',
      full_name_en: 'System Administrator',
      department_km: 'ការិយាល័យអត្រានុកូលដ្ឋាន និងអត្តសញ្ញាណប័ណ្ណ',
      department_en: 'Civil Registration and Identification Bureau',
      permissions: ['manage_divisions', 'review_reports', 'edit_templates', 'delete_records'],
    },
  }
}

const initial = loadStoredSession()

export const authState = reactive({
  token: initial.token,
  user: initial.user,
  reports: [],
  unreadReportsCount: 0,
  isLoadingReports: false,
})

export const authStore = {
  // Computed getters
  get user() {
    return authState.user
  },
  get token() {
    return authState.token
  },
  get isAuthenticated() {
    return !!authState.token && !!authState.user
  },
  get isAdmin() {
    return authState.user?.role === 'admin'
  },
  get isOfficer() {
    return authState.user?.role === 'user'
  },
  get reports() {
    return authState.reports
  },
  get unreadReportsCount() {
    return authState.unreadReportsCount
  },
  get isLoadingReports() {
    return authState.isLoadingReports
  },

  // Actions
  async login(username, password) {
    try {
      const res = await apiLogin(username, password)
      authState.token = res.access_token
      authState.user = res.user

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        token: res.access_token,
        user: res.user,
      }))

      // Refresh admin notification reports on login
      if (res.user.role === 'admin') {
        await this.refreshReports()
      }

      return res
    } catch (err) {
      throw err
    }
  },

  logout() {
    authState.token = null
    authState.user = null
    authState.reports = []
    authState.unreadReportsCount = 0
    localStorage.removeItem(STORAGE_KEY)
  },

  setUser(user, token = 'token_mock') {
    authState.user = user
    authState.token = token
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
  },

  async refreshReports() {
    if (!this.isAdmin) return
    authState.isLoadingReports = true
    try {
      const data = await getGeoReports()
      authState.reports = data.reports || []
      authState.unreadReportsCount = data.unread_count || 0
    } catch (err) {
      console.error('Failed to refresh geo reports:', err)
    } finally {
      authState.isLoadingReports = false
    }
  },

  async markReportRead(reportId) {
    try {
      await updateGeoReportStatus(reportId, 'read')
      // Update local item
      const item = authState.reports.find((r) => r.id === reportId)
      if (item && item.status !== 'read') {
        item.status = 'read'
        authState.unreadReportsCount = Math.max(0, authState.unreadReportsCount - 1)
      }
    } catch (err) {
      console.error('Failed to mark report as read:', err)
      throw err
    }
  },
}
