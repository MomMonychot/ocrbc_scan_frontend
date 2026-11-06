/**
 * District Administration OCR & Verification Platform - API Service Client
 *
 * Architectural and Security Rationale:
 * - Uses Axios with central configuration pointing to FastAPI v1 routing prefix (/api/v1).
 * - Enforces multipart streaming directly into memory without client-side caching.
 * - Handles Pre-Flight Quality Gate rejection notices (< 40% composite score) cleanly.
 * - Provides typed error normalization preventing unhandled Promise rejections.
 * - Strict snake_case naming conventions for all payload attributes and parameters.
 */

import axios from 'axios'

// Create configured Axios instance
export const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30000, // 30 seconds timeout for compute-heavy OCR inspection
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Centralized Response and Error Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Standardize error structure across network, HTTP, or validation failures
    let errorMessage = 'An unexpected error occurred while communicating with the administrative server.'
    let errorCode = 'NETWORK_ERROR'
    let errorDetails = null

    if (error.response) {
      const responseData = error.response.data || {}
      errorCode = responseData.error_code || `HTTP_${error.response.status}`
      errorMessage = responseData.message || responseData.detail || error.message
      errorDetails = responseData.details || null

      // Specific handling for common government HTTP status codes
      if (error.response.status === 413) {
        errorMessage = 'Document payload exceeds the maximum permitted 15 MB limit.'
      } else if (error.response.status === 422) {
        errorMessage = responseData.message || 'Submitted document payload failed schema validation.'
      } else if (error.response.status >= 500) {
        errorMessage = responseData.message || 'The administrative verification server is currently unavailable. Please try again shortly.'
      }
    } else if (error.request) {
      errorMessage = 'Cannot reach the backend OCR gateway. Please verify that the FastAPI service is running.'
    }

    const normalizedError = new Error(errorMessage)
    normalizedError.code = errorCode
    normalizedError.details = errorDetails
    normalizedError.originalError = error

    return Promise.reject(normalizedError)
  }
)

/**
 * Uploads a document image/PDF to the Pre-Flight Quality Gate endpoint.
 *
 * Checks:
 * - Laplacian variance sharpness
 * - Mean grayscale exposure and brightness
 * - Rejection below 40% threshold with standardized notice
 *
 * @param {File} file - Raw document file object (JPEG, PNG, WebP, PDF)
 * @param {Function} [onUploadProgress] - Optional progress callback
 * @returns {Promise<Object>} Inspection result (is_accepted, scores, task_id, document_hash)
 */
export async function inspectDocument(file, onUploadProgress) {
  if (!file) {
    throw new Error('A valid document file must be provided for inspection.')
  }

  const formData = new FormData()
  formData.append('file', file)

  return apiClient.post('/documents/inspect', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  })
}

/**
 * Cross-references OCR-extracted document text against authoritative municipal records.
 *
 * Uses:
 * - Read-only PostgreSQL connection
 * - RapidFuzz high-performance matching (auto-correcting >= 85%, flagging < 85%)
 *
 * @param {Object} extractedFields - Dictionary of extracted fields (national_id, names, cert_no, etc.)
 * @returns {Promise<Object>} Verification payload (matched_records, confidence_level, requires_manual_review, verified_fields)
 */
export async function verifyExtractedFields(extractedFields) {
  if (!extractedFields || typeof extractedFields !== 'object') {
    throw new Error('Extracted fields dictionary is required for verification.')
  }

  const payload = {
    extracted_fields: { ...extractedFields },
  }

  return apiClient.post('/documents/verify', payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Fetches real-time service health, uptime, and Zero-Data-Retention security status.
 *
 * @returns {Promise<Object>} Health check response
 */
export async function fetchSystemHealth() {
  return apiClient.get('/health_check')
}

/**
 * Geographic Administrative Gazetteer API Services
 */

export async function getGeoHierarchy() {
  return apiClient.get('/geo/hierarchy')
}

export async function getGeoProvinces() {
  return apiClient.get('/geo/provinces')
}

export async function getGeoDistricts(provinceCode) {
  const params = provinceCode ? { province_code: provinceCode } : {}
  return apiClient.get('/geo/districts', { params })
}

export async function getGeoCommunes(districtCode) {
  const params = districtCode ? { district_code: districtCode } : {}
  return apiClient.get('/geo/communes', { params })
}

export async function getGeoVillages(communeCode) {
  const params = communeCode ? { commune_code: communeCode } : {}
  return apiClient.get('/geo/villages', { params })
}

export async function getGeoEntities(params = {}) {
  return apiClient.get('/geo/entities', { params })
}

export async function createGeoEntity(payload) {
  return apiClient.post('/geo/entities', payload)
}

export async function updateGeoEntity(level, code, payload) {
  return apiClient.put(`/geo/entities/${level}/${code}`, payload)
}

export async function deleteGeoEntity(level, code) {
  return apiClient.delete(`/geo/entities/${level}/${code}`)
}

/**
 * Authentication and User Session API Services
 */

export async function apiLogin(username, password) {
  return apiClient.post('/auth/login', {
    username: username.trim(),
    password: password.trim(),
  })
}

export async function getAuthProfile(username) {
  const params = username ? { username } : {}
  return apiClient.get('/auth/me', { params })
}

/**
 * Administrative Division Error Reports & Notifications API Services
 */

export async function getGeoReports(statusFilter = null) {
  const params = statusFilter ? { status_filter: statusFilter } : {}
  return apiClient.get('/geo/reports', { params })
}

export async function submitGeoReport(payload) {
  return apiClient.post('/geo/reports', payload)
}

export async function updateGeoReportStatus(reportId, status, adminNotes = null) {
  return apiClient.patch(`/geo/reports/${reportId}`, {
    status,
    admin_notes: adminNotes,
  })
}

export async function deleteGeoReport(reportId) {
  return apiClient.delete(`/geo/reports/${reportId}`)
}

export default {
  inspectDocument,
  verifyExtractedFields,
  fetchSystemHealth,
  getGeoHierarchy,
  getGeoProvinces,
  getGeoDistricts,
  getGeoCommunes,
  getGeoVillages,
  getGeoEntities,
  createGeoEntity,
  updateGeoEntity,
  deleteGeoEntity,
  apiLogin,
  getAuthProfile,
  getGeoReports,
  submitGeoReport,
  updateGeoReportStatus,
  deleteGeoReport,
}
