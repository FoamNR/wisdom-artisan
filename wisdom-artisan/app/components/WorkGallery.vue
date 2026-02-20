<script setup lang="ts">
import axios from 'axios';

interface GalleryItem {
  gallery_id: number;
  artisan_id: number;
  image_url: string;
  name_gallery: string;
  caption: string;
  sort_order: number | null;
}

const galleryItems = ref<GalleryItem[]>([]);
const isLoading = ref(true);

const fetchGallery = async () => {
  try {
    const response = await axios.get<GalleryItem[]>('http://localhost:4000/galleryPage');
    const data = response.data;
    
    // Logic การเรียงลำดับ (เหมือนเดิม)
    galleryItems.value = data.sort((a, b) => {
      const orderA = a.sort_order ?? 9999;
      const orderB = b.sort_order ?? 9999;
      return orderA - orderB;
    });

  } catch (error) {
    console.error('Error fetching gallery:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchGallery();
});
</script>

<template>
  <section class="w-full py-8 md:py-12">
    <div class="px-4 mx-auto max-w-[1400px]">
      
      <div class="flex items-center justify-between mb-6 md:mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 font-heading">
          แกลเลอรีผลงาน
        </h2>
        <a href="/collections" class="text-emerald-600 hover:text-emerald-700 text-sm md:text-base font-medium transition-colors">
          ดูทั้งหมด &rarr;
        </a>
      </div>

      <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
        <div v-for="n in 4" :key="n" class="aspect-square bg-gray-200 rounded-2xl"></div>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        
        <NuxtLink :to="`/product/${item.gallery_id}`"
          v-for="item in galleryItems" 
          :key="item.gallery_id"
          class="group relative overflow-hidden rounded-2xl aspect-square bg-gray-100 cursor-pointer"
        >
          <img 
            :src="item.image_url" 
            :alt="item.name_gallery" 
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=No+Image'"
          />

          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 class="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              {{ item.name_gallery }}
            </h3>
            <p v-if="item.caption" class="text-gray-200 text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 line-clamp-2">
              {{ item.caption }}
            </p>
          </div>
        </NuxtLink>

      </div>
    </div>
  </section>
</template>

<style scoped>
.font-heading {
  font-family: 'Prompt', 'Kanit', sans-serif;
}
</style>