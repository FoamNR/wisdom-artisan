<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('Navigating to search:', searchQuery.value)
    // สั่งให้เปลี่ยนหน้าไปที่ /search?q=ค่าที่พิมพ์
    router.push({ 
      path: '/search', 
      query: { q: searchQuery.value } 
    })
  }
}
</script>

<template>
  <div class="w-full px-4 py-6 md:px-6 md:py-10 max-w-[1400px] mx-auto">
    <div class="relative w-full h-[280px] sm:h-[350px] md:h-[450px] rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl group isolate">
      
      <img 
        src="https://image.makewebcdn.com/makeweb/0/ik7KhtWb0/Blog/Artisan__19_.png?v=202405291424" 
        alt="Thai Craft Background" 
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div class="absolute inset-0 bg-black/40 bg-gradient-to-t"></div>

      <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 w-full">
        <h1 class="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4 drop-shadow-lg tracking-wide leading-tight font-prompt">
          ค้นพบภูมิปัญญาและงานฝีมือไทย
        </h1>

        <p class="text-gray-200 text-xs sm:text-sm md:text-lg mb-6 md:mb-10 font-light drop-shadow-md max-w-lg md:max-w-2xl mx-auto opacity-90 font-prompt">
          สำรวจเรื่องราวและผลงานอันล้ำค่าจากช่างฝีมือทั่วประเทศ
        </p>

        <div class="w-full max-w-xs sm:max-w-md md:max-w-2xl">
          <form @submit.prevent="handleSearch" class="relative">
            <div class="w-full bg-white rounded-full p-1 pl-4 md:p-1.5 md:pl-6 shadow-2xl flex items-center transition-all focus-within:ring-4 focus-within:ring-emerald-500/30">
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="ค้นหาจากชื่อ, ประเภทงาน..." 
                class="flex-1 bg-transparent text-gray-700 placeholder-gray-400 outline-none text-xs sm:text-sm md:text-base py-2 min-w-0 font-prompt"
              />
              <button 
                type="submit"
                class="bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs sm:text-sm md:text-base rounded-full px-4 py-2 md:px-8 md:py-3 ml-2 transition-colors duration-300 shrink-0 font-prompt"
              >
                ค้นหา
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.font-prompt {
  font-family: 'Prompt', sans-serif;
}
</style>