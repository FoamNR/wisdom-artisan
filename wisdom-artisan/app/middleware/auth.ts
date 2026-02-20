export default defineNuxtRouteMiddleware((to, from) => {
  // ดึง Cookie ที่เก็บ Token (ตัวอย่างชื่อ 'access_token')
  const token = useCookie('access_token')

  // ถ้าไม่มี Token ให้ดีดไปหน้า Login
  if (!token.value) {
    return navigateTo('/login')
  }
})