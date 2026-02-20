<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
  , middleware: ['auth', 'admin-log']
})

// 1. Mock Data: ข้อมูลปราชญ์
const artisan = ref({
  id: '12345',
  name: 'สมชาย ใจดี',
  role: 'ช่างทอผ้า',
  image: 'https://i.pravatar.cc/150?img=12', // รูปผู้ชายคล้ายในแบบ
  nationalId: '12345678901234',
  birthDate: '01/01/2503',
  phone: '081-234-1234',
  email: 's.jaidee@email.com',
  address: '123 หมู่ 4 ต.ในเมือง อ.เมือง จ.เชียงใหม่ 50200',
  bio: 'สมชาย ใจดี เป็นช่างทอผ้าชั้นครูจากภาคเหนือของประเทศไทย มีประสบการณ์ด้านเทคนิคการทอผ้าแบบดั้งเดิมมากกว่า 40 ปี เขามีชื่อเสียงในด้านลวดลายที่สลับซับซ้อนซึ่งผสมผสานลวดลายโบราณเข้ากับสีสันร่วมสมัย ผลงานของเขาได้จัดแสดงในนิทรรศการระดับชาติหลายครั้ง และเขาเป็นผู้สนับสนุนอย่างกระตือรือร้นในการอนุรักษ์มรดกหัตถกรรมท้องถิ่นสำหรับคนรุ่นต่อไป'
})

// 2. State สำหรับ Tabs
const activeTab = ref('personal')
const tabs = [
  { id: 'personal', label: 'ข้อมูลส่วนตัว' },
  { id: 'career', label: 'อาชีพ/ผลงาน' },
  { id: 'gallery', label: 'Product Gallery' },
  { id: 'log', label: 'ประวัติการเข้าถึงข้อมูล' }
]

// 3. State & Logic สำหรับการเปิด/ปิดข้อมูล (Masking)
const visibility = ref({
  nationalId: false,
  birthDate: false,
  phone: false,
  address: false
})

const toggleVisibility = (field) => {
  visibility.value[field] = !visibility.value[field]
}

// Helper Masking Functions
const getMaskedNationalId = () => visibility.value.nationalId ? artisan.value.nationalId : '*************' + artisan.value.nationalId.slice(-4)
const getMaskedBirthDate = () => visibility.value.birthDate ? artisan.value.birthDate : '******'
const getMaskedPhone = () => visibility.value.phone ? artisan.value.phone : '***-***-' + artisan.value.phone.split('-')[2]
const getMaskedAddress = () => visibility.value.address ? artisan.value.address : '******************************************'

</script>

<template>
  <div class="font-sans text-slate-800 p-6 min-h-screen bg-gray-50/50">
    
    <div class="flex items-center justify-between mb-6">
      <div class="text-sm text-slate-500">
        Admin Dashboard / ปราชญ์ชาวบ้าน / <span class="font-medium text-slate-700">{{ artisan.name }}</span>
      </div>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex items-center gap-5">
        <img :src="artisan.image" class="w-20 h-20 rounded-full object-cover border-4 border-gray-50 shadow-sm" alt="Profile">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">{{ artisan.name }}</h1>
          <p class="text-slate-500">{{ artisan.role }}</p>
          <p class="text-xs text-slate-400 mt-1">Artisan ID: {{ artisan.id }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 rounded-lg border border-green-600 text-green-600 text-sm font-medium hover:bg-green-50 transition">
          แก้ไขโปรไฟล์
        </button>
        <button class="flex items-center gap-2 bg-[#428a4a] hover:bg-[#367c3d] text-white px-4 py-2 rounded-lg shadow-sm font-medium transition">
          พิมพ์
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px]">
      
      <div class="border-b border-gray-200 px-6 pt-4">
        <nav class="flex gap-8" aria-label="Tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="pb-4 text-sm font-medium border-b-2 transition-colors duration-200 ease-out"
            :class="activeTab === tab.id ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div v-if="activeTab === 'personal'" class="p-8">
        
        <h2 class="text-lg font-bold text-slate-800 mb-6">ข้อมูลส่วนตัว</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
          
          <div class="group">
            <label class="block text-sm text-slate-500 mb-1.5">รหัสประจำตัวประชาชน</label>
            <div class="relative">
              <input type="text" readonly :value="getMaskedNationalId()" class="w-full bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg p-2.5 font-mono focus:outline-none">
              <button @click="toggleVisibility('nationalId')" class="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-xs font-medium hover:underline flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                แสดง
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-slate-500 mb-1.5">วัน/เดือน/ปีเกิด</label>
            <div class="relative">
              <input type="text" readonly :value="getMaskedBirthDate()" class="w-full bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg p-2.5 font-mono focus:outline-none">
              <button @click="toggleVisibility('birthDate')" class="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-xs font-medium hover:underline flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                แสดง
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-slate-500 mb-1.5">เบอร์โทรศัพท์</label>
            <div class="relative">
              <input type="text" readonly :value="getMaskedPhone()" class="w-full bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg p-2.5 font-mono focus:outline-none">
              <button @click="toggleVisibility('phone')" class="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-xs font-medium hover:underline flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                แสดง
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-slate-500 mb-1.5">อีเมล</label>
            <div class="relative">
              <input type="text" readonly :value="artisan.email" class="w-full bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg p-2.5 focus:outline-none">
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm text-slate-500 mb-1.5">ที่อยู่</label>
            <div class="relative">
              <input type="text" readonly :value="getMaskedAddress()" class="w-full bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg p-2.5 font-mono focus:outline-none">
              <button @click="toggleVisibility('address')" class="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-xs font-medium hover:underline flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                แสดง
              </button>
            </div>
          </div>

        </div>

        <div class="mb-8">
          <h3 class="text-lg font-bold text-slate-800 mb-4">ประวัติ</h3>
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 text-sm text-slate-600 leading-relaxed">
            {{ artisan.bio }}
          </div>
        </div>

        <div>
          <h3 class="text-lg font-bold text-slate-800 mb-4">อัปโหลดไฟล์</h3>
          <div class="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer group">
            <div class="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-green-50 transition">
              <svg class="w-8 h-8 text-gray-400 group-hover:text-green-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            </div>
            <p class="text-slate-600 mb-2 font-medium">ลากและวางไฟล์ที่นี่ หรือ</p>
            <button class="bg-[#10b981] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#059669] transition shadow-sm mb-3">
              เลือกไฟล์
            </button>
            <p class="text-xs text-slate-400">รองรับไฟล์ PDF, DOCX, JPG, PNG ขนาดไม่เกิน 10MB</p>
          </div>
        </div>

      </div>
      
    </div>
  </div>
</template>