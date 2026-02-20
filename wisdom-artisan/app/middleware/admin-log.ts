// middleware/admin-log.ts
export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  const config = useRuntimeConfig()
  const apiUrl = config.public.apiBase || 'http://localhost:4000'

  const key = `admin-log:${to.fullPath}`
  const now = Date.now()
  const lastLog = sessionStorage.getItem(key)

  if (lastLog && now - Number(lastLog) < 3000) {
    return
  }

  sessionStorage.setItem(key, String(now))

  const logMessage =
    to.path === '/login'
      ? 'User เข้าสู่หน้าเข้าสู่ระบบ'
      : `Admin เข้าใช้งานหน้า: ${String(to.name || to.path)}`

  $fetch(`${apiUrl}/log/log-admin-action`, {
    method: 'POST',
    credentials: 'include',
    body: {
      path: to.fullPath,
      action: 'AUTH_VIEW',
      method: 'GET',
      errorMessage: logMessage
    }
  }).catch((err) => console.error('Log failed:', err))
})
