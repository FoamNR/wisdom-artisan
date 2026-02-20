<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'admin-log']
});

useSeoMeta({
    title: 'Wisdom Artisan - เพิ่มผลงานใหม่',
});

const router = useRouter();
const baseUrl = 'http://localhost:4000';

// Interface
interface ArtisanOption {
    artisan_id: number;
    fname: string;
    lname: string;
}

// State
const form = ref({
    name_gallery: '',
    caption: '',
    artisan_id: '' as string | number
});

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const artisans = ref<ArtisanOption[]>([]);
const isSubmitting = ref(false);

// --- Modal State & Helper ---
const modal = ref({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: '',
    onConfirm: null as (() => void) | null
});

const showModal = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'success', callback: (() => void) | null = null) => {
    modal.value.title = title;
    modal.value.message = message;
    modal.value.type = type;
    modal.value.onConfirm = callback;
    modal.value.isOpen = true;
};

const closeModal = () => {
    modal.value.isOpen = false;
    if (modal.value.onConfirm) {
        modal.value.onConfirm();
        modal.value.onConfirm = null;
    }
};

// โหลดรายชื่อปราชญ์
onMounted(async () => {
    try {
        const res = await axios.get(`${baseUrl}/artisan`, { withCredentials: true });
        artisans.value = res.data; 
    } catch (error) {
        console.error("Error loading artisans:", error);
    }
});

// จัดการไฟล์รูปภาพ
const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        const file = target.files[0];
        if (file.size > 5 * 1024 * 1024) {
            // เปลี่ยน alert เป็น Modal Warning
            showModal("แจ้งเตือน", "ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB", "warning");
            target.value = ''; // Clear input
            return;
        }
        imageFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
};

const removeImage = () => {
    imageFile.value = null;
    imagePreview.value = null;
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) input.value = '';
};

