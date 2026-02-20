<script setup lang="ts">
import { ref } from 'vue'

// สถานะสำหรับเปิด/ปิดเมนูบนมือถือ
const isMenuOpen = ref(false)

const menuItems = [
  { name: 'หน้าหลัก', path: '/' },
  { name: 'ปราชญ์', path: '/artisans' },
  { name: 'คอลเลกชัน', path: '/collections' },
  { name: 'เกี่ยวกับ', path: '/about' }
]

// ฟังก์ชันปิดเมนูเมื่อคลิก Link (เพื่อให้ UX ดีขึ้น)
const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <nav class="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        
        <NuxtLink to="/" class="flex items-center gap-2 group cursor-pointer" @click="closeMenu">
          <div class="text-emerald-500 transition-transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="text-emerald-700 font-bold text-xl tracking-tight">ปราชญ์ชาวบ้าน</span>
        </NuxtLink>

        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink 
            v-for="item in menuItems" 
            :key="item.name"
            :to="item.path"
            class="group relative py-2 text-gray-600 hover:text-emerald-600 font-medium text-sm transition-colors duration-200"
            active-class="text-emerald-600"
          >
            {{ item.name }}
            
            <span class="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            
            <span 
              class="absolute bottom-0 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
              :class="[ $route.path === item.path ? 'w-full' : 'w-0' ]"
            ></span>
          </NuxtLink>
        </div>

        <div class="md:hidden flex items-center">
          <button @click="isMenuOpen = !isMenuOpen" class="text-gray-500 hover:text-emerald-600 p-2">
            <svg v-if="!isMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div v-show="isMenuOpen" class="md:hidden border-t border-gray-100 bg-gray-50">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <NuxtLink 
          v-for="item in menuItems" 
          :key="item.name"
          :to="item.path"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-white transition-all"
          active-class="text-emerald-600 bg-emerald-50 font-bold"
          @click="closeMenu"
        >
          {{ item.name }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>