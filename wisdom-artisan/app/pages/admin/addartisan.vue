<script setup>
import axios from 'axios'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-log']
})
useSeoMeta({
  title: 'Wisdom Artisan - จัดการข้อมูลปราชญ์ชาวบ้าน',
  ogTitle: 'Wisdom Artisan - จัดการข้อมูลปราชญ์ชาวบ้าน',
  description: 'Dashboard สำหรับผู้ดูแลระบบฐานข้อมูลปราชญ์ชาวบ้าน',
})

const api = axios.create({
  baseURL: 'http://localhost:4000', 
  withCredentials: true 
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const modal = ref({
    show: false,
    type: 'info',
    title: '',
    message: '',
    confirmCallback: null
})

const showModal = (type, title, message, callback = null) => {
    modal.value = {
        show: true,
        type,
        title,
        message,
        confirmCallback: callback
    }
}

const closeModal = () => {
    modal.value.show = false
    setTimeout(() => {
        modal.value.confirmCallback = null
    }, 200)
}

const handleModalConfirm = () => {
    if (modal.value.confirmCallback) {
        modal.value.confirmCallback()
    }
    if (modal.value.type !== 'confirm') {
        closeModal()
    } else {
        closeModal()
    }
}

// --- 1. เพิ่มตัวแปร latitude และ longitude ใน formData ---
const formData = ref({
  fname: '',
  lname: '',
  birth_date: '',
  address: '',
  province: '',
  district: '',
  phone: '', // เพิ่ม
  category_id: null,
  biography: '',
  status: 'ฉบับร่าง'
})

const galleryItems = ref([])
const awardsItems = ref([])
const categories = ref([])

const profileFile = ref(null)
const profilePreview = ref(null)

const handleProfileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showModal('error', 'ข้อผิดพลาด', 'ขนาดไฟล์ต้องน้อยกว่า 5MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      showModal('error', 'ข้อผิดพลาด', 'ประเภทไฟล์ไม่ถูกต้อง (เฉพาะ jpeg, jpg, png, gif)')
      return
    }

    profileFile.value = file
    profilePreview.value = URL.createObjectURL(file)
  }
}

const removeProfileImage = () => {
  profileFile.value = null
  profilePreview.value = null
  const input = document.getElementById('profileInput')
  if(input) input.value = ''
}

const handleGalleryUpload = (event) => {
  const files = event.target.files
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      galleryItems.value.push({
        file: file,
        preview: URL.createObjectURL(file),
        name_gallery: file.name.split('.')[0], 
        caption: ''
      })
    }
  }
  event.target.value = '' 
}

const removeGalleryItem = (index) => {
  galleryItems.value.splice(index, 1)
}

const handleAwardUpload = (event) => {
  const files = event.target.files
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      const isImage = file.type.startsWith('image/')
      const isPdf = file.type === 'application/pdf'

      if (!isImage && !isPdf) {
         showModal('error', 'ไฟล์ไม่ถูกต้อง', `ไฟล์ ${file.name} ต้องเป็นรูปภาพหรือ PDF เท่านั้น`)
         continue
      }

      awardsItems.value.push({
        file: file,
        preview: URL.createObjectURL(file),
        fileType: isPdf ? 'pdf' : 'image',
        award_title: file.name.split('.')[0],
        received_date: ''
      })
    }
  }
  event.target.value = ''
}

const removeAwardItem = (index) => {
  awardsItems.value.splice(index, 1)
}

const uploadFileService = async (file, isGallery = false) => {
  if (!file) return null
  
  try {
    const fd = new FormData()
    fd.append('file', file)
    if (isGallery) {
      fd.append('isGallery', 'true')
    }

    const res = await api.post('/admin/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (!res.data.path) {
      throw new Error('ไม่ได้รับ path กลับมาจาก server')
    }
    
    return res.data.path

  } catch (err) {
    console.error('Upload Failed:', err)
    const errorMsg = err.response?.data?.message || err.message || 'ไม่สามารถอัปโหลดไฟล์รูปภาพได้'
    throw new Error(errorMsg)
  }
}

const isSubmitting = ref(false)

const confirmSubmit = () => {
  if (!formData.value.fname || !formData.value.lname || !formData.value.category_id || !formData.value.birth_date) {
    showModal('error', 'ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลสำคัญให้ครบ (ชื่อ, นามสกุล, วันเกิด, หมวดหมู่)')
    return
  }

  showModal('confirm', 'ยืนยันการบันทึก', 'คุณต้องการบันทึกข้อมูลปราชญ์ชาวบ้านใช่หรือไม่?', executeSubmit)
}

