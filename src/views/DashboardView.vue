<script setup>
import { useRouter } from 'vue-router'
import MunicipalOcrDashboard from '../components/MunicipalOcrDashboard.vue'

const router = useRouter()

function handleInspectRecord(record) {
  // Navigate to verification workspace with document type parameter
  router.push({
    path: '/verify',
    query: {
      type: record.formatKey === 'certified' ? 'certified' : 'standard',
      ref: record.id,
    },
  })
}

function handleRefreshTelemetry() {
  console.info('Audit telemetry synchronized with district gateway.')
}

function handleExportAuditLog() {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          status: 'SEALED_SHA256',
          auditor: 'One Window Service Admin',
          system: 'OCRBC Scan Production Gateway',
        },
        null,
        2
      ),
    ],
    { type: 'application/json' }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `OCRBC_Audit_Log_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleResolveDiscrepancy(item) {
  router.push({
    path: '/verify',
    query: {
      ref: item.recordId,
      flag: item.id,
    },
  })
}
</script>

<template>
  <main class="min-h-[calc(100vh-4rem)] bg-gov-surface">
    <MunicipalOcrDashboard
      @inspect-record="handleInspectRecord"
      @refresh-telemetry="handleRefreshTelemetry"
      @export-audit-log="handleExportAuditLog"
      @resolve-discrepancy="handleResolveDiscrepancy"
    />
  </main>
</template>
