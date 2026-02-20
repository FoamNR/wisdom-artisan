<script setup lang="ts">
import axios from 'axios'

interface Profile {
    fname: string
    lname: string
    profile_img: string
    role_name: string
}

defineEmits(['close'])
const route = useRoute()

const profile = useState<Profile | null>("profile", () => null)

// 1. ตัวแปรสำหรับควบคุมการแสดงผล Popup Logout
const showLogoutModal = ref(false)

// --- ส่วนจัดการ URL รูปภาพ ---
const getImageUrl = (path: string | undefined) => {
    if (!path) return 'https://cdn-icons-png.flaticon.com/512/74/74464.png'
    if (path.startsWith('http')) return path 
    const cleanPath = path.startsWith('/') ? path.substring(1) : path
    return `http://localhost:4000/${cleanPath}`
}

// --- [ใหม่] ฟังก์ชันสำหรับดาวน์โหลด Log ---
const downloadLog = (type: 'visit' | 'audit') => {
    // ใช้ window.open เพื่อเรียก GET request ไปยัง backend ให้ browser ดาวน์โหลดไฟล์
    // ตรวจสอบ path ให้ตรงกับ Backend Router ที่คุณสร้างไว้
    const url = `http://localhost:4000/log/export-${type}-logs`
    window.open(url, '_blank')
}
// -------------------------------------

const getProfile = async () => {
    try {
        const { data } = await axios.get("http://localhost:4000/auth/me", {
            withCredentials: true
        })
        profile.value = data
    } catch (err) {
        console.log(err)
    }
}

onMounted(() => {
    getProfile()
})

const confirmLogout = async () => {
    try {
        await axios.post('http://localhost:4000/auth/logout', {}, {
            withCredentials: true
        })
    } catch (error) {
        console.error('Logout API Error:', error)
    } finally {
        const token = useCookie('access_token')
        token.value = null
        showLogoutModal.value = false 
        await navigateTo('/login', { replace: true })
    }
}
</script>

<template>
    <aside class="flex flex-col h-full bg-white border-r border-gray-100 relative">

        <button @click="$emit('close')" class="absolute top-4 right-4 text-slate-400 hover:text-red-500 lg:hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>

        <div class="p-6 pb-8">
            <NuxtLink to="/">
            <div class="flex items-center gap-3">
                <div class="text-emerald-500">
                    <svg xmlns="favicon.ico" width="32" height="32" viewBox="0 0 24 24"
                        fill="currentColor">
                        <path
                            d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                    </svg>
                </div>
                <h1 class="font-bold text-xl text-slate-700 tracking-tight">ปราชญ์ชาวบ้าน</h1>
            </div>
            </NuxtLink>
        </div>

        <div class="px-6 mb-8">
            <div class="flex items-center gap-3">
                <img :src="getImageUrl(profile?.profile_img)"
                    class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                    <div class="font-bold text-sm text-slate-800">{{ profile?.role_name }}</div>
                    <div class="text-xs text-slate-400">
                        {{ profile?.fname }} {{ profile?.lname }}
                    </div>
                </div>
            </div>
        </div>

        <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
            <NuxtLink to="/admin" :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition',
                route.path === '/admin'
                    ? 'bg-emerald-50 text-emerald-600 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            ]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                ภาพรวม
            </NuxtLink>

            <NuxtLink v-if="profile?.role_name === 'แอดมิน'" to="/admin/useradmin" :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition',
                route.path === '/admin/useradmin' || route.path === '/admin/add-user'
                    ? 'bg-emerald-50 text-emerald-600 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            ]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                จัดผู้ดูแลระบบ
            </NuxtLink>
            
            <NuxtLink to="/admin/artisan" :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition',
                route.path === '/admin/artisan' || route.path === '/admin/addartisan' || route.path === '/admin/profileartisan' || route.path.startsWith('/admin/edit-artisan/')
                    ? 'bg-emerald-50 text-emerald-600 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            ]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                จัดการปราชญ์
            </NuxtLink>

            <NuxtLink to="/admin/category" :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition',
                route.path === '/admin/category' || route.path === '/admin/addcategory'
                    ? 'bg-emerald-50 text-emerald-600 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            ]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                จัดการงานฝีมือ
            </NuxtLink>
            <NuxtLink to="/admin/gallery" :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition',
                route.path === '/admin/gallery' || route.path === '/admin/addgallery' || route.path.startsWith('/admin/edit-gallery/')
                    ? 'bg-emerald-50 text-emerald-600 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            ]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                จัดการแกลเลอรี่
            </NuxtLink>
           <!--  <NuxtLink to="/admin/report" :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition',
                route.path === '/admin/report'
                    ? 'bg-emerald-50 text-emerald-600 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            ]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="20" x2="12" y2="10"></line>
                    <line x1="18" y1="20" x2="18" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
                รายงาน
            </NuxtLink> -->


            </nav>

        <div class="p-4 border-t border-gray-100 mt-auto">
            <button @click="showLogoutModal = true"
                class="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 transition w-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                ออกจากระบบ
            </button>
        </div>

        <Teleport to="body">
            <div v-if="showLogoutModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                    @click="showLogoutModal = false"></div>

                <div
                    class="bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 overflow-hidden transform transition-all scale-100">
                    <div class="p-6 text-center">
                        <div
                            class="w-16 h-16 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                <line x1="12" y1="2" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-2">ยืนยันการออกจากระบบ</h3>
                        <p class="text-slate-500 text-sm px-4">
                            คุณต้องการออกจากระบบและกลับไปยังหน้าเข้าสู่ระบบใช่หรือไม่?</p>
                    </div>

                    <div class="flex border-t border-gray-100 bg-gray-50/50">
                        <button @click="showLogoutModal = false"
                            class="w-1/2 px-4 py-4 text-slate-600 hover:bg-white hover:text-slate-800 font-medium transition duration-200 border-r border-gray-100">
                            ยกเลิก
                        </button>
                        <button @click="confirmLogout"
                            class="w-1/2 px-4 py-4 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition duration-200">
                            ยืนยัน
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </aside>
</template>