// --- ฟังก์ชันบันทึกข้อมูล ---
const submitForm = async () => {
    // 1. Validation (เปลี่ยน alert เป็น showModal)
    if (!imageFile.value) {
        showModal("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกรูปภาพผลงาน", "warning");
        return;
    }
    if (!form.value.name_gallery.trim()) {
        showModal("ข้อมูลไม่ครบถ้วน", "กรุณากรอกชื่อผลงาน", "warning");
        return;
    }
    if (!form.value.artisan_id) {
        showModal("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกเจ้าของผลงาน (ปราชญ์)", "warning");
        return;
    }

    isSubmitting.value = true;

    try {
        const formData = new FormData();
        formData.append('image', imageFile.value);
        formData.append('name_gallery', form.value.name_gallery);
        formData.append('caption', form.value.caption || '');
        
        const targetUrl = `${baseUrl}/gallery/${form.value.artisan_id}/add`;

        await axios.post(targetUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
        });

        // สำเร็จ: แสดง Modal -> กด OK แล้วค่อย Redirect
        showModal(
            "บันทึกสำเร็จ", 
            "เพิ่มรูปภาพผลงานเรียบร้อยแล้ว", 
            "success", 
            () => router.push('/admin/gallery')
        );

    } catch (error: any) {
        console.error("Error submitting form:", error);
        const serverMsg = error?.response?.data?.message;
        // Error: แสดง Modal สีแดง
        showModal("เกิดข้อผิดพลาด", serverMsg || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่", "error");
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="font-sans text-slate-800 p-6 min-h-screen relative">
        <div class="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <NuxtLink to="/admin/dashboard" class="hover:text-green-600 transition">Admin Dashboard</NuxtLink>
            <span>/</span>
            <NuxtLink to="/admin/gallery" class="hover:text-green-600 transition">จัดการแกลเลอรี่ผลงาน</NuxtLink>
            <span>/</span>
            <span class="font-medium text-slate-700">เพิ่มผลงานใหม่</span>
        </div>

        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-2xl font-bold text-slate-900">เพิ่มผลงานใหม่</h1>
                <p class="text-slate-500 text-sm mt-1">กรอกข้อมูลและอัปโหลดรูปภาพผลงานของปราชญ์ชาวบ้าน</p>
            </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
            <div class="p-6 md:p-8 space-y-8">
                
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-3">รูปภาพผลงาน <span class="text-red-500">*</span></label>
                    <div class="flex justify-center items-center w-full">
                        <label v-if="!imagePreview" for="image-upload" 
                            class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition relative overflow-hidden group">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                <div class="p-3 bg-green-100 rounded-full mb-3 group-hover:scale-110 transition duration-300">
                                    <svg class="w-8 h-8 text-green-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                </div>
                                <p class="mb-2 text-sm text-gray-500"><span class="font-semibold text-green-600">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวางที่นี่</p>
                                <p class="text-xs text-gray-400">PNG, JPG, JPEG (ขนาดไม่เกิน 5MB)</p>
                            </div>
                            <input id="image-upload" type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
                        </label>

                        <div v-else class="relative w-full h-auto rounded-lg overflow-hidden border border-gray-200 group">
                            <img :src="imagePreview" class="w-full h-96 object-contain bg-slate-50" alt="Preview" />
                            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                                <label for="image-upload" class="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                                    เปลี่ยนรูป
                                </label>
                                <button type="button" @click="removeImage" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                                    ลบรูป
                                </button>
                            </div>
                            <input id="image-upload" type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
                        </div>
                    </div>
                </div>

                <hr class="border-gray-100">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="col-span-2 md:col-span-1">
                        <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อผลงาน <span class="text-red-500">*</span></label>
                        <input v-model="form.name_gallery" type="text" placeholder="เช่น เครื่องจักสานไม้ไผ่ลายขิด"
                            class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-slate-700 placeholder-slate-400">
                    </div>

                    <div class="col-span-2 md:col-span-1">
                        <label class="block text-sm font-medium text-slate-700 mb-1">เจ้าของผลงาน (ปราชญ์) <span class="text-red-500">*</span></label>
                        <div class="relative">
                            <select v-model="form.artisan_id" 
                                class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-slate-700 appearance-none cursor-pointer">
                                <option value="" disabled>-- เลือกรายชื่อปราชญ์ --</option>
                                <option v-for="artisan in artisans" :key="artisan.artisan_id" :value="artisan.artisan_id">
                                    {{ artisan.fname }} {{ artisan.lname }}
                                </option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">คำอธิบายเพิ่มเติม</label>
                        <textarea v-model="form.caption" rows="4" placeholder="รายละเอียดเกี่ยวกับผลงาน..."
                            class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-slate-700 placeholder-slate-400 resize-none"></textarea>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                    <NuxtLink to="/admin/gallery" 
                        class="px-6 py-2.5 bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                        ยกเลิก
                    </NuxtLink>
                    <button @click="submitForm" :disabled="isSubmitting"
                        class="px-6 py-2.5 bg-[#428a4a] text-white rounded-lg hover:bg-[#367c3d] text-sm font-medium transition disabled:opacity-50 flex items-center gap-2">
                        <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                        {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
                    </button>
                </div>

            </div>
        </div>

        <div v-if="modal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/50 transition-opacity" @click="closeModal"></div>
            
            <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
                
                <div class="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4"
                    :class="{
                        'bg-green-100': modal.type === 'success',
                        'bg-red-100': modal.type === 'error',
                        'bg-orange-100': modal.type === 'warning'
                    }">
                    <svg v-if="modal.type === 'success'" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-if="modal.type === 'error'" class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <svg v-if="modal.type === 'warning'" class="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h3 class="text-lg font-bold text-slate-900 mb-2">{{ modal.title }}</h3>
                <p class="text-sm text-slate-600 mb-6">{{ modal.message }}</p>

                <button @click="closeModal" 
                    class="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition"
                    :class="{
                        'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500': modal.type === 'success',
                        'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500': modal.type === 'error',
                        'bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-500': modal.type === 'warning'
                    }">
                    ตกลง
                </button>
            </div>
        </div>

    </div>
</template>