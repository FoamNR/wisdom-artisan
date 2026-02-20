<script setup lang="ts">
import axios from 'axios';

definePageMeta({ layout: false })

useSeoMeta({
    title: 'Product Details - Wisdom Artisan',
    description: 'แพลตฟอร์มรวบรวมภูมิปัญญาและงานฝีมือไทยจากช่างฝีมือทั่วประเทศ'
})

const route = useRoute();

interface Artisan {
    id: number;
    name: string;
    avatar: string;
    role: string;
    province: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    category: string;
    image: string;
    artisan: Artisan;
}

const product = ref<Product | null>(null);
const loading = ref(true);
const error = ref(null);

const fetchProduct = async () => {
    try {
        loading.value = true;
        const id = route.params.id;
        const response = await axios.get(`http://localhost:4000/galleryPage/${id}`);
        const data = response.data;

        product.value = {
            id: data.gallery_id,
            name: data.name_gallery,
            category: data.category_name,
            description: data.caption,
            image: data.image_url,
            artisan: {
                id: data.artisan_id,
                name: `${data.fname} ${data.lname}`,
                role: 'ศิลปินพื้นบ้าน',
                avatar: data.profile_img || 'https://via.placeholder.com/150',
                province: data.province || ''
            }   
        };
    } catch (err: any) {
        console.error('Error fetching gallery:', err);
        error.value = err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลได้';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchProduct();
});

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price);
};
</script>

<template>
    <navbar />
    <div class="min-h-screen bg-white">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">

            <div v-if="loading" class="flex items-center justify-center py-32">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4">
                    </div>
                    <p class="text-gray-500 text-lg">กำลังโหลดข้อมูล...</p>
                </div>
            </div>

            <div v-else-if="error" class="flex items-center justify-center py-32">
                <div class="text-center">
                    <svg class="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-red-500 text-lg font-medium">{{ error }}</p>
                </div>
            </div>

            <div v-else-if="product" class="space-y-8">

                <nav class="flex items-center text-sm text-gray-500 space-x-2">
                    <a href="/" class="hover:text-indigo-600 transition-colors">หน้าแรก</a>
                    <span class="text-gray-300">/</span>
                    <a href="#" class="hover:text-indigo-600 transition-colors">{{ product.category }}</a>
                    <span class="text-gray-300">/</span>
                    <span class="text-gray-900 font-medium">{{ product.name }}</span>
                </nav>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

                    <div class="order-1 lg:order-1">
                        <div class="sticky top-8">
                            <div
                                class="aspect-square w-full overflow-hidden rounded-2xl shadow-xl bg-gray-50 border border-gray-100">
                                <img v-if="product.image" :src="product.image" :alt="product.name"
                                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-in-out" />
                                <div v-else class="w-full h-full flex items-center justify-center">
                                    <div class="text-center text-gray-400">
                                        <svg class="mx-auto h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p class="text-lg">ไม่มีรูปภาพ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="order-2 lg:order-2 flex flex-col">

                        <div class="space-y-6">
                            <div>
                                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                                    {{ product.name }}
                                </h1>
                                <div class="inline-flex items-center px-4 py-2 bg-indigo-50 rounded-full">
                                    <span class="text-sm font-medium text-indigo-600">หมวดหมู่:</span>
                                    <span class="ml-2 text-sm font-semibold text-indigo-700">{{ product.category
                                    }}</span>
                                </div>
                            </div>

                            <hr class="border-gray-200" />

                            <div class="space-y-3">
                                <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                                    <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    รายละเอียดผลงาน
                                </h2>
                                <p class="text-gray-600 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                                    {{ product.description }}
                                </p>
                            </div>

                            <hr class="border-gray-200" />

                            <div
                                class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <p class="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">ผลงานโดย
                                </p>
                                <div class="flex items-center gap-4">
                                    <NuxtLink :to="`/artisan/${product.artisan.id}`"
                                        class="flex items-center gap-4 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                                        <div class="relative">
                                            <img :src="product.artisan.avatar" :alt="product.artisan.name"
                                                class="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover" />
                                            <div
                                                class="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="flex-1">
                                            <h3 class="text-xl font-bold text-gray-900 mb-1">{{ product.artisan.name }}
                                            </h3>
                                            <p class="text-sm font-medium text-indigo-600">{{ product.category }}
                                            </p>
                                            <p class="text-sm font-medium text-indigo-600">จังหวัด {{ product.artisan.province }}
                                            </p>
                                        </div>
                                    </NuxtLink>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Footer />
</template>