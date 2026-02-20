<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'admin-log']
})
useSeoMeta({
  title: 'Wisdom Artisan - เพิ่มหมวดหมู่ใหม่',
  ogTitle: 'Wisdom Artisan - เพิ่มหมวดหมู่ใหม่',
  description: 'Dashboard สำหรับผู้ดูแลระบบฐานข้อมูลปราชญ์ชาวบ้าน',
})
const form = ref({
    name: '',
    description: ''
})

const errors = ref({
    name: '',
    description: ''
})

const isSubmitting = ref(false)

const validateForm = () => {
    let isValid = true
    errors.value = { name: '', description: '' }

    if (!form.value.name.trim()) {
        errors.value.name = 'กรุณากรอกชื่อหมวดหมู่'
        isValid = false
    }

    if (!form.value.description.trim()) {
        errors.value.description = 'กรุณากรอกรายละเอียดหมวดหมู่'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    isSubmitting.value = true

    try {
        console.log('ข้อมูลที่ส่ง:', form.value)

        await axios.post("http://localhost:4000/category/add", {
            category_name: form.value.name,
            description: form.value.description,
        },
    {
        withCredentials: true
    })

        await new Promise(resolve => setTimeout(resolve, 1000))

        navigateTo('/admin/category')
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error)
        alert('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="font-sans text-slate-800 p-6 min-h-screen bg-gray-50">
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center justify-between mb-6">
                <div class="text-sm text-slate-500">
                    Admin Dashboard / จัดการหมวดหมู่งานฝีมือ / 
                    <span class="font-medium text-slate-700">เพิ่มหมวดหมู่ใหม่</span>
                </div>
            </div>

            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-2xl font-bold text-slate-900">เพิ่มหมวดหมู่ใหม่</h1>
                    <p class="text-slate-500 text-sm mt-1">กรอกชื่อ และคำอธิบายหมวดหมู่</p>
                </div>
                <div class="flex items-center gap-3">
                    <NuxtLink to="/admin/category"
                        class="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-slate-600 text-sm font-medium hover:bg-gray-50 transition">
                        ยกเลิก
                    </NuxtLink>
                    <button 
                        type="button"
                        @click="handleSubmit"
                        :disabled="isSubmitting"
                        class="flex items-center gap-2 bg-[#428a4a] hover:bg-[#367c3d] text-white px-4 py-2 rounded-lg shadow-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกหมวดหมู่' }}
                    </button>
                </div>
            </div>

            <!-- Form Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- ชื่อหมวดหมู่ -->
                    <div>
                        <label for="name" class="block text-sm font-medium text-slate-700 mb-2">
                            ชื่อหมวดหมู่ <span class="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            v-model="form.name"
                            type="text"
                            placeholder="เช่น งานไม้แกะสลัก, งานทอผ้า, งานเครื่องปั้นดินเผา"
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#428a4a] focus:border-transparent outline-none transition"
                            :class="{ 'border-red-500': errors.name }"
                        />
                        <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
                    </div>

                    <!-- รายละเอียดหมวดหมู่ -->
                    <div>
                        <label for="description" class="block text-sm font-medium text-slate-700 mb-2">
                            รายละเอียดหมวดหมู่ <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            v-model="form.description"
                            rows="5"
                            placeholder="อธิบายรายละเอียดของหมวดหมู่งานฝีมือนี้..."
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#428a4a] focus:border-transparent outline-none transition resize-none"
                            :class="{ 'border-red-500': errors.description }"
                        ></textarea>
                        <p v-if="errors.description" class="mt-1 text-sm text-red-500">{{ errors.description }}</p>
                        <p class="mt-1 text-sm text-slate-500">
                            อธิบายลักษณะเด่น วิธีการผลิต หรือความเป็นมาของหมวดหมู่งานฝีมือนี้
                        </p>
                    </div>

                    <!-- Info Box -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="text-blue-500 flex-shrink-0 mt-0.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div class="text-sm text-blue-700">
                            <p class="font-medium mb-1">คำแนะนำในการกรอกข้อมูล</p>
                            <ul class="list-disc list-inside space-y-1 text-blue-600">
                                <li>ตั้งชื่อหมวดหมู่ให้ชัดเจนและเข้าใจง่าย</li>
                                <li>อธิบายรายละเอียดที่ช่วยให้ช่างฝีมือเข้าใจว่าหมวดหมู่นี้เหมาะสมกับงานของตน</li>
                                <li>ตรวจสอบความถูกต้องก่อนบันทึกข้อมูล</li>
                            </ul>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>