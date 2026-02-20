<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-log'] })

const API_BASE_URL = "http://localhost:4000"

interface Users {
    user_id: number
    username: string
    fname: string
    lname: string
    profile_img: string | null
    phone_number: string
    role: string
}

const users = ref<Users[]>([])
const searchQuery = ref('')
const roleFilter = ref('')

// --- State สำหรับ Modals ใหม่ (NEW) ---
// 1. Notification Modal (Success/Error)
const notification = ref({
    isOpen: false,
    type: 'success', // 'success' | 'error'
    title: '',
    message: ''
})

const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    notification.value = { isOpen: true, type, title, message }
}

const closeNotification = () => {
    notification.value.isOpen = false
}

// 2. Delete Confirmation Modal
const deleteModal = ref({
    isOpen: false,
    userId: null as number | null,
    isDeleting: false
})

const openDeleteModal = (id: number) => {
    deleteModal.value = { isOpen: true, userId: id, isDeleting: false }
}

const closeDeleteModal = () => {
    deleteModal.value = { isOpen: false, userId: null, isDeleting: false }
}

// --- จบส่วน State Modals ใหม่ ---

// --- ส่วนจัดการ Modal Edit (Existing) ---
const isEditModalOpen = ref(false)
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const previewImage = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const editForm = ref({
    user_id: 0,
    username: '',
    password: '',
    fname: '',
    lname: '',
    phone_number: '',
    role: 'editor',
    profile_img: '' as string | null
})

const openEditModal = (user: Users) => {
    editForm.value = {
        user_id: user.user_id,
        username: user.username,
        password: '',
        fname: user.fname,
        lname: user.lname,
        phone_number: user.phone_number,
        role: user.role,
        profile_img: user.profile_img
    }
    previewImage.value = getUserImage(user)
    selectedFile.value = null
    isEditModalOpen.value = true
}

const closeEditModal = () => {
    isEditModalOpen.value = false
    selectedFile.value = null
    previewImage.value = null
}

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        const file = target.files[0]
        selectedFile.value = file
        previewImage.value = URL.createObjectURL(file)
    }
}

// บันทึกการแก้ไข (ปรับปรุงให้ใช้ Custom Modal แทน Alert)
const saveUser = async () => {
    if (!editForm.value.user_id) return
    isSubmitting.value = true

    try {
        const formData = new FormData()
        formData.append('username', editForm.value.username)
        formData.append('fname', editForm.value.fname)
        formData.append('lname', editForm.value.lname)
        formData.append('role', editForm.value.role)
        formData.append('phone_number', editForm.value.phone_number)
        
        if (editForm.value.password) {
            formData.append('password', editForm.value.password)
        }

        if (selectedFile.value) {
            formData.append('profile_img', selectedFile.value)
        } else {
             if(editForm.value.profile_img) {
                 formData.append('profile_img', editForm.value.profile_img)
             }
        }

        const { data } = await axios.patch(`${API_BASE_URL}/admin/users/${editForm.value.user_id}`, formData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        const index = users.value.findIndex(u => u.user_id === editForm.value.user_id)
        if (index !== -1) {
            users.value[index] = data.user
        }

        closeEditModal()
        // แสดง Modal สำเร็จ
        showNotification('success', 'บันทึกสำเร็จ', 'ข้อมูลผู้ใช้งานได้รับการอัปเดตเรียบร้อยแล้ว')

    } catch (err: any) {
        console.error("Update error:", err)
        // แสดง Modal Error
        showNotification('error', 'เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถบันทึกข้อมูลได้')
    } finally {
        isSubmitting.value = false
    }
}

// --- Utility Functions ---
const getUserImage = (user: Users | any) => {
    if (!user.profile_img) return getDefaultAvatar(user.fname, user.lname)
    if (user.profile_img.startsWith('http')) return user.profile_img
    const path = user.profile_img.startsWith('/') ? user.profile_img : `/${user.profile_img}`
    return `${API_BASE_URL}${path}`
}

const getDefaultAvatar = (fname: string, lname: string) => {
    const name = encodeURIComponent(`${fname || ''} ${lname || ''}`.trim())
    return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128&font-size=0.5`
}

const handleImageError = (event: Event, user: Users) => {
    const target = event.target as HTMLImageElement
    target.src = getDefaultAvatar(user.fname, user.lname)
}

const loadUsers = async () => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/admin/users`, { withCredentials: true })
        users.value = data
    } catch (err) {
        console.error("Load users error:", err)
    }
}

