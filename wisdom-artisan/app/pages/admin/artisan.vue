<script setup>
import axios from 'axios' 

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-log'] })
useSeoMeta({
  title: 'Wisdom Artisan - เพิ่มหมวดหมู่ใหม่',
  ogTitle: 'Wisdom Artisan - เพิ่มหมวดหมู่ใหม่',
  description: 'Dashboard สำหรับผู้ดูแลระบบฐานข้อมูลปราชญ์ชาวบ้าน',
})

// State สำหรับเก็บข้อมูลและสถานะการโหลด
const apiData = ref([])
const pending = ref(false)
const error = ref(null)

// --- Modal State ---
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const isDeleting = ref(false) // สถานะขณะกำลังลบ

// 1. Fetch Data Function
const fetchData = async () => {
  pending.value = true
  error.value = null
  try {
    const response = await axios.get('http://localhost:4000/admin/artisans-data', { withCredentials: true })
    apiData.value = response.data
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = err
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchData()
})

// 2. Transform Data
const artisans = computed(() => {
  if (!apiData.value) return []
  return apiData.value.map((item) => ({
    id: item.artisan_id, 
    name: `${item.fname} ${item.lname}`,
    image: item.profile_img || '/img/profile.png',
    craftType: item.category_name,
    province: item.province,
    status: item.status || 'draft',
    lastUpdate: new Date(item.updated_at).toLocaleDateString('th-TH')
  }))
})

// 3. Search & Filter State
const searchQuery = ref('')
const craftFilter = ref('')
const statusFilter = ref('')

const craftOptions = computed(() => {
  if (!artisans.value) return []
  const allTypes = artisans.value.map(item => item.craftType).filter(Boolean)
  return [...new Set(allTypes)]
})

// 4. Logic กรองข้อมูล
const filteredArtisans = computed(() => {
  return artisans.value.filter(item => {
    const query = searchQuery.value.toLowerCase()
    const matchesSearch = item.name.toLowerCase().includes(query) || 
                          item.province.toLowerCase().includes(query)
    
    const matchesCraft = craftFilter.value ? item.craftType === craftFilter.value : true
    const matchesStatus = statusFilter.value ? item.status === statusFilter.value : true
    
    return matchesSearch && matchesCraft && matchesStatus
  })
})

// Helper functions
const getStatusBadge = (status) => {
  if (status === 'เผยแพร่') return 'bg-green-100 text-green-700'
  if (status === 'ฉบับร่าง') return 'bg-gray-100 text-gray-600'
  return 'bg-gray-100 text-gray-600'
}

const getStatusText = (status) => {
  if (status === 'เผยแพร่') return 'เผยแพร่'
  if (status === 'ฉบับร่าง') return 'ฉบับร่าง'
  return '-'
}

// 5. Logic การลบแบบใหม่ (Modal)
const openDeleteModal = (id) => {
    itemToDelete.value = id
    showDeleteModal.value = true
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    itemToDelete.value = null
}

const confirmDelete = async () => {
    if (!itemToDelete.value) return

    isDeleting.value = true
    try {
        await axios.delete(`http://localhost:4000/admin/artisans-data/${itemToDelete.value}`, { withCredentials: true })
        
        // ลบสำเร็จ -> ปิด Modal -> โหลดข้อมูลใหม่
        closeDeleteModal()
        fetchData()
        
    } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล')
        console.error(err)
    } finally {
        isDeleting.value = false
    }
}
</script>