const executeSubmit = async () => {
  isSubmitting.value = true

  try {
    let profileImgPath = null
    if (profileFile.value) {
        profileImgPath = await uploadFileService(profileFile.value, false)
    }

    // --- 3. เพิ่ม latitude, longitude ใน Payload ---
    const artisanPayload = {
      fname: formData.value.fname,
      lname: formData.value.lname,
      profile_img: profileImgPath, 
      birth_date: formData.value.birth_date,
      address: formData.value.address,
      province: formData.value.province,
      district: formData.value.district,
      phone: formData.value.phone, // เพิ่ม
      category_id: formData.value.category_id,
      biography: formData.value.biography,
      status: formData.value.status
    }

    const response = await api.post('admin/artisan/add', artisanPayload)
    const newArtisanData = response.data.data
    
    if (!newArtisanData || !newArtisanData.artisan_id) {
        throw new Error('บันทึกสำเร็จแต่ไม่ได้รับ ID กลับมา')
    }

    const newArtisanId = newArtisanData.artisan_id

    if (galleryItems.value.length > 0) {
      await Promise.all(galleryItems.value.map(async (item) => {
          const fd = new FormData()
          fd.append('image', item.file)              
          fd.append('name_gallery', item.name_gallery)
          fd.append('caption', item.caption || '')
          
          await api.post(`/gallery/${newArtisanId}/add`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' }
          })
      }))
    }

    if (awardsItems.value.length > 0) {
        await Promise.all(awardsItems.value.map(async (item) => {
            const fd = new FormData()
            fd.append('file_url', item.file) 
            fd.append('award_title', item.award_title)
            fd.append('received_date', item.received_date || new Date().toISOString().split('T')[0])

            await api.post(`/award/add-award/${newArtisanId}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        }))
    }

    showModal('success', 'บันทึกสำเร็จ', 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว', () => {
        navigateTo('/admin/artisan')
    })

  } catch (error) {
    console.error('Submit Error:', error)
    const msg = error.response?.data?.message || error.message
    showModal('error', 'เกิดข้อผิดพลาด', msg)
  } finally {
    isSubmitting.value = false
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await api.get('/artisan/category/list')
    categories.value = data
  } catch (error) {
    console.error('Fetch Categories Error:', error)
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="font-sans text-slate-800 p-6 min-h-screen bg-gray-50/50 relative">
    
    <div class="flex items-center justify-between mb-6">
      <div class="text-sm text-slate-500">
        Admin Dashboard / ปราชญ์ชาวบ้าน / <span class="font-medium text-slate-700">เพิ่มข้อมูลใหม่</span>
      </div>
    </div>

    <form @submit.prevent="confirmSubmit">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">เพิ่มปราชญ์ชาวบ้าน</h1>
          <p class="text-slate-500 text-sm mt-1">กรอกข้อมูลปราชญ์ แกลเลอรี และรางวัล</p>
        </div>
        
        <div class="flex items-center gap-3">
          <NuxtLink to="/admin/artisan" class="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-slate-600 text-sm font-medium hover:bg-gray-50 transition">
            ยกเลิก
          </NuxtLink>
          
          <button type="submit" :disabled="isSubmitting" class="flex items-center gap-2 bg-[#428a4a] hover:bg-[#367c3d] text-white px-4 py-2 rounded-lg shadow-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed">
            <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span v-else class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 class="font-bold text-slate-800 mb-4">รูปโปรไฟล์ (Main)</h3>
            <div class="flex flex-col items-center">
              <div class="relative group">
                <div class="w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md flex items-center justify-center mb-4">
                  <img v-if="profilePreview" :src="profilePreview" class="w-full h-full object-cover">
                  <svg v-else class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <button v-if="profilePreview" @click="removeProfileImage" type="button" class="absolute top-0 right-0 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div class="relative overflow-hidden inline-block">
                <button type="button" class="border border-gray-300 bg-white hover:bg-gray-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                  เลือกรูปโปรไฟล์
                </button>
                <input id="profileInput" type="file" accept="image/*" @change="handleProfileUpload" class="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 class="font-bold text-slate-800 mb-4">สถานะ</h3>
            <div class="space-y-3">
              <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition" :class="{'ring-2 ring-green-500 border-transparent': formData.status === 'เผยแพร่'}">
                <input type="radio" v-model="formData.status" value="เผยแพร่" class="w-4 h-4 text-green-600">
                <span class="ml-3 text-sm font-medium text-slate-900">เผยแพร่</span>
              </label>
              <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition" :class="{'ring-2 ring-gray-400 border-transparent': formData.status === 'ฉบับร่าง'}">
                <input type="radio" v-model="formData.status" value="ฉบับร่าง" class="w-4 h-4 text-gray-500">
                <span class="ml-3 text-sm font-medium text-slate-900">ฉบับร่าง</span>
              </label>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 class="font-bold text-slate-800 mb-6 border-b border-gray-100 pb-3">ข้อมูลทั่วไป</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อจริง <span class="text-red-500">*</span></label>
                <input type="text" v-model="formData.fname" placeholder="ชื่อ" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">นามสกุล <span class="text-red-500">*</span></label>
                <input type="text" v-model="formData.lname" placeholder="นามสกุล" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">วันเกิด <span class="text-red-500">*</span></label>
                <input type="date" v-model="formData.birth_date" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition text-slate-500">
              </div>
              <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่ <span class="text-red-500">*</span></label>
                  <select v-model="formData.category_id" class="w-full border-gray-300 rounded-lg px-3 py-2 border text-slate-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
                    <option :value="null" disabled>เลือกหมวดหมู่</option>
                    <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.category_name }}</option>
                  </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1">ที่อยู่</label>
                <textarea v-model="formData.address" rows="2" placeholder="บ้านเลขที่, หมู่, ซอย, ถนน" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">อำเภอ/เขต</label>
                <input type="text" v-model="formData.district" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">จังหวัด</label>
                <input type="text" v-model="formData.province" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                <input type="text" v-model="formData.phone" placeholder="08x-xxx-xxxx" class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition">
              </div> 




              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1">ประวัติโดยย่อ</label>
                <textarea v-model="formData.biography" rows="4" placeholder="เล่าประวัติความเป็นมา ความเชี่ยวชาญ..." class="w-full border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition"></textarea>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
              <h3 class="font-bold text-slate-800">แกลเลอรีผลงาน</h3>
              <div class="relative overflow-hidden">
                <button type="button" class="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium transition border border-indigo-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  เพิ่มรูปภาพ
                </button>
                <input type="file" multiple accept="image/*" @change="handleGalleryUpload" class="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
            </div>

            <div v-if="galleryItems.length > 0" class="space-y-4">
              <div v-for="(item, index) in galleryItems" :key="index" class="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white transition hover:shadow-sm">
                
                <div class="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 relative group">
                  <img :src="item.preview" class="w-full h-full object-cover">
                </div>

                <div class="flex-grow space-y-3">
                  <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">ชื่อรูปภาพ</label>
                    <input type="text" v-model="item.name_gallery" class="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500">
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">คำอธิบาย</label>
                    <input type="text" v-model="item.caption" placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับรูปนี้" class="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500">
                  </div>
                </div>

                <div class="flex items-start justify-end sm:justify-center">
                  <button @click="removeGalleryItem(index)" type="button" class="text-slate-400 hover:text-red-500 transition p-2 bg-white rounded-full border border-gray-200 hover:border-red-200 shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-slate-400">
              <p class="mt-1 text-sm">ยังไม่มีรูปภาพในแกลเลอรี</p>
            </div>
            
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
              <h3 class="font-bold text-slate-800">รางวัลและผลงานที่ได้รับ</h3>
              <div class="relative overflow-hidden">
                <button type="button" class="flex items-center gap-2 bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-sm font-medium transition border border-amber-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  เพิ่มรางวัล (รูป/PDF)
                </button>
                <input type="file" multiple accept="image/*,application/pdf" @change="handleAwardUpload" class="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
            </div>

            <div v-if="awardsItems.length > 0" class="space-y-4">
              <div v-for="(item, index) in awardsItems" :key="index" class="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white transition hover:shadow-sm">
                
                <div class="w-full sm:w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center relative">
                  <img v-if="item.fileType === 'image'" :src="item.preview" class="w-full h-full object-cover">
                  <div v-else class="text-red-500 flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      <span class="text-[10px] font-bold mt-1">PDF</span>
                  </div>
                </div>

                <div class="flex-grow space-y-3">
                  <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">ชื่อรางวัล/เกียรติบัตร</label>
                    <input type="text" v-model="item.award_title" class="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500">
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">วันที่ได้รับ</label>
                    <input type="date" v-model="item.received_date" class="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500 text-slate-600">
                  </div>
                </div>

                <div class="flex items-start justify-end sm:justify-center">
                  <button @click="removeAwardItem(index)" type="button" class="text-slate-400 hover:text-red-500 transition p-2 bg-white rounded-full border border-gray-200 hover:border-red-200 shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-slate-400">
              <p class="mt-1 text-sm">ยังไม่มีข้อมูลรางวัล</p>
            </div>
          </div>

        </div>
      </div>

    </form>

    <div v-if="modal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="modal.type !== 'confirm' ? closeModal() : null"></div>

        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all animate-fade-in-up">
            <div class="p-6 text-center">
                
                <div v-if="modal.type === 'success'" class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg class="text-green-600 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div v-else-if="modal.type === 'error'" class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <svg class="text-red-600 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
                <div v-else class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <svg class="text-blue-600 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>

                <h3 class="text-lg font-bold text-gray-900 mb-2">{{ modal.title }}</h3>
                <p class="text-sm text-gray-500 mb-6">{{ modal.message }}</p>
                
                <div class="flex items-center justify-center gap-3">
                    <button 
                        v-if="modal.type === 'confirm'"
                        @click="closeModal" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        @click="handleModalConfirm" 
                        :class="[
                            'px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm focus:outline-none transition min-w-[100px]',
                            modal.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
                            modal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 
                            'bg-blue-600 hover:bg-blue-700'
                        ]"
                    >
                        {{ modal.type === 'confirm' ? 'ยืนยัน' : 'ตกลง' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>