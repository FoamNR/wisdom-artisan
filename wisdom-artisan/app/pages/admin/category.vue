<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-log']
})
useSeoMeta({
  title: 'Wisdom Artisan - จัดการหมวดหมู่งานฝีมือ',
  ogTitle: 'Wisdom Artisan - จัดการหมวดหมู่งานฝีมือ',
  description: 'Dashboard สำหรับผู้ดูแลระบบฐานข้อมูลปราชญ์ชาวบ้าน',
})

interface Category {
  category_id: number
  category_name: string
  description: string
  artisan_count: number
}

const categories = ref<Category[]>([])
const searchQuery = ref<string>('')

// --- โหลดข้อมูล ---
onMounted(async () => {
  await fetchCategories()
})

const fetchCategories = async () => {
  try {
    const res = await axios.get<Category[]>('http://localhost:4000/category/', {
      withCredentials: true
    })
    categories.value = res.data
  } catch (error: any) {
    console.error('Error loading categories:', error?.response?.data || error)
  }
}

// --- ส่วนจัดการ Pagination และ Search ---
const filteredCategories = computed<Category[]>(() => {
  return categories.value.filter(item =>
    item.category_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalResults = computed<number>(() => categories.value.length)
const shownResults = computed<number>(() => filteredCategories.value.length)

const currentPage = ref<number>(1)
const perPage = ref<number>(10)

const totalPages = computed<number>(() =>
  Math.ceil(filteredCategories.value.length / perPage.value)
)

const paginatedData = computed<Category[]>(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredCategories.value.slice(start, start + perPage.value)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// --- [NEW] ส่วนจัดการ Edit Modal (แก้ไขข้อมูล) ---
const showEditModal = ref(false)
const isSaving = ref(false)
// ตัวแปรสำหรับเก็บข้อมูลที่กำลังแก้ไข
const editingForm = ref({
  category_id: 0,
  category_name: '',
  description: ''
})

// เปิด Modal แก้ไข และก๊อปปี้ข้อมูลเดิมมาใส่
const openEditModal = (category: Category) => {
  editingForm.value = {
    category_id: category.category_id,
    category_name: category.category_name,
    description: category.description
  }
  showEditModal.value = true
}

// ปิด Modal แก้ไข
const closeEditModal = () => {
  showEditModal.value = false
  // Reset form (optional)
  editingForm.value = { category_id: 0, category_name: '', description: '' }
}

// ฟังก์ชันบันทึกการแก้ไข
// ฟังก์ชันบันทึกการแก้ไข
const updateCategory = async () => {
  // 1. ตรวจสอบความถูกต้องของข้อมูลเบื้องต้น
  if (!editingForm.value.category_name.trim()) {
    alert("กรุณากรอกชื่อหมวดหมู่")
    return
  }

  isSaving.value = true
  try {
    // 2. ยิง API ไปที่ URL: http://localhost:4000/category/{id}
    // ตรงกับ router.put('/:category_id', ...)
    const res = await axios.put(`http://localhost:4000/category/${editingForm.value.category_id}`, {
      category_name: editingForm.value.category_name,
      description: editingForm.value.description
    }, {
      withCredentials: true // ส่ง cookie/token ไปด้วย (สำหรับ authenticateToken)
    })

    if (res.data.error) {
        throw new Error(res.data.error || res.data.message)
    }

    const index = categories.value.findIndex(c => c.category_id === editingForm.value.category_id)
    if (index !== -1 && categories.value[index]) {
      categories.value[index].category_name = editingForm.value.category_name
      categories.value[index].description = editingForm.value.description
    }
    closeEditModal()

  } catch (error: any) {
    console.error("Error updating category:", error)
    
    // ดึงข้อความ Error มาแสดง
    const errorMsg = error?.response?.data?.message || error?.message || "เกิดข้อผิดพลาดในการบันทึก"
    alert(`เกิดข้อผิดพลาด: ${errorMsg}`)
  } finally {
    isSaving.value = false
  }
}

// --- ส่วนจัดการ Delete Modal ---
const showDeleteModal = ref(false)
const categoryToDelete = ref<number | null>(null)
const isDeleting = ref<number | null>(null)

const openDeleteModal = (category_id: number) => {
  categoryToDelete.value = category_id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  categoryToDelete.value = null
}

const deleteCategory = async () => {
  const id = categoryToDelete.value
  if (!id) return

  isDeleting.value = id

  try {
    await axios.delete(`http://localhost:4000/category/${id}`, {
      withCredentials: true
    })

    categories.value = categories.value.filter(c => c.category_id !== id)

    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }

    closeDeleteModal()

  } catch (error: any) {
    console.error("Error deleting category:", error?.response?.data || error)
    alert("เกิดข้อผิดพลาด: ไม่สามารถลบข้อมูลได้")
  } finally {
    isDeleting.value = null
  }
}
</script>

<template>
  <div class="font-sans text-slate-800 p-6 min-h-screen">
    <div class="flex items-center justify-between mb-6">
      <div class="text-sm text-slate-500">
        Admin Dashboard / <span class="font-medium text-slate-700">จัดการหมวดหมู่งานฝีมือ</span>
      </div>
    </div>

    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">จัดการหมวดหมู่งานฝีมือ</h1>
        <p class="text-slate-500 text-sm mt-1">เพิ่ม แก้ไข หรือลบหมวดหมู่งานฝีมือสำหรับข้อมูลปราชญ์</p>
      </div>

      <NuxtLink to="/admin/addcategory"
        class="flex items-center gap-2 bg-[#428a4a] hover:bg-[#367c3d] text-white px-4 py-2 rounded-lg shadow-sm font-medium transition">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        เพิ่มหมวดหมู่ใหม่
      </NuxtLink>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm">

      <div class="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 class="text-lg font-bold text-slate-800">รายการหมวดหมู่ทั้งหมด</h2>
        <div class="relative w-full md:w-72">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาหมวดหมู่..."
            class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm text-slate-700 placeholder-slate-400 transition">
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-xs font-medium">
              <th class="px-6 py-4 font-normal w-1/4">ชื่อหมวดหมู่</th>
              <th class="px-6 py-4 font-normal w-2/4">คำอธิบาย</th>
              <th class="px-6 py-4 font-normal w-1/6 text-center">จำนวนรายการ</th>
              <th class="px-6 py-4 font-normal text-right w-1/12"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="category in paginatedData" :key="category.category_id"
              class="hover:bg-gray-50/50 transition duration-150 group">

              <td class="px-6 py-5">
                <span class="font-bold text-slate-700 text-sm">{{ category.category_name }}</span>
              </td>

              <td class="px-6 py-5 text-slate-500 text-sm">
                {{ category.description }}
              </td>

              <td class="px-6 py-5 text-slate-500 text-sm text-center">
                {{ category.artisan_count }}
              </td>

              <td class="px-6 py-5 text-right">
                <div class="flex items-center justify-end gap-4">
                  <button @click="openEditModal(category)" class="text-slate-400 hover:text-green-600 transition"
                    title="แก้ไข">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="transform rotate-0">
                      <path
                        d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" />
                    </svg>
                  </button>
                  <button class="text-slate-400 hover:text-red-500 transition"
                    :title="isDeleting === category.category_id ? 'กำลังลบ...' : 'ลบ'"
                    @click="openDeleteModal(category.category_id)" :disabled="isDeleting === category.category_id">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
                      :class="isDeleting === category.category_id ? 'animate-pulse text-red-400' : ''">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-5 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="text-sm text-slate-500">
          Showing {{ shownResults }} of {{ totalResults }} results
        </div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40">
            <span class="sr-only">Previous</span>
            ‹
          </button>
          <button v-for="n in totalPages" :key="n" @click="goToPage(n)" :class="[
            'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset',
            currentPage === n
              ? 'bg-green-50 text-green-600 ring-green-500'
              : 'text-gray-700 ring-gray-200 hover:bg-gray-50'
          ]">
            {{ n }}
          </button>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40">
            <span class="sr-only">Next</span>
            ›
          </button>
        </nav>
      </div>
    </div>
  </div>

  <div v-if="showEditModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 animate-fadeIn">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-slate-800">แก้ไขข้อมูลหมวดหมู่</h3>
        <button @click="closeEditModal" class="text-slate-400 hover:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อหมวดหมู่</label>
          <input v-model="editingForm.category_name" type="text"
            class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-slate-700">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย</label>
          <textarea v-model="editingForm.description" rows="3"
            class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-slate-700"></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-8">
        <button @click="closeEditModal"
          class="px-4 py-2 bg-gray-100 text-slate-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition">
          ยกเลิก
        </button>
        <button @click="updateCategory" :disabled="isSaving"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition disabled:opacity-50 flex items-center gap-2">
          <span v-if="isSaving"
            class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          {{ isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="showDeleteModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-fadeIn">
      <h3 class="text-lg font-bold text-slate-800 mb-3">
        ยืนยันการลบหมวดหมู่
      </h3>
      <p class="text-slate-600 text-sm mb-6">
        คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?<br>
        การกระทำนี้ <span class="font-semibold text-red-500">ไม่สามารถย้อนกลับได้</span>
      </p>
      <div class="flex justify-end gap-3">
        <button @click="closeDeleteModal"
          class="px-4 py-2 bg-gray-200 text-slate-700 rounded-lg hover:bg-gray-300 text-sm transition">
          ยกเลิก
        </button>
        <button @click="deleteCategory" :disabled="isDeleting === categoryToDelete"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 text-sm transition">
          {{ isDeleting === categoryToDelete ? "กำลังลบ..." : "ลบ" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.15s ease-out;
}
</style>