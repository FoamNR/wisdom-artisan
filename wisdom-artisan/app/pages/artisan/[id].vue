<script setup lang="ts">
import axios from 'axios'

definePageMeta({ layout: false })

useSeoMeta({
    title: 'Artisan Profile - Wisdom Artisan',
    description: 'แพลตฟอร์มรวบรวมภูมิปัญญาและงานฝีมือไทยจากช่างฝีมือทั่วประเทศ'
})

const route = useRoute()
// const config = useRuntimeConfig() 

const API_BASE = 'http://localhost:4000'

// 1. ปรับ Interface เพิ่ม product_id
interface ArtisanResponse {
    artisan_id: number
    fname: string
    lname: string
    profile_img: string
    district: string
    province: string
    phone: string // เพิ่ม
    biography: string
    category_name: string
    image_url: string
    gallery_id: number // เพิ่มฟิลด์นี้เพื่อให้มี ID สำหรับทำ Link
}

interface Award {
    award_id: number
    artisan_id: number
    award_title: string
    file_url: string
    received_date: string
    award_description: string
}

// 2. ปรับ Type ของ galleryImages ให้เก็บ Object แทน String
const artisan = ref<ArtisanResponse | null>(null)
const galleryImages = ref<{ id: number; url: string }[]>([])
const awards = ref<Award[]>([])
const isLoading = ref(true)

const getFullImageUrl = (path: string | undefined) => {
    if (!path) return 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image'
    if (path.startsWith('http')) return path
    return `${API_BASE}${path}`
}

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

const fetchProfile = async () => {
    const id = route.params.id
    if (!id) return

    try {
        isLoading.value = true

        const [profileRes, awardRes] = await Promise.all([
            axios.get<ArtisanResponse[]>(`${API_BASE}/artisan/profile/${id}`),
            axios.get<Award[]>(`${API_BASE}/award/get-award-page/${id}`)
        ])

        const profileData = profileRes.data
        if (profileData && profileData.length > 0) {
            artisan.value = profileData[0]!

            // 3. ปรับ Logic การ Map ข้อมูล
            // กรองเฉพาะที่มี url และ map เอาทั้ง product_id และ image_url
            galleryImages.value = profileData
                .filter(item => item.image_url)
                .map(item => ({
                    id: item.gallery_id, // ใช้ gallery_id จาก API
                    url: item.image_url
                }))
        }

        if (awardRes.data) {
            awards.value = awardRes.data
        }

    } catch (error) {
        console.error('Error fetching data:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchProfile()
})
</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans text-slate-800">
        <Navbar />

        <div v-if="isLoading" class="flex justify-center items-center h-screen">
            <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-slate-900"></div>
        </div>

        <main v-else-if="artisan" class="container mx-auto px-4 py-8 md:py-16 max-w-6xl">

            <section class="mb-20">
                <div class="rounded-xl shadow-lg border border-gray-100 overflow-hidden bg-white">
                    <div class="flex flex-col lg:flex-row">
                        <div class="w-full lg:w-2/5 h-96 lg:h-auto relative">
                            <img :src="getFullImageUrl(artisan.profile_img)" :alt="artisan.fname"
                                class="absolute inset-0 w-full h-full object-cover">
                            <div
                                class="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/30 to-transparent">
                            </div>
                        </div>

                        <div class="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                            <div class="mb-6">
                                <div
                                    class="inline-block px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium mb-4">
                                    ปราชญ์ชาวบ้าน
                                </div>
                            </div>

                            <h1 class="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                                คุณ{{ artisan.fname }} {{ artisan.lname }}
                            </h1>

                            <div class="space-y-3 text-slate-600">
                                <div class="flex items-center space-x-3 text-lg font-medium">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>อ.{{ artisan.district }} จ.{{ artisan.province }}</span>
                                </div>

                                <div class="flex items-center space-x-3 text-lg font-medium" v-if="artisan.phone">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{{ artisan.phone }}</span>
                                </div>

                                <div class="flex items-center space-x-3 text-lg">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                    </svg>
                                    <span class="font-medium">{{ artisan.category_name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="mb-20">
                <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div class="flex flex-col lg:flex-row">
                        <div class="w-full lg:w-2/5 h-80 lg:h-auto relative">
                            <img :src="galleryImages.length > 0 && galleryImages[0] ? getFullImageUrl(galleryImages[0].url) : 'https://placehold.co/800x600/cbd5e1/475569?text=No+Image'"
                                alt="Story Cover" class="absolute inset-0 w-full h-full object-cover">
                            <div
                                class="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/40 to-transparent">
                            </div>
                        </div>

                        <div class="flex-1 p-8 md:p-12 lg:p-16">
                            <div class="mb-6">
                                <div class="inline-block h-1 w-20 bg-slate-900 mb-4"></div>
                                <h2 class="text-3xl md:text-4xl font-bold text-slate-900">
                                    เส้นทางภูมิปัญญา
                                </h2>
                            </div>

                            <div class="prose prose-lg max-w-none">
                                <p class="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                                    {{ artisan.biography || 'ไม่มีข้อมูลประวัติ' }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section v-if="awards.length > 0" class="mb-20">
                <div class="mb-10">
                    <div class="inline-block h-1 w-20 bg-yellow-500 mb-4"></div>
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                        รางวัลและความภาคภูมิใจ
                    </h2>
                    <p class="text-slate-500 text-lg">การันตีความเชี่ยวชาญด้วยรางวัลที่ได้รับ</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="award in awards" :key="award.award_id"
                        class="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <div class="h-48 overflow-hidden rounded-lg mb-4 bg-gray-50 border border-gray-100 relative">
                            <img :src="getFullImageUrl(award.file_url)" :alt="award.award_title"
                                class="w-full h-full object-contain p-2">
                        </div>
                        <div class="flex-1 flex flex-col">
                            <h3 class="font-bold text-lg text-slate-800 mb-2 line-clamp-2">
                                {{ award.award_title }}
                            </h3>
                            <div class="flex items-center text-slate-500 text-sm mb-2">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>ได้รับเมื่อ: {{ formatDate(award.received_date) }}</span>
                            </div>
                            <p class="text-slate-600 text-sm leading-relaxed line-clamp-3">
                                รายละเอียด: {{ award.award_description || "ไม่มีรายละเอียดเพิ่มเติม" }}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section v-if="galleryImages.length > 0">
                <div class="mb-10">
                    <div class="inline-block h-1 w-20 bg-slate-900 mb-4"></div>
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                        ผลงานและงานฝีมือ
                    </h2>
                    <p class="text-slate-500 text-lg">ผลงานจากฝีมือและความทุ่มเทของปราชญ์</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <NuxtLink v-for="(product, index) in galleryImages" :key="index" :to="`/product/${product.id}`"
                        class="group cursor-pointer transform hover:-translate-y-2 transition-all duration-300">
                        <div class="relative overflow-hidden rounded-2xl shadow-lg bg-white aspect-[4/3]">
                            <img :src="getFullImageUrl(product.url)" :alt="`${artisan.category_name} ${index + 1}`"
                                class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <h3 class="text-white font-semibold text-xl mb-1">{{ artisan.category_name }}</h3>
                                <p class="text-slate-200 text-sm">ชิ้นที่ {{ index + 1 }}</p>
                            </div>
                        </div>
                    </NuxtLink>
                </div>
            </section>
        </main>

        <div v-else class="flex justify-center items-center h-screen">
            <div class="text-center">
                <svg class="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-slate-500 text-xl font-medium">ไม่พบข้อมูลปราชญ์ชาวบ้าน</p>
            </div>
        </div>

        <Footer />
    </div>
</template>