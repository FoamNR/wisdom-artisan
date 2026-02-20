<script setup lang="ts">
import axios from 'axios'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-log'] })
useSeoMeta({ title: 'Wisdom Artisan - เพิ่มผู้ดูแลระบบ' })

// --- State ---
const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// เก็บข้อมูล Text
const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  fname: '',
  lname: '',
  role: 'editor',
  phone_number: ''
})

// เก็บข้อมูลไฟล์และรูปตัวอย่าง
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// --- Modal State ---
const modal = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  confirmCallback: null as (() => void) | null
})

const openModal = (type: string, title: string, message: string, callback: (() => void) | null = null) => {
  modal.value = { show: true, type, title, message, confirmCallback: callback }
}

const closeModal = () => {
  modal.value.show = false
  // รอ animation จบแล้วค่อยล้าง callback
  setTimeout(() => {
    modal.value.confirmCallback = null
  }, 300)
}

// *** จุดที่แก้ไข ***
const handleModalConfirm = () => {
  const callback = modal.value.confirmCallback
  
  // 1. ปิด Modal ก่อน
  closeModal() 

  // 2. ถ้ามี callback ให้ทำหลังจากปิด Modal แล้ว (หน่วงเวลานิดนึงเพื่อให้ UI Smooth)
  if (callback) {
    setTimeout(() => {
        callback()
    }, 300)
  }
}

// --- Logic ---

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    if (file.size > 5 * 1024 * 1024) {
      openModal('error', 'ไฟล์ใหญ่เกินไป', 'กรุณาอัปโหลดรูปภาพขนาดไม่เกิน 5MB')
      input.value = ''
      return
    }
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const validateForm = () => {
  const { username, password, confirmPassword, fname, lname } = formData.value
  
  if (!username || !password || !fname || !lname) return openModal('error', 'ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')
  if (username.length < 4) return openModal('error', 'ข้อผิดพลาด', 'ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร')
  if (password.length < 8) return openModal('error', 'ข้อผิดพลาด', 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
  if (password !== confirmPassword) return openModal('error', 'ข้อผิดพลาด', 'รหัสผ่านไม่ตรงกัน')
  
  openModal('confirm', 'ยืนยันการสมัคร', 'ต้องการเพิ่มผู้ดูแลระบบคนนี้ใช่หรือไม่?', submitData)
}

const submitData = async () => {
  isSubmitting.value = true
  try {
    const formPayload = new FormData()
    formPayload.append('username', formData.value.username)
    formPayload.append('password', formData.value.password)
    formPayload.append('fname', formData.value.fname)
    formPayload.append('lname', formData.value.lname)
    formPayload.append('role', formData.value.role)
    formPayload.append('phone_number', formData.value.phone_number)

    if (selectedFile.value) {
      formPayload.append('profile_img', selectedFile.value)
    }
    
    await axios.post('http://localhost:4000/admin/register', formPayload, {
      withCredentials: true,
    })

    // Callback ตรงนี้จะทำงานหลังจาก Modal ปิดลงแล้ว
    openModal('success', 'สำเร็จ', 'เพิ่มผู้ดูแลระบบเรียบร้อยแล้ว', () => {
        return navigateTo('/admin/useradmin')
    })

  } catch (error: any) {
    console.error(error)
    const msg = error.response?.data?.error || error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
    openModal('error', 'เกิดข้อผิดพลาด', msg)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="font-sans text-slate-800 p-6 min-h-screen bg-gray-50/50 relative">
    
    <div class="flex items-center justify-between mb-6">
      <div class="text-sm text-slate-500">
        Admin Dashboard / ผู้ดูแลระบบ / <span class="font-medium text-slate-700">เพิ่มผู้ดูแลใหม่</span>
      </div>
    </div>

    <form @submit.prevent="validateForm">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">เพิ่มผู้ดูแลระบบ</h1>
          <p class="text-slate-500 text-sm mt-1">สร้างบัญชีผู้ดูแลระบบใหม่</p>
        </div>
        
        <div class="flex items-center gap-3">
          <NuxtLink to="/admin/useradmin" class="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-slate-600 text-sm font-medium hover:bg-gray-50 transition">
            ยกเลิก
          </NuxtLink>
          
          <button type="submit" :disabled="isSubmitting" class="flex items-center gap-2 bg-[#428a4a] hover:bg-[#367c3d] text-white px-4 py-2 rounded-lg shadow-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed">
            <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            <span v-else class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            {{ isSubmitting ? 'กำลังบันทึก...' : 'สร้างบัญชี' }}
          </button>
        </div>
      </div>

      <div class="max-w-3xl mx-auto">
        
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h3 class="font-bold text-slate-800 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            บัญชีผู้ใช้
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้ <span class="text-red-500">*</span></label>
              <input type="text" v-model="formData.username" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน <span class="text-red-500">*</span></label>
              <div class="relative">
                <input :type="showPassword ? 'text' : 'password'" v-model="formData.password" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition pr-10">
                <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่าน <span class="text-red-500">*</span></label>
              <div class="relative">
                <input :type="showConfirmPassword ? 'text' : 'password'" v-model="formData.confirmPassword" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition pr-10">
                <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h3 class="font-bold text-slate-800 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            ข้อมูลส่วนตัว
          </h3>

          <div class="flex flex-col items-center justify-center mb-6">
             <div class="relative w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group hover:border-green-500 transition cursor-pointer"
                  @click="fileInput?.click()">
                
                <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-cover" alt="Profile Preview" />
                
                <div v-else class="text-center text-gray-400 group-hover:text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-xs">เลือกรูป</span>
                </div>
             </div>
             <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload">
             <p class="text-xs text-gray-400 mt-2">คลิกที่วงกลมเพื่ออัปโหลดรูปโปรไฟล์ (ถ้ามี)</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อจริง <span class="text-red-500">*</span></label>
              <input type="text" v-model="formData.fname" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">นามสกุล <span class="text-red-500">*</span></label>
              <input type="text" v-model="formData.lname" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
              <input type="tel" v-model="formData.phone_number" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">บทบาท <span class="text-red-500">*</span></label>
              <select v-model="formData.role" class="w-full border-gray-300 rounded-lg px-3 py-2 border text-slate-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
                <option value="editor">Editor (ผู้จัดการ)</option>
                <option value="super_admin">Super Admin (ผู้ดูแลระบบ)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

    </form>

    <div v-if="modal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="modal.type !== 'confirm' ? closeModal() : null"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all animate-fade-in-up">
            <div class="p-6 text-center">
                <div v-if="modal.type === 'success'" class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-green-600">✓</div>
                <div v-else-if="modal.type === 'error'" class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">✕</div>
                <div v-else class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600">?</div>

                <h3 class="text-lg font-bold text-gray-900 mb-2">{{ modal.title }}</h3>
                <p class="text-sm text-gray-500 mb-6">{{ modal.message }}</p>
                
                <div class="flex items-center justify-center gap-3">
                    <button v-if="modal.type === 'confirm'" @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">ยกเลิก</button>
                    <button @click="handleModalConfirm" :class="['px-4 py-2 text-sm font-medium text-white rounded-lg transition min-w-[100px]', modal.type === 'error' ? 'bg-red-600 hover:bg-red-700' : modal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700']">
                        {{ modal.type === 'confirm' ? 'ยืนยัน' : 'ตกลง' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
</style>