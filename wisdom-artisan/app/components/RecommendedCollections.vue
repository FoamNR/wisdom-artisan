<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 1. Interface เหมือนเดิม
interface Category {
  category_id: number;
  category_name: string;
  image_count: string;
  image_url: string | null;
}

// 2. สร้างตัวแปร State เพื่อเก็บค่าต่างๆ
const categories = ref<Category[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const fetchCategories = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('http://localhost:4000/category/home')
    categories.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    errorMessage.value = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})

const getImageUrl = (url: string | null) => {
  if (url) return url
  return 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image' 
}
</script>

<template>
  <section class="w-full py-8 md:py-12">
    <div class="px-4 mx-auto max-w-[1400px]">
      
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 font-heading">
        คอลเลกชันแนะนำ
      </h2>

      <div v-if="isLoading" class="text-center py-10 text-gray-500">
        <span class="loading loading-spinner loading-lg"></span> กำลังโหลดข้อมูล...
      </div>

      <div v-else-if="errorMessage" class="text-center py-10 text-red-500">
        {{ errorMessage }}
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        
        <div 
          v-for="item in categories" 
          :key="item.category_id"
          class="group cursor-pointer flex flex-col"
        >
          <div class="overflow-hidden rounded-2xl aspect-[4/3] mb-4 bg-gray-100 relative shadow-sm transition-shadow hover:shadow-md">
            <img 
              :src="getImageUrl(item.image_url)" 
              :alt="item.category_name" 
              class="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
          </div>

          <div class="flex flex-col">
            <h3 class="text-base md:text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300 font-heading">
              {{ item.category_name }}
            </h3>
            <span class="text-sm text-gray-500 font-light mt-1">
              {{ item.image_count }} ผลงาน
            </span>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
.font-heading {
  font-family: 'Prompt', 'Kanit', sans-serif;
}
</style>