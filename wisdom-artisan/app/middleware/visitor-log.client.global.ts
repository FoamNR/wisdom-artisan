// middleware/visit-log.ts
export default defineNuxtRouteMiddleware((to) => {
  // ทำงานเฉพาะฝั่ง client เท่านั้น
  if (!import.meta.client) return
  
  // ข้ามหน้า admin และ api
  if (to.path.startsWith('/admin') || to.path.startsWith('/api')) return

  const config = useRuntimeConfig()
  const apiUrl = config.public.apiBase || 'http://localhost:4000'

  // สร้าง key สำหรับ sessionStorage
  const key = `visit-log:${to.fullPath}`
  const now = Date.now()
  const lastLog = sessionStorage.getItem(key)

  // ถ้า log ไปแล้วไม่เกิน 3 วินาที ให้ข้ามไป (ป้องกันการรีเฟรชบ่อยๆ)
  if (lastLog && now - Number(lastLog) < 3000) {
    return
  }

  // บันทึก timestamp ปัจจุบัน
  sessionStorage.setItem(key, String(now))

  // ส่ง log ไปยัง API
  $fetch(`${apiUrl}/log/log-visit`, {
    method: 'POST',
    body: {
      path: to.fullPath,
      method: 'GET'
    }
  }).catch((err) => console.error('Visit log failed:', err))
})