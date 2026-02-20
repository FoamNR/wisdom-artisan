<script setup lang="ts">
import axios from 'axios'

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin-log"],
});

useSeoMeta({
  title: 'Wisdom Artisan - จัดการแกลเลอรี่ผลงาน',
  description: 'Dashboard สำหรับผู้ดูแลระบบจัดการแกลเลอรี่',
})

interface GalleryItem {
  gallery_id: number;
  name_gallery: string;
  caption: string;
  image_url: string;
  artisan_fname: string;
  artisan_lname: string;
  user_fname: string;
  user_lname: string;
}

const baseUrl = 'http://localhost:4000';
const galleryItems = ref<GalleryItem[]>([]);
const searchQuery = ref<string>('');

// --- โหลดข้อมูล ---
onMounted(async () => {
  await fetchGalleryItems();
});

const fetchGalleryItems = async () => {
  try {
    const response = await axios.get(`${baseUrl}/gallery-admin`, { withCredentials: true });
    galleryItems.value = response.data;
  } catch (error) {
    console.error('Error fetching gallery items:', error);
  }
};

// --- ส่วนจัดการ Pagination และ Search ---
const filteredItems = computed<GalleryItem[]>(() => {
  const query = searchQuery.value.toLowerCase();
  return galleryItems.value.filter(item =>
    item.name_gallery.toLowerCase().includes(query) ||
    item.artisan_fname.toLowerCase().includes(query) ||
    item.artisan_lname.toLowerCase().includes(query)
  );
});

const totalResults = computed<number>(() => galleryItems.value.length);
const shownResults = computed<number>(() => filteredItems.value.length);

const currentPage = ref<number>(1);
const perPage = ref<number>(10);

const totalPages = computed<number>(() =>
  Math.ceil(filteredItems.value.length / perPage.value)
);

