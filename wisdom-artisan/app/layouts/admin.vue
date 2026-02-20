<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '~/components/Admin/Sidebar.vue'

const isSidebarOpen = ref(false)
const route = useRoute()

// ปิด Sidebar ทุกครั้งที่เปลี่ยนหน้า (บนมือถือ)
watch(() => route.path, () => {
  isSidebarOpen.value = false
})
</script>

<template>
  <div class="flex h-screen bg-[#F8F9FA] font-sans text-slate-800 overflow-hidden">
    
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity"
      @click="isSidebarOpen = false"
    ></div>

    <div 
      class="fixed inset-y-0 left-0 z-30 w-[280px] bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <AdminSidebar @close="isSidebarOpen = false" />
    </div>

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      
      <header class="bg-white border-b border-gray-100 p-4 flex items-center justify-between lg:hidden sticky top-0 z-10">
        <div class="flex items-center gap-3">
           <div class="text-emerald-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
           </div>
           <span class="font-bold text-lg text-slate-700">ปราชญ์ชาวบ้าน</span>
        </div>
        
        <button @click="isSidebarOpen = true" class="text-slate-500 hover:text-emerald-600 p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </header>

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>