<template>
  <div class="font-sans text-slate-800 p-6 min-h-screen relative">
    <div class="flex items-center justify-between mb-6">
      <div class="text-sm text-slate-500">
        Admin Dashboard / ปราชญ์ชาวบ้าน /
      </div>
    </div>
    
    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">จัดการข้อมูลปราชญ์ชาวบ้าน</h1>
        <p class="text-slate-500 text-sm mt-1">จัดการข้อมูลปราชญ์ชาวบ้าน เพิ่ม แก้ไข และตรวจสอบสถานะ</p>
      </div>
      
      <NuxtLink to="/admin/addartisan" class="flex items-center gap-2 bg-[#428a4a] hover:bg-[#367c3d] text-white px-4 py-2 rounded-lg shadow-sm font-medium transition">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        เพิ่มปราชญ์ชาวบ้าน
      </NuxtLink>
    </div>

    <div class="flex flex-col md:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="ค้นหาจากชื่อ, จังหวัด..." 
          class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm text-slate-700 shadow-sm placeholder-slate-400"
        >
      </div>

      <div class="relative w-full md:w-48">
        <select v-model="craftFilter" class="w-full appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-green-500 shadow-sm cursor-pointer">
          <option value="">ประเภทงานฝีมือ</option>
          <option v-for="type in craftOptions" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </span>
      </div>

      <div class="relative w-full md:w-40">
        <select v-model="statusFilter" class="w-full appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-green-500 shadow-sm cursor-pointer">
          <option value="">สถานะ</option>
          <option value="เผยแพร่">เผยแพร่</option>
          <option value="ฉบับร่าง">ฉบับร่าง</option>
        </select>
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </span>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-4">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white border-b border-gray-100 text-gray-500 text-xs font-medium">
              <th class="px-6 py-4 font-normal">ชื่อ-สกุล</th>
              <th class="px-6 py-4 font-normal">ประเภทงานฝีมือ</th>
              <th class="px-6 py-4 font-normal">จังหวัด</th>
              <th class="px-6 py-4 font-normal">สถานะ</th>
              <th class="px-6 py-4 font-normal">วันที่แก้ไขล่าสุด</th>
              <th class="px-6 py-4 font-normal text-right">การกระทำ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="pending">
                <td colspan="6" class="px-6 py-8 text-center text-slate-500">กำลังโหลดข้อมูล...</td>
            </tr>
            
            <tr v-else-if="error">
                <td colspan="6" class="px-6 py-8 text-center text-red-500">
                    เกิดข้อผิดพลาด: {{ error.message }}
                    <br><button @click="fetchData" class="text-blue-500 underline mt-2">ลองใหม่อีกครั้ง</button>
                </td>
            </tr>

            <tr v-else-if="filteredArtisans.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-slate-500">ไม่พบข้อมูล</td>
            </tr>

            <tr v-else v-for="person in filteredArtisans" :key="person.id" class="hover:bg-gray-50/50 transition duration-150 group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img :src="person.image" class="w-9 h-9 rounded-full object-cover border border-gray-100" alt="">
                  <span class="font-medium text-slate-700 text-sm">{{ person.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 text-sm">{{ person.craftType }}</td>
              <td class="px-6 py-4 text-slate-600 text-sm">{{ person.province }}</td>
              <td class="px-6 py-4">
                <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(person.status)}`">
                  {{ getStatusText(person.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-400 text-sm">{{ person.lastUpdate }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-3">
                  <NuxtLink :to="`/admin/edit-artisan/${person.id}`" class="text-slate-400 hover:text-slate-600 transition" title="แก้ไข">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </NuxtLink>
                  <button @click="openDeleteModal(person.id)" class="text-slate-400 hover:text-red-500 transition" title="ลบ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="flex items-center justify-between">
      <div class="text-sm text-slate-500">
        แสดง <span class="font-medium text-slate-700">{{ filteredArtisans.length }}</span> รายการ
      </div>
      <div class="flex items-center gap-1">
        <button class="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 rounded-md border border-gray-200 bg-white">ก่อนหน้า</button>
        <button class="w-8 h-8 flex items-center justify-center text-sm rounded-md bg-green-50 text-green-700 font-medium border border-green-200">1</button>
        <button class="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 rounded-md border border-gray-200 bg-white">ถัดไป</button>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="closeDeleteModal"></div>

        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all">
            <div class="p-6 text-center">
                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <svg class="text-red-600 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-2">ยืนยันการลบข้อมูล?</h3>
                <p class="text-sm text-gray-500 mb-6">
                    คุณแน่ใจหรือไม่ที่จะลบข้อมูลรายการนี้? <br>การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
                <div class="flex items-center justify-center gap-3">
                    <button 
                        @click="closeDeleteModal" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                        :disabled="isDeleting"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        @click="confirmDelete" 
                        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition flex items-center gap-2"
                        :disabled="isDeleting"
                    >
                        <span v-if="isDeleting" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        {{ isDeleting ? 'กำลังลบ...' : 'ลบข้อมูล' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>