const paginatedData = computed<GalleryItem[]>(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredItems.value.slice(start, start + perPage.value);
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// --- ส่วนจัดการ Delete Modal ---
const showDeleteModal = ref(false);
const itemToDelete = ref<number | null>(null);
const isDeleting = ref<number | null>(null);

const openDeleteModal = (gallery_id: number) => {
  itemToDelete.value = gallery_id;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

const deleteGallery = async () => {
  const id = itemToDelete.value;
  if (!id) return;

  isDeleting.value = id;
  try {
    await axios.delete(`${baseUrl}/gallery/${id}`, { withCredentials: true });
    
    galleryItems.value = galleryItems.value.filter(g => g.gallery_id !== id);

    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
    closeDeleteModal();
  } catch (error: any) {
    console.error("Error deleting gallery:", error);
    alert("เกิดข้อผิดพลาด: ไม่สามารถลบข้อมูลได้");
  } finally {
    isDeleting.value = null;
  }
};
</script>

<template>
  <div class="font-sans text-slate-800 p-4 md:p-6 min-h-screen">
    <div class="flex items-center justify-between mb-4 md:mb-6">
      <div class="text-xs md:text-sm text-slate-500">
        Admin Dashboard / <span class="font-medium text-slate-700">จัดการแกลเลอรี่ผลงาน</span>
      </div>
    </div>

    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 md:mb-8">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-slate-900">จัดการแกลเลอรี่ผลงาน</h1>
        <p class="text-slate-500 text-xs md:text-sm mt-1">เพิ่ม แก้ไข หรือลบรูปภาพผลงานของปราชญ์ชาวบ้าน</p>
      </div>

      <NuxtLink to="/admin/addgallery"
        class="flex items-center justify-center gap-2 bg-[#428a4a] hover:bg-[#367c3d] text-white px-4 py-2 rounded-lg shadow-sm font-medium transition text-sm md:text-base w-full md:w-auto">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        เพิ่มผลงานใหม่
      </NuxtLink>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
      
      <div class="p-4 md:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 class="text-lg font-bold text-slate-800 hidden md:block">รายการผลงานทั้งหมด</h2>
        <div class="relative w-full md:w-72">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อผลงาน, ปราชญ์..."
            class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm text-slate-700 placeholder-slate-400 transition">
        </div>
      </div>

      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-xs font-medium">
              <th class="px-6 py-4 font-normal w-1/12">รูปภาพ</th>
              <th class="px-6 py-4 font-normal w-3/12">ชื่อผลงาน</th>
              <th class="px-6 py-4 font-normal w-3/12">คำอธิบาย</th>
              <th class="px-6 py-4 font-normal w-2/12">เจ้าของผลงาน</th>
              <th class="px-6 py-4 font-normal w-2/12">ผู้บันทึก</th>
              <th class="px-6 py-4 font-normal text-right w-1/12">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in paginatedData" :key="item.gallery_id"
              class="hover:bg-gray-50/50 transition duration-150 group">
              <td class="px-6 py-4">
                <img 
                    v-if="item.image_url" 
                    :src="item.image_url.startsWith('http') ? item.image_url : `${baseUrl}/uploads/${item.image_url}`" 
                    alt="Work" 
                    class="w-12 h-12 object-cover rounded-md shadow-sm border border-gray-100"
                    @error="($event.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Img'"
                >
                <div v-else class="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">No Img</div>
              </td>
              <td class="px-6 py-4">
                <span class="font-bold text-slate-700 text-sm">{{ item.name_gallery }}</span>
              </td>
              <td class="px-6 py-4">
                 <p class="text-slate-500 text-sm line-clamp-2" :title="item.caption">{{ item.caption || '-' }}</p>
              </td>
              <td class="px-6 py-4 text-slate-600 text-sm">
                {{ item.artisan_fname }} {{ item.artisan_lname }}
              </td>
               <td class="px-6 py-4 text-slate-500 text-xs">
                {{ item.user_fname || 'ระบบ' }} {{ item.user_lname }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-3">
                  <NuxtLink :to="`/admin/edit-gallery/${item.gallery_id}`" class="text-slate-400 hover:text-green-600 transition" title="แก้ไข">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" />
                    </svg>
                  </NuxtLink>
                  <button class="text-slate-400 hover:text-red-500 transition"
                    @click="openDeleteModal(item.gallery_id)" :disabled="isDeleting === item.gallery_id">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
                      :class="isDeleting === item.gallery_id ? 'animate-pulse text-red-400' : ''">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredItems.length === 0">
                <td colspan="6" class="px-6 py-10 text-center text-slate-400 text-sm">ไม่พบข้อมูลแกลเลอรี่</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="md:hidden p-4 space-y-4 bg-gray-50/50">
        <div v-if="filteredItems.length === 0" class="text-center text-slate-400 text-sm py-8">
            ไม่พบข้อมูลแกลเลอรี่
        </div>
        
        <div v-for="item in paginatedData" :key="item.gallery_id" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
            <div class="flex-shrink-0">
                <img 
                    v-if="item.image_url" 
                    :src="item.image_url.startsWith('http') ? item.image_url : `${baseUrl}/uploads/${item.image_url}`" 
                    alt="Work" 
                    class="w-20 h-20 object-cover rounded-lg bg-gray-50 border border-gray-100"
                    @error="($event.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Img'"
                >
                <div v-else class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No Img</div>
            </div>
            
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-slate-800 text-sm truncate pr-2">{{ item.name_gallery }}</h3>
                    <div class="flex items-center gap-2">
                          <NuxtLink :to="`/admin/edit-gallery/${item.gallery_id}`" class="text-slate-400 hover:text-green-600 p-1" title="แก้ไข">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" /></svg>
                          </NuxtLink>
                          <button @click="openDeleteModal(item.gallery_id)" class="text-slate-400 hover:text-red-500 p-1">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                          </button>
                    </div>
                </div>
                
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ item.caption || 'ไม่มีคำอธิบาย' }}</p>
                
                <div class="mt-2 pt-2 border-t border-gray-50 flex flex-col gap-1">
                    <div class="text-xs text-slate-600 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        ปราชญ์: {{ item.artisan_fname }} {{ item.artisan_lname }}
                    </div>
                    <div class="text-[10px] text-slate-400">
                        ผู้ลง: {{ item.user_fname }}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div class="p-4 md:p-5 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="text-xs md:text-sm text-slate-500 text-center md:text-left">
          Showing {{ shownResults }} of {{ totalResults }} results
        </div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40">
            <span class="sr-only">Previous</span>
            ‹
          </button>
          
          <button v-for="n in totalPages" :key="n" @click="goToPage(n)" 
             :class="[
            'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset',
            currentPage === n
              ? 'bg-green-50 text-green-600 ring-green-500'
              : 'text-gray-700 ring-gray-200 hover:bg-gray-50 hidden md:inline-flex'
            ]">
            {{ n }}
          </button>
          
          <span class="md:hidden relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">
             {{ currentPage }} / {{ totalPages }}
          </span>

          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40">
            <span class="sr-only">Next</span>
            ›
          </button>
        </nav>
      </div>
    </div>
  </div>

  <div v-if="showDeleteModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-fadeIn">
      <h3 class="text-lg font-bold text-slate-800 mb-3">
        ยืนยันการลบผลงาน
      </h3>
      <p class="text-slate-600 text-sm mb-6">
        คุณแน่ใจหรือไม่ว่าต้องการลบผลงานนี้?<br>
        การกระทำนี้ <span class="font-semibold text-red-500">ไม่สามารถย้อนกลับได้</span>
      </p>
      <div class="flex flex-col-reverse md:flex-row justify-end gap-3">
        <button @click="closeDeleteModal"
          class="w-full md:w-auto px-4 py-2 bg-gray-200 text-slate-700 rounded-lg hover:bg-gray-300 text-sm transition">
          ยกเลิก
        </button>
        <button @click="deleteGallery" :disabled="isDeleting === itemToDelete"
          class="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 text-sm transition text-center">
          {{ isDeleting === itemToDelete ? "กำลังลบ..." : "ลบ" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.15s ease-out;
}
</style>