onMounted(() => {
    loadUsers()
})

const filteredUsers = computed(() => {
    return users.value.filter(user => {
        const search = searchQuery.value.toLowerCase()
        const matchesSearch =
            user.fname.toLowerCase().includes(search) ||
            user.lname.toLowerCase().includes(search) ||
            user.username.toLowerCase().includes(search)
        const matchesRole = roleFilter.value ? user.role === roleFilter.value : true
        return matchesSearch && matchesRole
    })
})

const getRoleBadge = (role: string) => {
    if (role === 'super_admin') return 'bg-purple-100 text-purple-700'
    if (role === 'editor') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-600'
}

const getRoleText = (role: string) => {
    if (role === 'super_admin') return 'ผู้ดูแลระบบสูงสุด'
    if (role === 'editor') return 'ผู้แก้ไขข้อมูล'
    return 'ไม่ระบุ'
}

// ฟังก์ชันลบจริง (เรียกเมื่อกดยืนยันใน Modal)
const confirmDeleteUser = async () => {
    if (!deleteModal.value.userId) return
    
    deleteModal.value.isDeleting = true
    try {
        await axios.delete(`${API_BASE_URL}/admin/users/${deleteModal.value.userId}`, { withCredentials: true })
        
        // อัปเดต List
        users.value = users.value.filter(user => user.user_id !== deleteModal.value.userId)
        
        closeDeleteModal()
        showNotification('success', 'ลบข้อมูลสำเร็จ', 'ผู้ใช้งานถูกลบออกจากระบบเรียบร้อยแล้ว')
        
    } catch (err: any) {
        closeDeleteModal()
        showNotification('error', 'เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถลบข้อมูลได้')
    }
}
</script>

