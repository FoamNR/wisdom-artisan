<script setup lang="ts">
import axios from 'axios' // 1. นำเข้า Axios

definePageMeta({
  layout: false,
  middleware: ['guest', 'admin-log'] // เพิ่ม auth-log เข้าไปต่อจาก guest
})

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  // Reset error และเริ่มโหลด
  errorMessage.value = ''
  isLoading.value = true

  try {
    // 2. ใช้ Axios ยิง API
    // รูปแบบ: axios.post(url, body, config)
    const apiResponse = await axios.post('http://localhost:4000/auth/login', {
      username: username.value,
      password: password.value
    }, {
      withCredentials: true // ส่ง cookie ไปด้วย (ถ้าจำเป็นต้องใช้ session/cookie ฝั่ง server)
    });

    // 3. ดึงข้อมูลจาก response.data
    // Axios จะห่อ Body ที่ได้จาก Server ไว้ใน .data เสมอ
    const data = apiResponse.data

    // --- ส่วนจัดการ Token (เหมือนเดิม) ---
    const tokenCookie = useCookie('access_token', {
      maxAge: 60 * 60 * 24 // 1 วัน
    })

    // เช็คว่า token อยู่ใน key ไหน (data.token, data.accessToken ฯลฯ)
    // สมมติว่า Server ส่ง json: { token: "xyz..." }
    tokenCookie.value = data.token || data.accessToken || data.data?.token

    if (tokenCookie.value) {
      await navigateTo('/admin') 
    } else {
      throw new Error('ไม่พบ Token ในการตอบกลับจาก Server')
    }

  } catch (error: any) {
    console.error('Login Error:', error)
    
    // 4. จัดการ Error แบบ Axios
    // error.response คือ response ที่ Server ส่งกลับมา (เช่น 400, 401)
    if (error.response) {
      // server ตอบกลับมาพร้อม status code error
      errorMessage.value = error.response.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    } else if (error.request) {
      // server ไม่ตอบสนอง (Network Error)
      errorMessage.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
    } else {
      // Error อื่นๆ
      errorMessage.value = error.message
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] font-['Prompt'] px-4">
    
    <div class="text-center mb-8">
      <h1 class="text-2xl md:text-3xl font-bold text-[#1B4D2E] leading-tight">
        ระบบฐานข้อมูลปราชญ์ชาวบ้าน<br />
        และงานฝีมือ
      </h1>
      <p class="text-gray-500 mt-2 text-sm">สำหรับผู้ดูแลระบบ</p>
    </div>

    <div class="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-full max-w-[450px]">
      <form @submit.prevent="handleLogin" class="space-y-6">
        
        <div v-if="errorMessage" class="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center border border-red-100">
          {{ errorMessage }}
        </div>

        <div class="space-y-2">
          <label class="block text-[#1B4D2E] font-semibold text-sm">ชื่อผู้ใช้</label>
          <input 
            v-model="username"
            type="text" 
            placeholder="Enter your username" 
            required
            class="w-full bg-[#E9F5EB] text-gray-700 placeholder-gray-400 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#1B4D2E]/50 transition border-none"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-[#1B4D2E] font-semibold text-sm">รหัสผ่าน</label>
          <div class="relative">
            <input 
              v-model="password"
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Enter your password" 
              required
              class="w-full bg-[#E9F5EB] text-gray-700 placeholder-gray-400 rounded-2xl px-5 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#1B4D2E]/50 transition border-none"
            />
            <button 
              type="button"
              @click="togglePassword"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#1B4D2E]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-[#1B4D2E] text-white font-medium py-3.5 rounded-full hover:bg-[#143d24] active:scale-[0.98] transition shadow-md mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          <span v-if="isLoading">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังเข้าสู่ระบบ...
          </span>
          <span v-else>เข้าสู่ระบบ</span>
        </button>

      </form>
    </div>

  </div>
</template>