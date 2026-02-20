<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

definePageMeta({ layout: false })

useSeoMeta({
    title: 'Search - Wisdom Artisan',
    description: 'แพลตฟอร์มรวบรวมภูมิปัญญาและงานฝีมือไทยจากช่างฝีมือทั่วประเทศ'
})

// 1. Interface สำหรับข้อมูล Artisan
interface ArtisanResult {
  artisan_id: number
  gallery_id: number
  fname: string
  lname: string
  category_name: string
  name_gallery: string | null
  image_url: string | null
  profile_img: string | null
}

const route = useRoute()
const router = useRouter()

// ตัวแปร State สำหรับจัดการหน้าจอ
const results = ref<ArtisanResult[]>([]) // เก็บข้อมูล
const pending = ref(false)               // สถานะกำลังโหลด
const error = ref(false)                 // สถานะ Error

// 2. ดึงค่า q จาก URL (Reactive)
const searchQuery = computed(() => route.query.q as string || '')

// ตัวแปรสำหรับ input search ในหน้านี้
const localSearch = ref(searchQuery.value)

// 3. ฟังก์ชันดึงข้อมูลด้วย Axios
const fetchData = async () => {
  pending.value = true
  error.value = false

  try {
    // ส่ง params: { q: ... } จะได้ url เป็น /search?q=keyword
    const response = await axios.get('http://localhost:4000/search', {
      params: {
        q: searchQuery.value
      }
    })

    // Axios response.data คือข้อมูลเลย ไม่ต้องแปลง json
    results.value = response.data

  } catch (err) {
    console.error('Error fetching search results:', err)
    error.value = true
  } finally {
    pending.value = false
  }
}

// 4. Watcher: เฝ้าดูการเปลี่ยนของ URL Query
// immediate: true จะทำให้รันครั้งแรกที่เข้าหน้าเว็บด้วย
watch(searchQuery, (newVal) => {
  localSearch.value = newVal // อัปเดตช่องค้นหาให้ตรงกับ URL
  fetchData()
}, { immediate: true })

// ฟังก์ชันสำหรับค้นหาซ้ำในหน้านี้ (แค่เปลี่ยน URL แล้ว Watcher จะทำงานเอง)
const handleNewSearch = () => {
  router.push({ query: { q: localSearch.value } })
}
</script>

<template>
  <div>
    <Navbar />

    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 font-prompt">
              ผลการค้นหา: "{{ searchQuery }}"
            </h1>
            <p class="text-gray-500 text-sm mt-1 font-prompt" v-if="!pending && !error">
              พบข้อมูล {{ results.length }} รายการ
            </p>
          </div>

          <form @submit.prevent="handleNewSearch" class="relative w-full md:w-80">
            <input v-model="localSearch" type="text"
              class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-prompt text-sm"
              placeholder="ค้นหาใหม่...">
            <button type="submit" class="absolute right-2 top-1.5 p-1 text-gray-400 hover:text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        <div v-if="pending" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>

        <div v-else-if="error" class="text-center py-10 text-red-500 font-prompt">
          เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่ภายหลัง
        </div>

        <div v-else-if="results.length === 0"
          class="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 font-prompt">ไม่พบข้อมูลที่ค้นหา</h3>
          <p class="mt-1 text-sm text-gray-500 font-prompt">ลองใช้คำค้นหาอื่น หรือตรวจสอบตัวสะกด</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <NuxtLink v-for="item in results" :key="item.artisan_id"
            :to="item.gallery_id ? `/product/${item.gallery_id}` : `/artisan/${item.artisan_id}`"
            class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
            <div class="relative h-48 overflow-hidden bg-gray-200">
              <img :src="item.image_url || item.profile_img || 'https://via.placeholder.com/400x300?text=No+Image'" :alt="item.fname"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div
                class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-emerald-700 font-prompt shadow-sm">
                {{ item.category_name }}
              </div>
            </div>

            <div class="p-4 flex-1 flex flex-col">
              <h3
                class="text-lg font-bold text-gray-900 mb-1 font-prompt group-hover:text-emerald-600 transition-colors">
                {{ item.fname }} {{ item.lname }}
              </h3>
              <p class="text-sm text-gray-500 mb-3 line-clamp-2 font-prompt">
                {{ item.name_gallery || 'ช่างฝีมือผู้ทรงคุณค่า' }}
              </p>

              <div class="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                <span class="text-xs text-gray-400 font-prompt">ดูรายละเอียด</span>
                <span
                  class="p-1.5 bg-gray-50 rounded-full text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.font-prompt {
  font-family: 'Prompt', 'Kanit', sans-serif;
}
</style>