<template>
    <div class="font-sans text-slate-800 p-4 md:p-8 min-h-screen bg-slate-50">

        <div class="flex items-center justify-between mb-6">
            <div class="text-sm text-slate-500">
                Admin Dashboard / <span class="font-medium text-slate-700">ผู้ดูแลระบบ</span>
            </div>
        </div>

        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight">จัดการผู้ดูแลระบบ</h1>
                <p class="text-slate-500 mt-2 text-sm">จัดการบัญชีผู้ใช้ สิทธิ์การเข้าถึง และข้อมูลส่วนตัว</p>
            </div>

            <NuxtLink to="/admin/add-user"
                class="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                เพิ่มผู้ดูแล
            </NuxtLink>
        </div>

        <div class="flex flex-col md:flex-row gap-3 mb-6">
            <div class="relative flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </span>
                <input v-model="searchQuery" type="text" placeholder="ค้นหาจากชื่อ, Username..."
                    class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm">
            </div>
            <div class="relative w-full md:w-48">
                <select v-model="roleFilter"
                    class="w-full appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-green-500 cursor-pointer">
                    <option value="">ทุกสิทธิ์การใช้งาน</option>
                    <option value="super_admin">ผู้ดูแลระบบสูงสุด</option>
                    <option value="editor">ผู้แก้ไขข้อมูล</option>
                </select>
            </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                            <th class="px-6 py-4">ผู้ใช้งาน</th>
                            <th class="px-6 py-4">Username</th>
                            <th class="px-6 py-4">เบอร์โทรศัพท์</th>
                            <th class="px-6 py-4">สิทธิ์การใช้งาน</th>
                            <th class="px-6 py-4 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="u in filteredUsers" :key="u.user_id" class="group hover:bg-gray-50/80 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-3">
                                    <div class="relative">
                                        <img :src="getUserImage(u)" @error="handleImageError($event, u)"
                                            class="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm bg-gray-50">
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="font-semibold text-slate-700 text-sm">{{ u.fname }} {{ u.lname }}</span>
                                        <span class="text-xs text-slate-400">ID: {{ u.user_id }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-slate-600 text-sm font-medium">{{ u.username }}</td>
                            <td class="px-6 py-4 text-slate-500 text-sm font-mono">{{ u.phone_number }}</td>
                            <td class="px-6 py-4">
                                <span :class="`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${getRoleBadge(u.role).replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-').replace('bg-', 'ring-')}`" class="bg-opacity-10">
                                    <span :class="getRoleBadge(u.role)" class="px-2 py-1 rounded-md bg-opacity-20 border-0">{{ getRoleText(u.role) }}</span>
                                </span>
                            </td>
                            
                            <td class="px-6 py-4 text-right whitespace-nowrap">
                                <div class="flex justify-end gap-2">
                                    <button @click="openEditModal(u)"
                                        class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="แก้ไขข้อมูล">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
                                        </svg>
                                    </button>

                                    <button @click="openDeleteModal(u.user_id)"
                                        class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="ลบผู้ใช้งาน">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4 a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="closeEditModal"></div>

            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative z-10 animate-fade-in-up">
                
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <h3 class="text-lg font-bold text-slate-800">แก้ไขข้อมูลผู้ใช้งาน</h3>
                    <button @click="closeEditModal" class="text-slate-400 hover:text-slate-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div class="p-6 max-h-[80vh] overflow-y-auto">
                    <form @submit.prevent="saveUser" class="space-y-6">
                        
                        <div class="flex items-center gap-6">
                            <div class="relative group">
                                <img :src="previewImage || getDefaultAvatar('User', 'Name')" 
                                     class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md">
                                <button type="button" @click="($refs.fileInput as HTMLInputElement).click()" 
                                        class="absolute bottom-0 right-0 bg-white border border-gray-200 p-1.5 rounded-full shadow-sm text-slate-600 hover:text-green-600 hover:border-green-500 transition-all">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                </button>
                                <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange">
                            </div>
                            <div>
                                <h4 class="font-medium text-slate-700">รูปโปรไฟล์</h4>
                                <p class="text-sm text-slate-500 mt-1">อนุญาตเฉพาะไฟล์ JPG, PNG หรือ GIF</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="col-span-1 md:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <input v-model="editForm.username" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อจริง</label>
                                <input v-model="editForm.fname" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">นามสกุล</label>
                                <input v-model="editForm.lname" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                                <input v-model="editForm.phone_number" type="tel" 
                                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">สิทธิ์การใช้งาน</label>
                                <select v-model="editForm.role" 
                                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all bg-white">
                                    <option value="super_admin">ผู้ดูแลระบบสูงสุด</option>
                                    <option value="editor">ผู้แก้ไขข้อมูล</option>
                                </select>
                            </div>

                            <div class="col-span-1 md:col-span-2 pt-2 border-t border-gray-100">
                                <label class="block text-sm font-medium text-slate-700 mb-1">เปลี่ยนรหัสผ่าน <span class="text-xs text-slate-400 font-normal">(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</span></label>
                                <input v-model="editForm.password" type="password" placeholder="ตั้งรหัสผ่านใหม่..."
                                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all">
                            </div>
                        </div>

                        <div class="flex justify-end gap-3 pt-4">
                            <button type="button" @click="closeEditModal"
                                class="px-5 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors">
                                ยกเลิก
                            </button>
                            <button type="submit" :disabled="isSubmitting"
                                class="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                <svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div v-if="deleteModal.isOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="closeDeleteModal"></div>
            <div class="bg-white rounded-xl shadow-xl w-full max-w-sm relative z-10 animate-fade-in-up p-6 text-center">
                <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-2">ยืนยันการลบ?</h3>
                <p class="text-slate-500 text-sm mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้? <br>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                <div class="flex gap-3 justify-center">
                     <button @click="closeDeleteModal" :disabled="deleteModal.isDeleting"
                        class="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors w-full">
                        ยกเลิก
                    </button>
                    <button @click="confirmDeleteUser" :disabled="deleteModal.isDeleting"
                        class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all active:scale-95 w-full flex items-center justify-center gap-2">
                        <svg v-if="deleteModal.isDeleting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        {{ deleteModal.isDeleting ? 'กำลังลบ...' : 'ลบข้อมูล' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="notification.isOpen" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" @click="closeNotification"></div>
            <div class="bg-white rounded-xl shadow-xl w-full max-w-sm relative z-10 animate-fade-in-up p-6 text-center">
                
                <div v-if="notification.type === 'success'" class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div v-else class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>

                <h3 class="text-lg font-bold text-slate-800 mb-2">{{ notification.title }}</h3>
                <p class="text-slate-500 text-sm mb-6">{{ notification.message }}</p>
                
                <button @click="closeNotification"
                    class="px-4 py-2 rounded-lg w-full font-medium shadow-sm transition-all active:scale-95 text-white"
                    :class="notification.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'">
                    ตกลง
                </button>
            </div>
        </div>

    </div>
</template>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-up {
    animation: fadeInUp 0.3s ease-out forwards;
}
</style>