<script setup lang="ts">
import axios from 'axios'

definePageMeta({
  layout: false
})

useSeoMeta({
    title: 'Artisans - Wisdom Artisan',
    description: 'แพลตฟอร์มรวบรวมภูมิปัญญาและงานฝีมือไทยจากช่างฝีมือทั่วประเทศ'
})

// 1. [UPDATED] เพิ่ม total_views ใน Interface
interface Artisan {
  artisan_id: number
  fname: string
  lname: string
  category_name: string
  province: string
  profile_img: string | null
  total_views?: number
}

interface Category {
  category_id: number
  category_name: string
}

interface ProvinceData {
  province: string
}

const search = ref<string>('')
const selectedCraft = ref<string>('')
const selectedProvince = ref<string>('')
// 2. [NEW] ตัวแปรเก็บสถานะการเรียงลำดับ
const sortOrder = ref<string>('most_views')

const artisans = ref<Artisan[]>([])
const categories = ref<Category[]>([])
const provinces = ref<ProvinceData[]>([])

const pending = ref<boolean>(false)
const error = ref<any>(null)

const API_BASE_URL = 'http://localhost:4000'

const fetchArtisans = async () => {
  try {
    pending.value = true
    error.value = null

    const params: Record<string, string> = {}
    if (search.value) params.search = search.value
    if (selectedCraft.value && selectedCraft.value !== 'ทั้งหมด') params.category = selectedCraft.value
    if (selectedProvince.value && selectedProvince.value !== 'ทั้งหมด') params.province = selectedProvince.value

    const response = await axios.get<Artisan[]>(`${API_BASE_URL}/artisan`, { params })
    artisans.value = response.data
  } catch (err) {
    error.value = err
    console.error('Error fetching artisans:', err)
  } finally {
    pending.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await axios.get<Category[]>(`${API_BASE_URL}/category`) 
    categories.value = response.data
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

const fetchProvinces = async () => {
  try {
    const response = await axios.get<ProvinceData[]>(`${API_BASE_URL}/artisan/artisan/by-province`)
    provinces.value = response.data
  } catch (err) {
    console.error('Error fetching provinces:', err)
  }
}

const craftOptions = computed<string[]>(() => {
  const options = ['ทั้งหมด']
  if (categories.value.length > 0) {
    options.push(...categories.value.map(c => c.category_name))
  }
  return options
})

const provinceOptions = computed<string[]>(() => {
  const options = ['ทั้งหมด']
  if (provinces.value.length > 0) {
    options.push(...provinces.value.map(p => p.province))
  }
  return options
})

// 3. [NEW] Logic การเรียงลำดับ (Client-side Sorting)
const sortedArtisans = computed(() => {
  const items = [...artisans.value] // Clone array

  if (sortOrder.value === 'most_views') {
    return items.sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
  } else if (sortOrder.value === 'least_views') {
    return items.sort((a, b) => (a.total_views || 0) - (b.total_views || 0))
  } else if (sortOrder.value === 'newest') {
    return items.sort((a, b) => b.artisan_id - a.artisan_id)
  } else if (sortOrder.value === 'oldest') {
    return items.sort((a, b) => a.artisan_id - b.artisan_id)
  }
  
  return items
})

const getImageUrl = (img: string | null): string => {
  if (!img) return 'https://placehold.co/600x400?text=No+Image'
  if (img.startsWith('http')) return img
  return `${API_BASE_URL}${img}`
}

watch([search, selectedCraft, selectedProvince], () => {
  fetchArtisans()
})

onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    fetchProvinces(),
    fetchArtisans()
  ])
})
</script>

<template>
  <Navbar />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen">

    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">ค้นหาปราชญ์ชาวบ้าน</h1>
      <p class="text-gray-600">ค้นหาตามชื่อ ประเภทงานฝีมือ หรือจังหวัด</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      <input 
        v-model="search" 
        type="text" 
        placeholder="ค้นหาชื่อ..."
        class="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
      >

      <select 
        v-model="selectedCraft"
        class="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
      >
        <option value="">ประเภทงานฝีมือ</option>
        <option v-for="craft in craftOptions" :key="craft" :value="craft">{{ craft }}</option>
      </select>

      <select 
        v-model="selectedProvince"
        class="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
      >
        <option value="">จังหวัด</option>
        <option v-for="province in provinceOptions" :key="province" :value="province">{{ province }}</option>
      </select>

      <select 
        v-model="sortOrder"
        class="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full bg-white"
      >
        <option value="most_views">ยอดนิยม (วิวมาก-น้อย)</option>
        <option value="least_views">ผู้เข้าชมน้อย-มาก</option>
        <option value="newest">ล่าสุด</option>
        <option value="oldest">เก่าสุด</option>
      </select>
    </div>

    <div v-if="pending" class="text-center py-16 text-gray-500">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto mb-2"></div>
      กำลังโหลด...
    </div>

    <div v-else-if="error" class="text-center py-16 text-red-500">
      เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
    </div>

    <div v-else>
      <p class="text-sm text-gray-600 mb-4">พบข้อมูลทั้งหมด {{ artisans.length }} รายการ</p>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <NuxtLink 
          v-for="artisan in sortedArtisans" 
          :key="artisan.artisan_id"
          :to="`/artisan/${artisan.artisan_id}`" 
          class="group block"
        >
          <div class="relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white">
            
            <img 
              :src="getImageUrl(artisan.profile_img)" 
              :alt="`${artisan.fname} ${artisan.lname}`"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              @error="($event.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image'"
            >

            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>

            <div class="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
               </svg>
               {{ new Intl.NumberFormat().format(artisan.total_views || 0) }}
            </div>

            <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 class="font-bold text-lg truncate mb-1 drop-shadow-md">
                {{ artisan.fname }} {{ artisan.lname }}
              </h3>
              <div class="flex items-center gap-1 mb-1">
                  <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <p class="text-sm text-emerald-200 font-medium truncate">{{ artisan.category_name }}</p>
              </div>
              
              <div class="flex items-center text-xs text-gray-300">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ artisan.province }}
              </div>
            </div>

          </div>
        </NuxtLink>
      </div>

      <div v-if="artisans.length === 0" class="text-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p>ไม่พบข้อมูลที่ค้นหา</p>
        <button @click="search = ''; selectedCraft = ''; selectedProvince = ''" class="text-emerald-600 text-sm mt-2 hover:underline">ล้างตัวกรองทั้งหมด</button>
      </div>
    </div>

  </div>
  <Footer />
</template>