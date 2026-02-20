<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';

// Interface ตรงกับที่ Backend ส่งมา (แปลง BigInt เป็น Int แล้ว)
interface GalleryItem {
  gallery_id: number;
  artisan_id: number;
  image_url: string;
  name_gallery: string;
  caption: string;
  sort_order: number | null;
  total_views: number; // Backend ส่งมาแน่นอน (ถ้าไม่มีเรา default เป็น 0 ใน SQL แล้ว)
}

const galleryItems = ref<GalleryItem[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');
const sortOrder = ref('default'); 
let searchTimeout: ReturnType<typeof setTimeout>;

const fetchGallery = async () => {
  isLoading.value = true;
  try {
    // เรียก API ที่เราเพิ่งแก้ (มันจะ JOIN ตาราง views มาให้แล้ว)
    const response = await axios.get<GalleryItem[]>('http://localhost:4000/galleryPage', {
      params: {
        search: searchQuery.value
      }
    });
    
    galleryItems.value = response.data;

  } catch (error) {
    console.error('Error fetching gallery:', error);
  } finally {
    isLoading.value = false;
  }
};

const sortedGalleryItems = computed(() => {
  let items = [...galleryItems.value]; 

  if (sortOrder.value === 'most_views') {
    // เรียงตามยอดวิว มาก -> น้อย
    return items.sort((a, b) => b.total_views - a.total_views);

  } else if (sortOrder.value === 'least_views') {
    // เรียงตามยอดวิว น้อย -> มาก
    return items.sort((a, b) => a.total_views - b.total_views);

  } else if (sortOrder.value === 'newest') {
    // ล่าสุด (ID มากขึ้นก่อน)
    return items.sort((a, b) => b.gallery_id - a.gallery_id);

  } else if (sortOrder.value === 'oldest') {
    // เก่าสุด
    return items.sort((a, b) => a.gallery_id - b.gallery_id);

  } else {
    // Default: เอาตามที่ Backend ส่งมา (ซึ่ง Backend เราตั้งให้เรียงตาม View เยอะสุดก่อนอยู่แล้ว หรือตาม sort_order)
    // แต่ถ้าใน Frontend อยากบังคับเรียงตาม sort_order (ลำดับการจัดวาง) ให้ใช้โค้ดเดิมของคุณ
    return items.sort((a, b) => {
      const orderA = a.sort_order ?? 9999;
      const orderB = b.sort_order ?? 9999;
      return orderA - orderB;
    });
  }
});

watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchGallery();
  }, 500);
});

onMounted(() => {
  fetchGallery();
});
</script>

<template>
  <section class="w-full py-8 md:py-12 bg-gray-50 min-h-screen">
    <div class="px-4 mx-auto max-w-[1400px]">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 font-heading">
            แกลเลอรีผลงาน
          </h2>
          <p class="text-gray-500 text-sm mt-1">รวมผลงานหัตถศิลป์จากปราชญ์ชาวบ้าน</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            v-model="sortOrder"
            class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none bg-white text-gray-700 cursor-pointer shadow-sm"
          >
            <option value="default">แนะนำ (ตามลำดับ)</option>
            <option value="most_views">ยอดนิยม (วิวมาก-น้อย)</option>
            <option value="least_views">ผู้เข้าชมน้อย-มาก</option>
            <option value="newest">ล่าสุด</option>
            <option value="oldest">เก่าสุด</option>
          </select>

          <div class="relative w-full md:w-72">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="ค้นหาผลงาน..." 
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all outline-none bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
         <div v-for="n in 8" :key="n" class="aspect-square bg-gray-200 rounded-2xl"></div>
      </div>

      <div v-else>
         <div v-if="sortedGalleryItems.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <p class="text-lg">ไม่พบผลงานที่ค้นหา "{{ searchQuery }}"</p>
             <button @click="searchQuery = ''" class="mt-2 text-emerald-600 hover:underline font-medium">
               ล้างคำค้นหา
             </button>
         </div>

         <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <NuxtLink 
              v-for="item in sortedGalleryItems" 
              :key="item.gallery_id" 
              :to="`/product/${item.gallery_id}`"
              class="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white block border border-gray-100"
            >
               <div class="aspect-square overflow-hidden bg-gray-100 relative">
                 <img 
                   :src="item.image_url" 
                   :alt="item.name_gallery"
                   class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                   loading="lazy"
                   @error="($event.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image'" 
                 />
                 
                 <div class="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {{ new Intl.NumberFormat().format(item.total_views) }}
                 </div>
               </div>
               
               <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 class="text-white font-bold text-lg truncate drop-shadow-md">{{ item.name_gallery }}</h3>
                  <p class="text-gray-200 text-sm line-clamp-2 mb-1" v-if="item.caption">{{ item.caption }}</p>
                  
                  <div class="text-gray-300 text-xs flex items-center gap-1 mt-1">
                     <span>เข้าชม {{ new Intl.NumberFormat().format(item.total_views) }} ครั้ง</span>
                  </div>
               </div>
            </NuxtLink>
         </div>
      </div>

    </div>
  </section>
</template>